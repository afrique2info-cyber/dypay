# Guide d'intégration Dypay

Bienvenue sur Dypay, votre agrégateur de paiement simple et sécurisé pour l'Afrique.

## Démarrage rapide

### 1. Créer un compte marchand

Visitez votre plateforme Dypay et créez un compte marchand. Vous recevrez immédiatement accès à votre tableau de bord.

### 2. Générer vos clés API

Dans votre tableau de bord:
1. Allez dans l'onglet "Clés API"
2. Créez une nouvelle clé (Test ou Production)
3. Copiez votre clé API

### 3. Intégration dans votre application

#### Option 1: API HTTP directe (Recommandée)

```javascript
// Client-side (JavaScript/TypeScript)
async function createPayment() {
  const response = await fetch('https://dstmejcntirvsoaknaja.supabase.co/functions/v1/dypay-process-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'YOUR_DYPAY_API_KEY'
    },
    body: JSON.stringify({
      amount: 5000,
      phone: '237699000000',
      operator: 'Orange',
      country: 'CM',
      currency: 'XAF',
      email: 'client@example.com',
      first_name: 'Jean',
      last_name: 'Dupont',
      return_url: 'https://votresite.com/success',
      notify_url: 'https://votresite.com/webhook',
      metadata: {
        order_id: '12345',
        custom_data: 'votre_data'
      }
    })
  });

  const result = await response.json();

  if (result.success) {
    // Rediriger vers la page de paiement
    window.location.href = result.payment_url;
  } else {
    console.error('Erreur:', result.error);
  }
}
```

#### Option 2: SDK JavaScript (À venir)

```javascript
import { DypayClient } from '@dypay/sdk';

const dypay = new DypayClient('YOUR_API_KEY');

const result = await dypay.createPayment({
  amount: 5000,
  phone: '237699000000',
  operator: 'Orange',
  country: 'CM',
  currency: 'XAF',
  email: 'client@example.com'
});

if (result.success) {
  window.location.href = result.payment_url;
}
```

#### Option 3: Backend (Node.js, Python, PHP, etc.)

**Node.js:**
```javascript
const fetch = require('node-fetch');

async function createPayment(paymentData) {
  const response = await fetch('https://dstmejcntirvsoaknaja.supabase.co/functions/v1/dypay-process-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.DYPAY_API_KEY
    },
    body: JSON.stringify(paymentData)
  });

  return await response.json();
}
```

**Python:**
```python
import requests

def create_payment(payment_data):
    response = requests.post(
        'https://dstmejcntirvsoaknaja.supabase.co/functions/v1/dypay-process-payment',
        headers={
            'Content-Type': 'application/json',
            'X-API-Key': os.environ['DYPAY_API_KEY']
        },
        json=payment_data
    )
    return response.json()
```

**PHP:**
```php
<?php
function createPayment($paymentData) {
    $ch = curl_init('https://dstmejcntirvsoaknaja.supabase.co/functions/v1/dypay-process-payment');

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'X-API-Key: ' . getenv('DYPAY_API_KEY')
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paymentData));

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}
?>
```

## Paramètres de l'API

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `amount` | number | Oui | Montant du paiement |
| `phone` | string | Oui | Numéro de téléphone du client |
| `operator` | string | Non | Opérateur mobile (Orange, MTN, etc.) |
| `country` | string | Non | Code pays (CM, SN, CD, etc.) |
| `currency` | string | Non | Devise (XAF par défaut) |
| `email` | string | Non | Email du client |
| `first_name` | string | Non | Prénom du client |
| `last_name` | string | Non | Nom du client |
| `return_url` | string | Non | URL de retour après paiement |
| `notify_url` | string | Non | URL de notification (webhook) |
| `metadata` | object | Non | Données personnalisées |

## Réponse de l'API

### Succès
```json
{
  "success": true,
  "payment_url": "https://payment.dypay.com/pay/...",
  "payment_ref": "DYP-1234567890-abcdef"
}
```

### Erreur
```json
{
  "success": false,
  "error": "Description de l'erreur"
}
```

## Pays et devises supportés

| Pays | Code | Devise | Opérateurs |
|------|------|--------|------------|
| Cameroun | CM | XAF | Orange, MTN |
| Sénégal | SN | XOF | Orange, Free, Expresso |
| RD Congo | CD | CDF | Vodacom, Airtel, Orange |
| Congo-Brazzaville | CG | XAF | MTN, Airtel |
| Ouganda | UG | UGX | MTN, Airtel |
| Liberia | LR | LRD | Orange, MTN |
| Guinée-Conakry | GN | GNF | Orange, MTN |
| Bénin | BJ | XOF | MTN, Moov |
| Gabon | GA | XAF | Airtel, Moov |

## Webhooks (Notifications)

Configurez une URL de webhook pour recevoir les notifications de paiement en temps réel:

```javascript
// Exemple d'endpoint webhook (Node.js/Express)
app.post('/webhook', (req, res) => {
  const payment = req.body;

  // Vérifier le statut du paiement
  if (payment.status === 'completed') {
    // Paiement réussi - Livrer le produit/service
    console.log('Paiement réussi:', payment.payment_ref);
  }

  res.status(200).send('OK');
});
```

## Sécurité

- **IMPORTANT**: Ne partagez jamais vos clés API
- Utilisez les clés de test pour le développement
- Utilisez les clés de production uniquement en production
- Stockez vos clés dans des variables d'environnement
- Vérifiez toujours les webhooks côté serveur

## Support

Besoin d'aide? Contactez notre équipe support via votre tableau de bord Dypay.

---

**Dypay** - Simplifie les paiements en Afrique
