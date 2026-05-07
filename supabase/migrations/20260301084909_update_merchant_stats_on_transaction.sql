/*
  # Mise à jour automatique des statistiques du marchand

  1. Fonctions
    - `update_merchant_stats_on_payment()` : Met à jour les statistiques après un paiement
    - `update_merchant_stats_on_order()` : Met à jour les statistiques après une commande
    - `update_merchant_stats_on_pos()` : Met à jour les statistiques après une transaction POS

  2. Déclencheurs
    - Déclenche la mise à jour automatique des statistiques (balance, total_revenue, total_transactions)
    - S'exécute uniquement quand le statut devient 'completed'

  3. Sécurité
    - Les fonctions s'exécutent avec des privilèges de sécurité definer pour garantir l'intégrité
*/

-- Fonction pour mettre à jour les stats après un paiement
CREATE OR REPLACE FUNCTION update_merchant_stats_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  commission_rate DECIMAL(5,4);
  commission_amount DECIMAL(15,2);
  net_amount DECIMAL(15,2);
BEGIN
  -- Ne traiter que les paiements qui passent à "completed"
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Récupérer le taux de commission depuis admin_config
    SELECT COALESCE(merchant_commission_rate, 0.02) INTO commission_rate
    FROM admin_config
    LIMIT 1;

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

-- Fonction pour mettre à jour les stats après une commande
CREATE OR REPLACE FUNCTION update_merchant_stats_on_order()
RETURNS TRIGGER AS $$
DECLARE
  commission_rate DECIMAL(5,4);
  commission_amount DECIMAL(15,2);
  net_amount DECIMAL(15,2);
BEGIN
  -- Ne traiter que les commandes qui passent à "completed"
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Récupérer le taux de commission depuis admin_config
    SELECT COALESCE(merchant_commission_rate, 0.02) INTO commission_rate
    FROM admin_config
    LIMIT 1;

    -- Calculer la commission et le montant net
    commission_amount := NEW.total_amount * commission_rate;
    net_amount := NEW.total_amount - commission_amount;

    -- Mettre à jour les statistiques du marchand
    UPDATE merchants
    SET 
      balance = balance + net_amount,
      total_revenue = total_revenue + NEW.total_amount,
      total_transactions = total_transactions + 1
    WHERE id = NEW.merchant_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour les stats après une transaction POS
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

-- Déclencheurs pour mettre à jour les statistiques automatiquement

-- Pour les paiements
DROP TRIGGER IF EXISTS update_merchant_stats_on_payment_trigger ON payments;
CREATE TRIGGER update_merchant_stats_on_payment_trigger
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_merchant_stats_on_payment();

-- Pour les commandes
DROP TRIGGER IF EXISTS update_merchant_stats_on_order_trigger ON orders;
CREATE TRIGGER update_merchant_stats_on_order_trigger
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_merchant_stats_on_order();

-- Pour les transactions POS
DROP TRIGGER IF EXISTS update_merchant_stats_on_pos_trigger ON pos_transactions;
CREATE TRIGGER update_merchant_stats_on_pos_trigger
  AFTER INSERT OR UPDATE ON pos_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_merchant_stats_on_pos();