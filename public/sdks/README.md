# Dypay SDKs - Guide d'utilisation

Bienvenue dans la collection des SDKs officiels Dypay pour l'intégration des paiements mobiles en Afrique.

## SDKs Disponibles

Nous proposons des SDKs pour les langages les plus populaires :

- **JavaScript/Node.js** - Pour applications web et serveurs Node.js
- **Python** - Compatible Flask, Django, FastAPI
- **PHP** - Pour applications web PHP classiques
- **Java** - Pour applications Java et Android

## Installation

### 1. Télécharger le SDK

Depuis votre tableau de bord Dypay, téléchargez le SDK correspondant à votre langage de programmation.

### 2. Extraire les fichiers

Extrayez l'archive ZIP dans votre projet.

### 3. Suivre la documentation

Chaque SDK contient :
- Un fichier `README.md` avec la documentation complète
- Un fichier `example.*` avec des exemples d'utilisation
- Le code source du SDK
- Une licence MIT

## Configuration requise

### Clés API

Avant d'utiliser un SDK, vous devez obtenir vos clés API :

1. Connectez-vous à votre tableau de bord Dypay
2. Allez dans l'onglet "Clés API"
3. Créez une nouvelle clé API
4. Copiez votre **clé API** et votre **secret API**

### Modes Test et Production

- **Mode Test** : Utilisez les clés de test pour développer et tester sans frais réels
- **Mode Production** : Utilisez les clés de production pour accepter de vrais paiements

## Utilisation de base

Tous les SDKs suivent le même schéma d'utilisation :

### 1. Initialiser le client

```javascript
// JavaScript
const dypay = new DypayClient('api_key', 'api_secret', false);
```

```python
# Python
dypay = DypayClient('api_key', 'api_secret', is_live=False)
```

```php
// PHP
$dypay = new DypayClient('api_key', 'api_secret', false);
```

```java
// Java
DypayClient dypay = new DypayClient("api_key", "api_secret", false);
```

### 2. Créer un paiement

```javascript
// JavaScript
const payment = await dypay.createPayment({
  amount: 5000,
  currency: 'XAF',
  phone: '+237699000000',
  email: 'client@example.com',
  first_name: 'Jean',
  last_name: 'Dupont'
});

window.location.href = payment.payment_url;
```

### 3. Vérifier un paiement

```javascript
// JavaScript
const payment = await dypay.getPayment('DYP-1234567890-abcdef');
console.log(payment.status);
```

### 4. Gérer les webhooks

Configurez un endpoint webhook pour recevoir les notifications de statut de paiement en temps réel.

```javascript
// JavaScript (Express)
app.post('/webhook/dypay', express.raw({ type: 'application/json' }), (req, res) => {
  const payload = req.body.toString();
  const signature = req.headers['x-dypay-signature'];

  const event = dypay.handleWebhook(payload, signature);

  if (event.status === 'completed') {
    // Paiement réussi
  }

  res.status(200).send('OK');
});
```

## Endpoint API

Tous les SDKs communiquent avec l'endpoint principal :

```
POST https://your-supabase-url/functions/v1/dypay-process-payment
```

### Headers requis

- `Content-Type: application/json`
- `X-API-Key: votre_cle_api`
- `X-Signature: signature_hmac_sha256` (optionnel mais recommandé)

### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| amount | number | Oui | Montant du paiement |
| currency | string | Non | Devise (XAF par défaut) |
| phone | string | Non | Numéro de téléphone |
| operator | string | Non | Opérateur mobile |
| country | string | Non | Code pays (CM, SN, etc.) |
| email | string | Non | Email du client |
| first_name | string | Non | Prénom du client |
| last_name | string | Non | Nom du client |
| item_ref | string | Non | Référence produit |
| return_url | string | Non | URL de redirection |
| notify_url | string | Non | URL webhook |
| metadata | object | Non | Données personnalisées |

## Sécurité

### Signature HMAC

Pour sécuriser vos requêtes, générez une signature HMAC-SHA256 :

```javascript
const crypto = require('crypto');

const payload = JSON.stringify(paymentData);
const signature = crypto
  .createHmac('sha256', apiSecret)
  .update(payload)
  .digest('hex');
```

### Vérification des webhooks

Toujours vérifier la signature des webhooks pour s'assurer qu'ils proviennent de Dypay.

### Protection des clés

- Ne jamais exposer vos clés API côté client
- Utilisez des variables d'environnement
- Utilisez des clés de test pour le développement
- Ne commitez jamais vos clés dans Git

## Devises supportées

- `XAF` - Franc CFA (Cameroun, etc.)
- `XOF` - Franc CFA (Sénégal, Côte d'Ivoire, etc.)
- `CDF` - Franc Congolais
- `UGX` - Shilling Ougandais
- `LRD` - Dollar Libérien
- `GNF` - Franc Guinéen

## Statuts de paiement

- `pending` - En attente de paiement
- `completed` - Paiement réussi
- `failed` - Paiement échoué
- `cancelled` - Paiement annulé

## Exemples par SDK

Chaque SDK contient un fichier d'exemple :

- **JavaScript** : `example.js`
- **Python** : `example.py`
- **PHP** : `example.php`
- **Java** : `Example.java`

Ces exemples montrent comment :
- Initialiser le client
- Créer un paiement
- Vérifier le statut d'un paiement
- Gérer les webhooks

## Support

Pour toute question ou problème :

- **Tableau de bord** : Consultez votre tableau de bord Dypay
- **Documentation API** : Consultez l'onglet "Documentation" dans votre tableau de bord
- **Exemples** : Référez-vous aux fichiers d'exemple inclus dans chaque SDK

## Mises à jour

Les SDKs sont régulièrement mis à jour. Vérifiez les nouvelles versions dans votre tableau de bord.

## Licence

Tous les SDKs sont distribués sous licence MIT. Voir le fichier LICENSE dans chaque SDK pour plus de détails.

---

**Note** : Avant d'utiliser un SDK en production, testez-le en mode test pour vous assurer que tout fonctionne correctement.
