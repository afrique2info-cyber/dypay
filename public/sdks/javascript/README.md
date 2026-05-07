# Dypay JavaScript/Node.js SDK

SDK JavaScript/Node.js officiel pour intégrer Dypay dans vos applications.

## Version

1.0.0

## Prérequis

- Node.js 14+ (pour utilisation côté serveur)
- Support des navigateurs modernes avec fetch API (pour utilisation côté client)

## Installation

### Installation via NPM (bientôt disponible)

```bash
npm install dypay
```

### Installation manuelle

1. Téléchargez le SDK depuis votre tableau de bord Dypay
2. Extrayez le contenu dans votre projet
3. Importez le module:

**Node.js (CommonJS):**
```javascript
const DypayClient = require('./dypay');
```

**ES Modules:**
```javascript
import DypayClient from './dypay.js';
```

**Navigateur:**
```html
<script src="dypay.js"></script>
<script>
  const dypay = new DypayClient('api_key', 'api_secret');
</script>
```

## Configuration

### Obtenir vos clés API

1. Connectez-vous à votre tableau de bord Dypay
2. Allez dans "Clés API"
3. Créez une nouvelle clé API (Test ou Production)
4. Copiez votre clé API et votre secret

### Initialisation du client

```javascript
import DypayClient from 'dypay';

// Mode test
const dypay = new DypayClient(
  'votre_cle_api',
  'votre_secret_api',
  false  // false = mode test, true = mode production
);

// Mode production
const dypayLive = new DypayClient(
  'votre_cle_api_live',
  'votre_secret_api_live',
  true
);
```

## Utilisation

### Créer un paiement

```javascript
try {
  const payment = await dypay.createPayment({
    amount: 5000,
    currency: 'XAF',
    item_ref: 'PROD-123',
    first_name: 'Jean',
    last_name: 'Dupont',
    email: 'jean.dupont@example.com',
    phone: '+237600000000',
    return_url: 'https://votresite.com/payment/success',
    notify_url: 'https://votresite.com/payment/webhook',
    metadata: {
      order_id: '12345',
      customer_id: '67890'
    }
  });

  console.log('Paiement créé:', payment.payment_ref);
  console.log('URL de paiement:', payment.payment_url);

  // Redirigez l'utilisateur vers payment_url
  window.location.href = payment.payment_url;

} catch (error) {
  console.error('Erreur:', error.message);
}
```

### Vérifier le statut d'un paiement

```javascript
try {
  const payment = await dypay.getPayment('DYPAY-REF-123456');

  console.log('Statut:', payment.status);
  console.log('Montant:', payment.amount, payment.currency);

  if (payment.status === DypayClient.PAYMENT_STATUS.COMPLETED) {
    console.log('Paiement réussi!');
  }

} catch (error) {
  console.error('Erreur:', error.message);
}
```

### Lister tous les paiements

```javascript
try {
  // Sans filtres
  const payments = await dypay.listPayments();

  // Avec filtres
  const filteredPayments = await dypay.listPayments({
    status: 'completed',
    limit: 10,
    offset: 0
  });

  console.log(`Total: ${payments.total} paiements`);
  payments.data.forEach(payment => {
    console.log(`${payment.payment_ref}: ${payment.status}`);
  });

} catch (error) {
  console.error('Erreur:', error.message);
}
```

### Gérer les webhooks (Node.js uniquement)

**Express.js:**

```javascript
import express from 'express';
import DypayClient from 'dypay';

const app = express();
const dypay = new DypayClient(
  process.env.DYPAY_API_KEY,
  process.env.DYPAY_API_SECRET,
  true
);

app.post('/webhook/dypay', express.raw({ type: 'application/json' }), (req, res) => {
  const payload = req.body.toString();
  const signature = req.headers['x-dypay-signature'];

  try {
    const event = dypay.handleWebhook(payload, signature);

    switch (event.status) {
      case DypayClient.PAYMENT_STATUS.COMPLETED:
        console.log('Paiement réussi:', event.payment_ref);
        // Débloquez le service/produit
        break;

      case DypayClient.PAYMENT_STATUS.FAILED:
        console.log('Paiement échoué:', event.payment_ref);
        // Annulez la commande
        break;
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(400).send('Invalid signature');
  }
});

app.listen(3000);
```

**Next.js API Route:**

```javascript
// pages/api/webhook/dypay.js
import DypayClient from 'dypay';

const dypay = new DypayClient(
  process.env.DYPAY_API_KEY,
  process.env.DYPAY_API_SECRET,
  true
);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = await getRawBody(req);
    const signature = req.headers['x-dypay-signature'];

    const event = dypay.handleWebhook(payload, signature);

    if (event.status === DypayClient.PAYMENT_STATUS.COMPLETED) {
      // Traiter le paiement réussi
      console.log('Paiement réussi:', event.payment_ref);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(400).json({ error: error.message });
  }
}
```

## TypeScript Support

Le SDK inclut des définitions TypeScript complètes:

```typescript
import DypayClient, { PaymentParams, Payment } from 'dypay';

const dypay = new DypayClient('api_key', 'api_secret', false);

const params: PaymentParams = {
  amount: 5000,
  currency: 'XAF',
  item_ref: 'PROD-123',
  email: 'user@example.com'
};

const payment: Payment = await dypay.createPayment(params);
```

## Devises supportées

- `XAF` - Franc CFA (Cameroun, etc.)
- `XOF` - Franc CFA (Sénégal, Côte d'Ivoire, etc.)
- `CDF` - Franc Congolais
- `UGX` - Shilling Ougandais
- `LRD` - Dollar Libérien
- `GNF` - Franc Guinéen

## Statuts de paiement

```javascript
DypayClient.PAYMENT_STATUS.PENDING    // 'pending'
DypayClient.PAYMENT_STATUS.COMPLETED  // 'completed'
DypayClient.PAYMENT_STATUS.FAILED     // 'failed'
DypayClient.PAYMENT_STATUS.CANCELLED  // 'cancelled'
```

## Gestion des erreurs

Toutes les méthodes asynchrones peuvent rejeter des erreurs:

```javascript
try {
  const payment = await dypay.createPayment({ ... });
} catch (error) {
  console.error('Erreur Dypay:', error.message);
  // Afficher un message à l'utilisateur
}
```

## Sécurité

### Vérification des webhooks

Toujours vérifier la signature des webhooks:

```javascript
const isValid = dypay.verifyWebhookSignature(payload, signature);
if (!isValid) {
  throw new Error('Invalid signature');
}
```

### Protection des clés API

- Ne jamais exposer vos clés dans le code côté client
- Utilisez des variables d'environnement
- Utilisez des clés de test pour le développement

**Variables d'environnement (.env):**
```env
DYPAY_API_KEY=your_api_key
DYPAY_API_SECRET=your_api_secret
DYPAY_MODE=test
```

**Utilisation:**
```javascript
const dypay = new DypayClient(
  process.env.DYPAY_API_KEY,
  process.env.DYPAY_API_SECRET,
  process.env.DYPAY_MODE === 'live'
);
```

## Exemple complet

Voir le fichier `example.js` pour un exemple complet d'intégration.

## Support

Pour toute question ou problème:

- Documentation: https://docs.dypay.com
- Email: support@dypay.com
- Tableau de bord: https://dashboard.dypay.com

## Changelog

### Version 1.0.0 (2026-01-21)

- Version initiale du SDK
- Support Node.js et navigateurs
- Support TypeScript
- Gestion des paiements et webhooks
- Support de 6 devises africaines

## Licence

MIT License - Voir le fichier LICENSE pour plus de détails
