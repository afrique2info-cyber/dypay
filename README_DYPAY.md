# Dypay - Agrégateur de Paiement

Dypay est votre plateforme d'agrégation de paiement complète pour l'Afrique. Elle permet aux marchands d'accepter des paiements mobiles dans leur boutique en ligne facilement et en toute sécurité.

## Fonctionnalités principales

### Pour les marchands (propriétaires de boutiques)

1. **Inscription simple** - Créez un compte marchand en quelques secondes
2. **Gestion des clés API** - Générez des clés API de test et de production
3. **Tableau de bord complet** - Visualisez vos revenus, transactions et solde en temps réel
4. **Historique des transactions** - Suivez toutes vos transactions avec filtres et recherche
5. **Documentation intégrée** - Accédez à la documentation d'intégration directement depuis votre dashboard

### Pour les développeurs

1. **API simple** - Une seule requête HTTP pour créer un paiement
2. **Multi-opérateurs** - Support de Orange, MTN, Airtel, et plus
3. **Multi-pays** - Cameroun, Sénégal, RD Congo, Ouganda, et plus
4. **Sécurisé** - Authentification par clé API, RLS activé sur toutes les tables
5. **Webhooks** - Recevez des notifications en temps réel

## Architecture

### Base de données (Supabase)

- **merchants** - Informations des marchands
- **api_keys** - Clés API pour l'authentification
- **merchant_transactions** - Historique de toutes les transactions
- **merchant_settings** - Configuration des marchands (webhooks, etc.)

### Edge Functions

- **dypay-process-payment** - Endpoint public pour créer des paiements
  - Authentification via clé API
  - Traitement sécurisé des paiements mobiles
  - Création automatique des transactions

### Frontend (React + TypeScript)

- **MerchantAuth** - Page d'inscription/connexion
- **MerchantDashboard** - Tableau de bord principal avec onglets
- **TransactionHistory** - Liste des transactions avec filtres
- **IntegrationDocs** - Documentation pour les développeurs
- **API Keys Management** - Création et gestion des clés

## Utilisation

### Pour les marchands

1. Ouvrez l'application
2. Créez un compte marchand
3. Générez une clé API (Test ou Production)
4. Copiez la clé et intégrez-la dans votre application
5. Suivez vos transactions dans le dashboard

### Pour les développeurs (intégration)

```javascript
// Créer un paiement
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
    last_name: 'Dupont'
  })
});

const result = await response.json();

if (result.success) {
  window.location.href = result.payment_url;
}
```

Voir `INTEGRATION_EXAMPLE.md` pour plus d'exemples.

## Sécurité

- **RLS (Row Level Security)** activé sur toutes les tables
- Les marchands ne peuvent voir que leurs propres données
- Authentification obligatoire pour accéder au dashboard
- Les clés API sont vérifiées côté serveur
- Les secrets ne sont jamais exposés côté client

## Prochaines étapes

1. **SDK officiel** - Créer un package npm `@dypay/sdk`
2. **Webhooks** - Système de notification automatique
3. **Analytics** - Graphiques et statistiques avancées
4. **Multi-devises** - Support automatique de conversion
5. **API de retrait** - Permettre aux marchands de retirer leurs fonds
6. **Dashboard admin** - Pour gérer les marchands et les transactions

## Technologies utilisées

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Paiement**: Agrégation multi-opérateurs mobile money
- **Build**: Vite

## Support

Pour toute question ou assistance, contactez l'équipe Dypay via le dashboard.

---

**Dypay** - Simplifions les paiements en Afrique
