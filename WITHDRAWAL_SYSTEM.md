# Système de Retrait Automatique Dypay

## Vue d'ensemble

Le système de retrait automatique permet aux marchands et utilisateurs POS de retirer des fonds de leur compte Dypay directement vers leur numéro de mobile money via Monetbil. Le processus est complètement transparent pour l'utilisateur qui ne voit que Dypay comme passerelle de paiement.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              Interface Utilisateur                   │
│  - Dashboard marchand avec solde disponible          │
│  - Formulaire de retrait avec code PIN              │
│  - Historique des retraits                          │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│         Edge Function: process-withdrawal            │
│  1. Vérifie le code PIN à 4 chiffres                │
│  2. Valide le solde disponible                      │
│  3. Calcule les frais de retrait                    │
│  4. Crée l'enregistrement du retrait                │
│  5. Appelle l'API Monetbil pour le payout          │
│  6. Met à jour le solde et l'historique            │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              API Monetbil Payout                     │
│  - Traite le transfert vers mobile money            │
│  - Retourne l'ID de transaction                     │
│  - Gère les erreurs de paiement                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│         Base de données Supabase                     │
│  ┌─────────────────────────────────────────────┐   │
│  │   withdrawals                                │   │
│  │  - merchant_id                               │   │
│  │  - amount, currency                          │   │
│  │  - phone_number                              │   │
│  │  - status (pending/processing/completed)     │   │
│  │  - fees, net_amount                          │   │
│  │  - monetbil_transaction_id                   │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │   merchant_balances                          │   │
│  │  - available_balance                         │   │
│  │  - pending_balance                           │   │
│  │  - total_withdrawn                           │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │   withdrawal_pins                            │   │
│  │  - pin_hash (SHA-256)                        │   │
│  │  - failed_attempts                           │   │
│  │  - locked_until                              │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Tables de la Base de Données

### withdrawals
Stocke tous les retraits effectués par les marchands.

```sql
CREATE TABLE withdrawals (
  id uuid PRIMARY KEY,
  merchant_id uuid REFERENCES merchants(id),
  amount decimal(15, 2),
  currency text,
  phone_number text,
  status text, -- pending, processing, completed, failed, cancelled
  monetbil_transaction_id text,
  fees decimal(15, 2),
  net_amount decimal(15, 2),
  error_message text,
  created_at timestamptz,
  completed_at timestamptz,
  metadata jsonb
);
```

### merchant_balances
Gère le solde de chaque marchand.

```sql
CREATE TABLE merchant_balances (
  id uuid PRIMARY KEY,
  merchant_id uuid UNIQUE REFERENCES merchants(id),
  available_balance decimal(15, 2), -- Solde disponible pour retrait
  pending_balance decimal(15, 2),   -- Transactions en attente
  total_withdrawn decimal(15, 2),   -- Total retiré à vie
  currency text,
  last_withdrawal_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
);
```

### withdrawal_pins
Stocke les codes PIN sécurisés pour les retraits.

```sql
CREATE TABLE withdrawal_pins (
  id uuid PRIMARY KEY,
  merchant_id uuid UNIQUE REFERENCES merchants(id),
  pin_hash text,              -- Hash SHA-256 du PIN
  is_active boolean,
  failed_attempts integer,    -- Compteur de tentatives échouées
  locked_until timestamptz,   -- Timestamp de verrouillage
  created_at timestamptz,
  updated_at timestamptz
);
```

## Sécurité du Code PIN

### Configuration du PIN
- Le PIN doit être exactement 4 chiffres
- Le PIN est hashé avec SHA-256 avant stockage
- Jamais stocké en clair dans la base de données
- Le PIN ne peut pas être récupéré (seulement réinitialisé)

### Protection contre les attaques
- Maximum 5 tentatives échouées
- Après 5 échecs: verrouillage du compte pour 30 minutes
- Compteur de tentatives réinitialisé après succès
- Timestamp de verrouillage stocké en base

### PINs non autorisés
Les codes trop simples sont rejetés:
- 0000
- 1234
- 1111, 2222, etc.

## Flux de Retrait

### 1. Demande de Retrait
```typescript
{
  merchant_id: "uuid",
  amount: 10000,
  currency: "XAF",
  phone_number: "237XXXXXXXXX",
  pin: "1234"
}
```

### 2. Vérifications
1. Validation du format du PIN (4 chiffres)
2. Vérification du PIN dans la base
3. Vérification du verrouillage du compte
4. Validation du solde disponible
5. Calcul des frais de transaction

### 3. Traitement
1. Création de l'enregistrement de retrait (status: processing)
2. Appel API Monetbil pour payout
3. Mise à jour du status selon la réponse
4. Déduction du solde si succès
5. Enregistrement de l'ID de transaction Monetbil

### 4. Réponse
```typescript
{
  success: true,
  withdrawal_id: "uuid",
  transaction_id: "monetbil_tx_id",
  amount: 10000,
  fees: 150,
  net_amount: 9850,
  new_balance: 40150
}
```

## Configuration des Frais

Les frais de retrait sont configurables via la table `admin_config`:

```sql
INSERT INTO admin_config (config_key, config_value, description)
VALUES ('withdrawal_fee_percentage', '1.5', 'Pourcentage de frais sur les retraits');
```

Par défaut: 1.5% du montant du retrait.

## Intégration Monetbil

### Endpoint Payout
```
POST https://api.monetbil.com/payment/v1/payout
```

### Paramètres
```typescript
{
  service: MONETBIL_SERVICE_KEY,
  phonenumber: "237XXXXXXXXX",
  amount: "9850",
  currency: "XAF",
  item_ref: "WITHDRAWAL_merchant_id_timestamp",
  payment_ref: "WDtimestamp_random"
}
```

### Réponse Monetbil
```json
{
  "transaction_id": "monetbil_tx_id",
  "status": "processing",
  "message": "Payout initiated successfully"
}
```

## Interface Utilisateur

### Composant WithdrawalManager
- Affiche le solde disponible
- Formulaire de demande de retrait
- Historique des retraits avec statuts
- Gestion du code PIN

### Composant PinSetup
- Configuration initiale du PIN
- Changement du PIN existant
- Validation en temps réel
- Indicateurs de sécurité

### Statuts des Retraits
- **pending**: Créé mais pas encore traité
- **processing**: En cours de traitement par Monetbil
- **completed**: Retrait réussi
- **failed**: Échec du retrait (voir error_message)
- **cancelled**: Annulé par le marchand ou admin

## API Edge Function

### Endpoint
```
POST /functions/v1/process-withdrawal
```

### Headers
```
Authorization: Bearer SUPABASE_ANON_KEY
Content-Type: application/json
```

### Exemple d'utilisation
```typescript
const response = await fetch(
  `${supabaseUrl}/functions/v1/process-withdrawal`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      merchant_id: 'uuid',
      amount: 10000,
      currency: 'XAF',
      phone_number: '237XXXXXXXXX',
      pin: '1234'
    })
  }
);
```

## Gestion du Solde

### Crédit du Solde
Le solde est crédité automatiquement lors d'un paiement réussi:
1. Webhook Monetbil reçu
2. Paiement validé (status: completed)
3. Commission calculée et déduite
4. Solde disponible mis à jour

### Débit du Solde
Le solde est débité lors d'un retrait réussi:
1. Retrait validé et traité
2. Montant total (amount) déduit du available_balance
3. total_withdrawn incrémenté
4. last_withdrawal_at mis à jour

## Row Level Security (RLS)

Toutes les tables ont RLS activé:

### withdrawals
- Les marchands peuvent voir leurs propres retraits
- Les marchands peuvent créer des demandes de retrait
- Service role a accès complet

### merchant_balances
- Les marchands peuvent voir leur propre solde
- Service role a accès complet

### withdrawal_pins
- Les marchands peuvent voir uniquement le statut de leur PIN
- Pas d'accès au hash du PIN côté client
- Service role a accès complet

## Recommandations

### Sécurité
1. Toujours utiliser HTTPS
2. Ne jamais logger les PINs en clair
3. Limiter les tentatives de retrait par jour
4. Alerter sur les retraits importants
5. Vérifier les numéros de téléphone

### Performance
1. Indexer merchant_id dans toutes les tables
2. Limiter l'historique affiché (50 derniers retraits)
3. Cacher les soldes côté client
4. Utiliser des requêtes optimisées

### UX
1. Confirmer avant chaque retrait
2. Afficher les frais clairement
3. Montrer le net_amount
4. Notifications en temps réel
5. Historique détaillé avec filtres

## Codes d'Erreur Courants

| Code | Description | Solution |
|------|-------------|----------|
| PIN_INVALID | Code PIN incorrect | Réessayer avec le bon PIN |
| PIN_LOCKED | Compte verrouillé | Attendre 30 minutes |
| INSUFFICIENT_BALANCE | Solde insuffisant | Vérifier le solde disponible |
| INVALID_PHONE | Numéro invalide | Corriger le numéro |
| MONETBIL_ERROR | Erreur API Monetbil | Contacter le support |
| PIN_NOT_SETUP | PIN non configuré | Configurer un PIN |

## Tests

### Test du PIN
```typescript
// Configuration
setupPin(merchantId, '1234');

// Vérification
checkPinStatus(merchantId);

// Test échec
createWithdrawal({ pin: '0000' }); // Devrait échouer
```

### Test de Retrait
```typescript
// Avec solde suffisant
const result = await createWithdrawal({
  merchant_id: 'uuid',
  amount: 1000,
  currency: 'XAF',
  phone_number: '237XXXXXXXXX',
  pin: '1234'
});

expect(result.success).toBe(true);
```

### Test de Verrouillage
```typescript
// 5 tentatives avec mauvais PIN
for (let i = 0; i < 5; i++) {
  await createWithdrawal({ pin: '0000' });
}

// 6ème tentative devrait être verrouillée
const result = await createWithdrawal({ pin: '1234' });
expect(result.error).toContain('locked');
```

## Support

Pour toute question ou problème:
- Documentation API: `/docs`
- Email support: support@dypay.com
- Dashboard: Section "Retraits"
