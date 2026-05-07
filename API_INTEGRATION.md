# Guide d'Intégration API DyPay

## URL de Base

**Production:** `https://dstmejcntirvsoaknaja.supabase.co/functions/v1/dypay-process-payment`

## Authentification

DyPay utilise deux méthodes d'authentification:

### 1. Authentification Simple (API Key)
Ajoutez votre clé publique dans le header `X-API-Key`:

```
X-API-Key: YOUR_PUBLIC_KEY
```

### 2. Authentification Sécurisée (API Key + Signature HMAC)
Pour une sécurité maximale, ajoutez également une signature HMAC:

```
X-API-Key: YOUR_PUBLIC_KEY
X-Signature: HMAC_SHA256_SIGNATURE
```

#### Génération de la signature HMAC

La signature doit être générée en utilisant HMAC-SHA256 avec votre **clé secrète** et le corps de la requête (payload JSON).

**Exemple en JavaScript:**
```javascript
const crypto = require('crypto');

function generateSignature(payload, secretKey) {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}

const payload = {
  amount: 5000,
  currency: 'XAF',
  phone: '+237670000000'
};

const signature = generateSignature(payload, 'YOUR_SECRET_KEY');
```

**Exemple en PHP:**
```php
function generateSignature($payload, $secretKey) {
    $jsonPayload = json_encode($payload);
    return hash_hmac('sha256', $jsonPayload, $secretKey);
}

$payload = [
    'amount' => 5000,
    'currency' => 'XAF',
    'phone' => '+237670000000'
];

$signature = generateSignature($payload, 'YOUR_SECRET_KEY');
```

**Exemple en Python:**
```python
import hmac
import hashlib
import json

def generate_signature(payload, secret_key):
    json_payload = json.dumps(payload)
    signature = hmac.new(
        secret_key.encode(),
        json_payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return signature

payload = {
    'amount': 5000,
    'currency': 'XAF',
    'phone': '+237670000000'
}

signature = generate_signature(payload, 'YOUR_SECRET_KEY')
```

## Endpoint: Initier un Paiement

**POST** `/functions/v1/dypay-process-payment`

### Paramètres de Requête

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `amount` | number | Oui | Montant du paiement (en devise locale) |
| `currency` | string | Non | Code devise (XAF, XOF, CDF, etc.) - défaut: XAF |
| `phone` | string | Non | Numéro de téléphone du client (format international) |
| `operator` | string | Non | Code opérateur (MTN, ORANGE, MOOV, etc.) |
| `country` | string | Non | Code pays (CM, CI, SN, etc.) |
| `email` | string | Non | Email du client |
| `first_name` | string | Non | Prénom du client |
| `last_name` | string | Non | Nom du client |
| `item_ref` | string | Non | Référence de l'article/commande |
| `return_url` | string | Non | URL de retour après paiement |
| `notify_url` | string | Non | URL de notification webhook |
| `metadata` | object | Non | Données additionnelles |

### Exemple de Requête (avec signature)

```bash
curl -X POST https://dstmejcntirvsoaknaja.supabase.co/functions/v1/dypay-process-payment \
  -H "X-API-Key: live_abc123xyz789" \
  -H "X-Signature: a7f8d9e6c5b4a3d2e1f0..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "XAF",
    "phone": "+237670000000",
    "operator": "MTN",
    "country": "CM",
    "email": "client@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "item_ref": "ORDER_12345",
    "return_url": "https://votresite.com/payment/success",
    "notify_url": "https://votresite.com/webhook/dypay",
    "metadata": {
      "order_id": "12345",
      "user_id": "67890"
    }
  }'
```

### Réponse de Succès

```json
{
  "success": true,
  "payment_url": "https://payment.monetbil.com/widget/xxx",
  "payment_ref": "DYP-1705420800-abc123",
  "payment_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Réponse d'Erreur

```json
{
  "success": false,
  "error": "Invalid API key"
}
```

## Codes d'Erreur

| Code | Message | Description |
|------|---------|-------------|
| 401 | API key required | Clé API manquante dans le header |
| 401 | Invalid API key | Clé API invalide ou révoquée |
| 401 | Invalid signature | Signature HMAC invalide |
| 400 | Invalid amount | Montant invalide ou négatif |
| 500 | Failed to create payment | Erreur lors de la création du paiement |
| 500 | Payment service not configured | Service de paiement non configuré |

## Webhooks

Les webhooks vous permettent de recevoir des notifications en temps réel sur l'état des paiements.

### Configuration

1. Connectez-vous à votre dashboard DyPay
2. Allez dans **Paramètres** > **Webhooks**
3. Ajoutez votre URL de webhook
4. Sauvegardez votre secret webhook

### Vérification de la Signature Webhook

Chaque webhook inclut un header `X-Webhook-Signature` que vous devez vérifier:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, webhookSecret) {
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return signature === expectedSignature;
}

// Dans votre endpoint webhook
app.post('/webhook/dypay', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const isValid = verifyWebhookSignature(req.body, signature, 'YOUR_WEBHOOK_SECRET');

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  // Traiter le webhook
  const { event, payment } = req.body;

  if (event === 'payment.success') {
    // Marquer la commande comme payée
  } else if (event === 'payment.failed') {
    // Gérer l'échec du paiement
  }

  res.status(200).send('OK');
});
```

### Événements Webhook

| Événement | Description |
|-----------|-------------|
| `payment.success` | Paiement réussi |
| `payment.failed` | Paiement échoué |
| `payment.cancelled` | Paiement annulé |
| `payment.pending` | Paiement en attente |

### Payload Webhook

```json
{
  "event": "payment.success",
  "payment": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "payment_ref": "DYP-1705420800-abc123",
    "amount": 5000,
    "currency": "XAF",
    "status": "completed",
    "phone": "+237670000000",
    "operator": "MTN",
    "email": "client@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "item_ref": "ORDER_12345",
    "metadata": {
      "order_id": "12345",
      "user_id": "67890"
    },
    "created_at": "2024-01-16T10:00:00Z",
    "updated_at": "2024-01-16T10:05:00Z"
  }
}
```

## Opérateurs Mobile Money Supportés

### Cameroun (CM)
- **MTN Mobile Money** - Code: `MTN`
- **Orange Money** - Code: `ORANGE`

### Côte d'Ivoire (CI)
- **MTN Mobile Money** - Code: `MTN`
- **Orange Money** - Code: `ORANGE`
- **Moov Money** - Code: `MOOV`

### Sénégal (SN)
- **Orange Money** - Code: `ORANGE`
- **Free Money** - Code: `FREE`
- **Wave** - Code: `WAVE`

### Congo RDC (CD)
- **Vodacom M-Pesa** - Code: `VODACOM`
- **Airtel Money** - Code: `AIRTEL`
- **Orange Money** - Code: `ORANGE`

### Autres pays
- Gabon, Tchad, Mali, Burkina Faso, etc.

## Devises Supportées

- **XAF** - Franc CFA BEAC (Cameroun, Gabon, Tchad, etc.)
- **XOF** - Franc CFA BCEAO (Côte d'Ivoire, Sénégal, Mali, etc.)
- **CDF** - Franc Congolais (RDC)
- **UGX** - Shilling Ougandais (Ouganda)
- **LRD** - Dollar Libérien (Liberia)
- **GNF** - Franc Guinéen (Guinée)

## Environnement de Test

Pour tester l'intégration, utilisez une clé API de **test** (préfixe `test_`).

### Numéros de Test

- **Succès:** `+237690000001`
- **Échec:** `+237690000002`
- **En attente:** `+237690000003`

## Support

Pour toute question ou assistance:

- **Email:** support@dypay.io
- **Documentation:** https://docs.dypay.io
- **Dashboard:** https://dashboard.dypay.io

## Limites et Rate Limiting

- **Requêtes par minute:** 60
- **Requêtes par heure:** 1000
- **Montant minimum:** 100 (en devise locale)
- **Montant maximum:** 5 000 000 (en devise locale)
