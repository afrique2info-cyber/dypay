/*
  # Correction du trigger POS pour le statut 'completed'

  1. Modifications
    - Le trigger POS accepte maintenant le statut 'completed' au lieu de 'success'
    - Les webhooks Monetbil utilisent 'completed' comme statut standard
    - Assure la cohérence entre tous les types de transactions

  2. Sécurité
    - Maintien de la sécurité DEFINER pour garantir l'intégrité des mises à jour
*/

-- Mettre à jour la fonction pour gérer le statut 'completed' pour POS
CREATE OR REPLACE FUNCTION update_merchant_stats_on_pos()
RETURNS TRIGGER AS $$
DECLARE
  commission_rate DECIMAL(5,4);
  commission_amount DECIMAL(15,2);
  net_amount DECIMAL(15,2);
BEGIN
  -- Ne traiter que les transactions qui passent à "completed"
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Récupérer le taux de commission depuis admin_config
    SELECT COALESCE(pos_commission_rate, 0.015) INTO commission_rate
    FROM admin_config
    LIMIT 1;

    -- Si pas de config, utiliser le taux par défaut
    IF commission_rate IS NULL THEN
      commission_rate := 0.015;
    END IF;

    -- Calculer la commission et le montant net
    commission_amount := NEW.amount * commission_rate;
    net_amount := NEW.amount - commission_amount;

    -- Mettre à jour les statistiques du marchand
    UPDATE merchants
    SET 
      balance = balance + net_amount,
      total_revenue = total_revenue + NEW.amount,
      total_transactions = total_transactions + 1
    WHERE id = NEW.merchant_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
