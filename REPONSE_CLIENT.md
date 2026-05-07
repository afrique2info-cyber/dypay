# Réponse à votre demande d'intégration DyPay

Merci pour votre intérêt pour DyPay! Voici toutes les informations techniques nécessaires pour intégrer notre solution de paiement dans votre application.

## Documentation Technique Complète

La documentation complète est désormais disponible sur le site DyPay:
**👉 https://votresite.com/api-documentation**

## 1. API Endpoints

### URL de base
- **Production**: `https://api.dypay.io/v1`
- **Sandbox (Test)**: `https://sandbox-api.dypay.io/v1`

### Endpoints disponibles

#### POST /v1/payments/initiate
Initier un nouveau paiement

**Paramètres requis:**
```json
{
  "amount": 5000,                                    // Montant en centimes (5000 = 50 XAF)
  "currency": "XAF",                                 // XAF, XOF, EUR, USD
  "phone": "+237670000000",                          // Numéro de téléphone
  "payment_method": "mtn_momo",                      // mtn_momo, orange_money, moov_money, card
  "description": "Dépôt compte utilisateur",         // Description du paiement
  "callback_url": "https://votresite.com/webhook",   // URL de callback
  "merchant_reference": "ORDER_12345"                // Votre référence unique
}
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "payment_id": "pay_1234567890",
  "status": "pending",
  "payment_url": "https://pay.dypay.io/pay/1234567890",
  "qr_code": "data:image/png;base64,...",
  "message": "Paiement initié avec succès"
}
```

#### GET /v1/payments/:payment_id
Vérifier le statut d'un paiement

**Réponse:**
```json
{
  "payment_id": "pay_1234567890",
  "merchant_reference": "ORDER_12345",
  "amount": 5000,
  "currency": "XAF",
  "status": "completed",                             // pending, completed, failed, cancelled
  "payment_method": "mtn_momo",
  "transaction_id": "MTN_TXN_987654321",
  "created_at": "2024-01-29T10:30:00Z",
  "completed_at": "2024-01-29T10:31:45Z"
}
```

## 2. Clés API (Authentification)

### Obtenir vos clés
1. Créez un compte marchand sur https://votresite.com/auth
2. Dans votre tableau de bord, allez dans "Paramètres" > "Clés API"
3. Vous recevrez deux clés:
   - **Clé publique (Public Key)**: Pour les appels non sensibles
   - **Clé secrète (Secret Key)**: Pour les appels serveur (CONFIDENTIEL)

### Authentification
Toutes les requêtes API doivent inclure l'en-tête:
```
Authorization: Bearer VOTRE_CLE_SECRETE
```

**⚠️ Sécurité:** Ne partagez JAMAIS votre clé secrète. Utilisez-la uniquement côté serveur.

## 3. Webhooks / Callbacks

### Configuration
Lors de l'initiation d'un paiement, spécifiez votre `callback_url`. DyPay enverra une notification POST à cette URL.

### Structure du webhook
```json
{
  "event": "payment.success",                        // Type d'événement
  "payment_id": "pay_1234567890",
  "merchant_reference": "ORDER_12345",
  "amount": 5000,
  "currency": "XAF",
  "phone": "+237670000000",
  "payment_method": "mtn_momo",
  "status": "completed",                             // completed, failed, cancelled
  "transaction_id": "MTN_TXN_987654321",
  "timestamp": "2024-01-29T10:30:00Z",
  "signature": "sha256_signature_here"               // Pour vérification
}
```

### Événements disponibles
- `payment.pending` - Paiement en attente
- `payment.success` - Paiement réussi ✅
- `payment.failed` - Paiement échoué ❌
- `payment.cancelled` - Paiement annulé

### Vérification de la signature
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, webhookSecret) {
  const hash = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return hash === signature;
}

// Dans votre endpoint webhook
app.post('/webhook/dypay', (req, res) => {
  const signature = req.headers['x-dypay-signature'];
  const payload = req.body;

  // Vérifier la signature
  if (!verifyWebhookSignature(payload, signature, process.env.DYPAY_WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  // Traiter le paiement
  if (payload.event === 'payment.success') {
    // Mettre à jour le solde utilisateur
    // Marquer la commande comme payée
    console.log(`Paiement réussi: ${payload.payment_id}`);
  }

  res.status(200).send('OK');
});
```

**Important:** Votre endpoint doit:
- Être accessible publiquement (HTTPS recommandé)
- Répondre avec un code 200 dans les 10 secondes
- Vérifier la signature pour sécuriser les notifications

## 4. Méthodes de paiement disponibles

### Mobile Money
| Opérateur | Code API | Pays disponibles |
|-----------|----------|------------------|
| MTN Mobile Money | `mtn_momo` | Cameroun, Côte d'Ivoire, Bénin, Ghana |
| Orange Money | `orange_money` | Cameroun, Côte d'Ivoire, Sénégal, Mali |
| Moov Money | `moov_money` | Côte d'Ivoire, Bénin, Burkina Faso |

### Cartes bancaires
| Type | Code API |
|------|----------|
| Visa | `card` |
| Mastercard | `card` |
| Cartes locales | `card` |

**Sécurité:** Paiements 3D Secure activés par défaut

## 5. Pays supportés

- 🇨🇲 **Cameroun** - XAF (MTN, Orange)
- 🇨🇮 **Côte d'Ivoire** - XOF (MTN, Orange, Moov)
- 🇸🇳 **Sénégal** - XOF (Orange)
- 🇲🇱 **Mali** - XOF (Orange)
- 🇧🇫 **Burkina Faso** - XOF (Orange, Moov)
- 🇧🇯 **Bénin** - XOF (MTN, Moov)

## 6. Exemple d'intégration complète

### Backend (Node.js/Express)

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// 1. Initier un paiement
app.post('/api/deposit', async (req, res) => {
  const { amount, phone, userId } = req.body;

  try {
    const response = await fetch('https://api.dypay.io/v1/payments/initiate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DYPAY_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount * 100,  // Convertir en centimes
        currency: 'XAF',
        phone: phone,
        payment_method: 'mtn_momo',
        description: `Dépôt pour utilisateur ${userId}`,
        callback_url: 'https://votresite.com/api/webhook/dypay',
        merchant_reference: `USER_${userId}_${Date.now()}`
      })
    });

    const data = await response.json();

    if (data.success) {
      // Sauvegarder le payment_id en base de données
      await db.payments.create({
        userId: userId,
        paymentId: data.payment_id,
        amount: amount,
        status: 'pending'
      });

      res.json({
        success: true,
        payment_url: data.payment_url,
        payment_id: data.payment_id
      });
    } else {
      res.status(400).json({ error: 'Échec de l\'initiation du paiement' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Recevoir les webhooks
app.post('/api/webhook/dypay', async (req, res) => {
  const signature = req.headers['x-dypay-signature'];
  const payload = req.body;

  // Vérifier la signature
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha256', process.env.DYPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  if (hash !== signature) {
    return res.status(401).send('Invalid signature');
  }

  // Traiter le paiement
  if (payload.event === 'payment.success') {
    // Mettre à jour le paiement en base de données
    await db.payments.update({
      status: 'completed',
      transactionId: payload.transaction_id
    }, {
      where: { paymentId: payload.payment_id }
    });

    // Créditer le solde utilisateur
    const payment = await db.payments.findOne({
      where: { paymentId: payload.payment_id }
    });

    await db.users.increment('balance', {
      by: payment.amount,
      where: { id: payment.userId }
    });

    console.log(`✅ Solde mis à jour pour l'utilisateur ${payment.userId}`);
  }

  res.status(200).send('OK');
});

app.listen(3000);
```

### Frontend (React)

```jsx
import { useState } from 'react';

function DepositForm() {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          phone: phone,
          userId: currentUser.id
        })
      });

      const data = await response.json();

      if (data.success) {
        // Rediriger vers la page de paiement
        window.location.href = data.payment_url;
      } else {
        alert('Erreur lors de l\'initiation du paiement');
      }
    } catch (error) {
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleDeposit}>
      <input
        type="number"
        placeholder="Montant (XAF)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <input
        type="tel"
        placeholder="+237670000000"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Traitement...' : 'Déposer'}
      </button>
    </form>
  );
}
```

## 7. Environnement de test

### Données de test (Sandbox)

**URL:** `https://sandbox-api.dypay.io/v1`

**Numéros Mobile Money:**
- `+237690000001` → Paiement réussi ✅
- `+237690000002` → Paiement échoué ❌
- `+237690000003` → Timeout (en attente)

**Cartes bancaires:**
- `4242 4242 4242 4242` → Succès ✅
- `4000 0000 0000 0002` → Décliné ❌
- CVV: `123`, Date: `12/25`

## 8. SDKs disponibles

Des SDKs officiels sont disponibles pour faciliter l'intégration:

- **JavaScript/Node.js**: Téléchargeable depuis le tableau de bord
- **Python**: Téléchargeable depuis le tableau de bord
- **PHP**: Téléchargeable depuis le tableau de bord
- **Java**: Téléchargeable depuis le tableau de bord

## 9. Prochaines étapes

1. **Créer un compte marchand**: https://votresite.com/auth
2. **Récupérer vos clés API** depuis le tableau de bord
3. **Tester en mode Sandbox** avec les données de test
4. **Implémenter l'Edge Function** pour gérer les paiements
5. **Configurer le webhook** pour recevoir les notifications
6. **Tester avec de vrais paiements** en mode production

## 10. Support

Notre équipe est disponible pour vous accompagner:

- **Email**: support@dypay.io
- **Documentation**: https://votresite.com/api-documentation
- **Contact**: https://votresite.com/contact

---

## Résumé des avantages DyPay

✅ **Intégration rapide** - API REST simple et intuitive
✅ **Sécurisé** - Webhooks signés, HTTPS, 3D Secure
✅ **Multi-opérateurs** - MTN, Orange, Moov
✅ **Multi-pays** - 6 pays africains
✅ **Support réactif** - Assistance technique disponible
✅ **Tarifs compétitifs** - Frais transparents et compétitifs

N'hésitez pas à nous contacter pour toute question ou assistance technique!
