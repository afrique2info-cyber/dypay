# Guide des Webhooks Dypay

Ce guide explique comment configurer et utiliser les webhooks pour recevoir des notifications en temps réel de vos transactions Dypay.

## Qu'est-ce qu'un Webhook ?

Un webhook est une notification HTTP POST automatique envoyée à votre serveur lorsqu'un événement se produit dans votre compte Dypay. Cela vous permet de réagir immédiatement aux transactions sans avoir à interroger constamment l'API.

## Configuration

### 1. Créer un Webhook

1. Connectez-vous à votre tableau de bord Dypay
2. Allez dans **Webhooks** dans le menu latéral
3. Cliquez sur **Ajouter un Webhook**
4. Entrez l'URL de votre endpoint (doit commencer par `https://`)
5. Sélectionnez les événements que vous souhaitez recevoir
6. Cliquez sur **Créer le webhook**
7. Copiez le **secret** généré automatiquement (vous en aurez besoin pour vérifier les signatures)

### 2. Événements Disponibles

| Événement | Description |
|-----------|-------------|
| `payment.completed` | Un paiement a été complété avec succès |
| `payment.failed` | Un paiement a échoué |
| `order.completed` | Une commande a été complétée |
| `order.cancelled` | Une commande a été annulée |
| `pos.transaction.completed` | Une transaction POS a été complétée |
| `withdrawal.completed` | Un retrait a été effectué |

## Format des Requêtes Webhook

### Headers

Chaque requête webhook inclut ces headers :

```
Content-Type: application/json
X-Webhook-Signature: [signature HMAC SHA-256]
X-Webhook-Event: [type d'événement]
```

### Corps de la Requête

```json
{
  "event": "payment.completed",
  "merchant_id": "uuid-du-marchand",
  "timestamp": "2024-03-01T10:30:00Z",
  "data": {
    "id": "uuid-de-la-transaction",
    "amount": 5000,
    "currency": "XAF",
    "status": "completed",
    "customer_email": "client@example.com",
    "payment_ref": "PAY-123456",
    "created_at": "2024-03-01T10:25:00Z",
    // ... autres champs selon le type d'événement
  }
}
```

## Vérification de la Signature

Pour garantir que les webhooks proviennent bien de Dypay, vous devez vérifier la signature HMAC.

### Exemple en Node.js

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Dans votre endpoint
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const secret = 'votre-secret-webhook';

  if (!verifyWebhookSignature(req.body, signature, secret)) {
    return res.status(401).send('Invalid signature');
  }

  // Traiter le webhook
  const { event, data } = req.body;

  switch (event) {
    case 'payment.completed':
      handlePaymentCompleted(data);
      break;
    case 'payment.failed':
      handlePaymentFailed(data);
      break;
    // ... autres cas
  }

  res.status(200).send('OK');
});
```

### Exemple en PHP

```php
function verifyWebhookSignature($payload, $signature, $secret) {
    $expectedSignature = hash_hmac('sha256', json_encode($payload), $secret);
    return hash_equals($expectedSignature, $signature);
}

// Dans votre endpoint
$payload = json_decode(file_get_contents('php://input'), true);
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'];
$secret = 'votre-secret-webhook';

if (!verifyWebhookSignature($payload, $signature, $secret)) {
    http_response_code(401);
    exit('Invalid signature');
}

$event = $payload['event'];
$data = $payload['data'];

switch ($event) {
    case 'payment.completed':
        handlePaymentCompleted($data);
        break;
    case 'payment.failed':
        handlePaymentFailed($data);
        break;
    // ... autres cas
}

http_response_code(200);
echo 'OK';
```

### Exemple en Python

```python
import hmac
import hashlib
import json
from flask import Flask, request

app = Flask(__name__)

def verify_webhook_signature(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode(),
        json.dumps(payload).encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected_signature, signature)

@app.route('/webhook', methods=['POST'])
def webhook():
    payload = request.json
    signature = request.headers.get('X-Webhook-Signature')
    secret = 'votre-secret-webhook'

    if not verify_webhook_signature(payload, signature, secret):
        return 'Invalid signature', 401

    event = payload['event']
    data = payload['data']

    if event == 'payment.completed':
        handle_payment_completed(data)
    elif event == 'payment.failed':
        handle_payment_failed(data)
    # ... autres cas

    return 'OK', 200
```

## Bonnes Pratiques

### 1. Retourner une Réponse Rapide

Votre endpoint doit répondre rapidement (< 5 secondes). Si vous avez des traitements longs, utilisez une file d'attente :

```javascript
app.post('/webhook', async (req, res) => {
  // Vérifier la signature
  if (!verifySignature(req.body, req.headers['x-webhook-signature'])) {
    return res.status(401).send('Invalid signature');
  }

  // Ajouter à une file d'attente pour traitement asynchrone
  await queue.add('process-webhook', req.body);

  // Répondre immédiatement
  res.status(200).send('OK');
});
```

### 2. Idempotence

Dypay peut envoyer le même webhook plusieurs fois. Stockez les IDs déjà traités :

```javascript
async function handleWebhook(payload) {
  const { event, data } = payload;

  // Vérifier si déjà traité
  const exists = await db.webhooks.findOne({
    transaction_id: data.id,
    event: event
  });

  if (exists) {
    console.log('Webhook already processed');
    return;
  }

  // Traiter le webhook
  await processEvent(event, data);

  // Marquer comme traité
  await db.webhooks.create({
    transaction_id: data.id,
    event: event,
    processed_at: new Date()
  });
}
```

### 3. Gérer les Erreurs

Retournez un code 2xx uniquement si le traitement a réussi. En cas d'erreur, retournez un code 5xx pour que Dypay réessaie.

```javascript
app.post('/webhook', async (req, res) => {
  try {
    await handleWebhook(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Processing failed');
  }
});
```

### 4. Sécurité

- **Toujours utiliser HTTPS** pour votre endpoint
- **Vérifier la signature** sur chaque requête
- **Stocker le secret de manière sécurisée** (variables d'environnement)
- **Limiter les tentatives** pour éviter les attaques

## Test des Webhooks

### Tester en Local avec ngrok

```bash
# Installer ngrok
npm install -g ngrok

# Exposer votre serveur local
ngrok http 3000

# Utiliser l'URL fournie par ngrok dans votre configuration webhook
# Exemple: https://abc123.ngrok.io/webhook
```

### Simuler un Webhook

Vous pouvez tester votre endpoint manuellement :

```bash
curl -X POST https://votre-serveur.com/webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: your-test-signature" \
  -H "X-Webhook-Event: payment.completed" \
  -d '{
    "event": "payment.completed",
    "merchant_id": "test-merchant-id",
    "timestamp": "2024-03-01T10:30:00Z",
    "data": {
      "id": "test-payment-id",
      "amount": 5000,
      "currency": "XAF",
      "status": "completed"
    }
  }'
```

## Dépannage

### Le webhook n'est pas reçu

1. Vérifiez que votre URL est accessible publiquement
2. Vérifiez que votre serveur accepte les requêtes POST
3. Vérifiez les logs dans votre tableau de bord Dypay (statut de dernière réponse)
4. Assurez-vous que le webhook est actif

### Erreur de signature invalide

1. Vérifiez que vous utilisez le bon secret
2. Assurez-vous de vérifier la signature sur le corps brut de la requête (pas après parsing)
3. Vérifiez que vous utilisez le bon algorithme (HMAC SHA-256)

### Webhooks en double

C'est normal. Implémentez l'idempotence pour gérer les doublons.

## Surveillance

### Vérifier le Statut

Dans votre tableau de bord Dypay, chaque webhook affiche :
- **Dernier déclenchement** : Date et heure du dernier envoi
- **Statut de réponse** : Code HTTP retourné par votre serveur
- **Actif/Inactif** : État du webhook

### Logs

Conservez des logs détaillés de tous les webhooks reçus :

```javascript
app.post('/webhook', async (req, res) => {
  const logEntry = {
    timestamp: new Date(),
    event: req.body.event,
    signature: req.headers['x-webhook-signature'],
    payload: req.body,
  };

  await db.webhook_logs.create(logEntry);

  // Traiter le webhook...
});
```

## Support

Pour toute question sur les webhooks :
- Email : support@dypay.com
- Documentation API : https://votre-domaine.com/dashboard (onglet Documentation)
