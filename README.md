# Dypay - Plateforme d'Aggregation de Paiements Mobile Money en Afrique

Dypay est une plateforme de paiement complete permettant aux marchands africains d'accepter des paiements Mobile Money (MTN, Orange Money, Airtel, etc.), de gerer des boutiques en ligne, de vendre des produits digitaux, et de traiter des transactions POS -- le tout avec un tableau de bord marchand complet et des outils developpeur.

---

## Fonctionnalites Principales

### Paiements
- Integration Monetbil pour Mobile Money (MTN, Orange Money, Airtel, etc.)
- Support multi-pays : Cameroun, Senegal, RDC, Ouganda, Liberia, Congo-Brazzaville
- Support multi-devises : XAF, XOF, NGN, GHS, KES, TZS, UGX, CDF, LRD
- Generation de liens de paiement partageables
- Paiement par QR Code
- Webhooks pour notifications en temps reel
- Suivi des statuts de paiement (en attente, complete, echoue, annule)

### E-Commerce
- Creation et gestion de boutiques en ligne multiples
- Produits physiques et digitaux (ebooks, formations, logiciels)
- Panier d'achat et processus de checkout
- Gestion des commandes avec confirmation et suivi
- Livraison automatique des produits digitaux apres paiement
- Prix multi-devises par produit
- Gestion du stock avec historique

### Personnalisation de Boutique
- Editeur visuel de pages (Page Builder) avec blocs drag-and-drop
- Systeme de themes avec couleurs, polices et images personnalisees
- Blocs disponibles : Hero, Texte, CTA, Image, Features, Grille Produits, Espacement

### Point de Vente (POS)
- Interface de paiement en magasin
- Selection d'operateur Mobile Money
- Historique des transactions POS

### Outils Developpeur
- Cles API (test et production) avec verification HMAC-SHA256
- Webhooks configurables par marchand
- SDK officiels : JavaScript, Python, PHP, Java
- Documentation API integree

### Fonctionnalites Avancees
- Cartes virtuelles pour marchands
- Retraits de fonds avec securite PIN
- Taux de change en temps reel (FastForex API)
- Systeme de commissions configurable
- Analytiques et historique des ventes
- Exportation de donnees

### Securite
- Row Level Security (RLS) sur toutes les tables
- Isolation des donnees par marchand
- Verification de signature HMAC-SHA256 pour les API
- Protection contre le force brute sur les PINs de retrait
- Tokens de telechargement avec expiration
- Controles d'acces public/prive par fonctionnalite

---

## Architecture Technique

### Frontend
- **React 18.3** avec TypeScript 5.5
- **React Router DOM 7.12** pour le routage
- **Tailwind CSS 3.4** pour le style
- **Lucide React** pour les icones
- **Vite 5.4** comme bundler
- **qrcode.react** pour les QR codes

### Backend
- **Supabase** (PostgreSQL, Edge Functions, Auth, Storage)
- **Deno** runtime pour les Edge Functions
- **Monetbil API** pour les paiements Mobile Money
- **FastForex API** pour les taux de change

### Base de Donnees
22 tables PostgreSQL avec RLS active :

| Table | Description |
|-------|-------------|
| `merchants` | Profils marchands |
| `api_keys` | Cles API developpeur |
| `payments` | Transactions de paiement |
| `payment_links` | Liens de paiement partageables |
| `pos_transactions` | Transactions point de vente |
| `shops` | Boutiques en ligne |
| `products` | Catalogue de produits |
| `cart_items` | Articles du panier |
| `orders` | Commandes clients |
| `digital_downloads` | Acces telechargement digital |
| `download_tokens` | Liens de telechargement securises |
| `virtual_cards` | Cartes virtuelles |
| `withdrawals` | Demandes de retrait |
| `merchant_balances` | Solde des comptes |
| `withdrawal_pins` | PINs de securite retrait |
| `merchant_webhooks` | Configurations webhook |
| `shop_page_configs` | Configurations Page Builder |
| `shop_themes` | Themes de boutique |
| `supported_currencies` | Devises disponibles |
| `currency_exchange_rates` | Taux de change |
| `admin_config` | Configuration plateforme |
| `payment_commissions` | Suivi des commissions |
| `stock_history` | Historique du stock |
| `card_transactions` | Transactions cartes virtuelles |

### Edge Functions (6 fonctions serverless)

| Fonction | Description |
|----------|-------------|
| `dypay-process-payment` | Traitement des paiements |
| `monetbil-webhook` | Reception des notifications Monetbil |
| `process-withdrawal` | Traitement des retraits |
| `generate-download-link` | Generation de liens de telechargement |
| `update-exchange-rates` | Mise a jour des taux de change |
| `trigger-webhooks` | Envoi des notifications webhook |

### Routes Frontend

| Route | Page |
|-------|------|
| `/` | Landing page |
| `/auth`, `/dashboard` | Authentification et tableau de bord marchand |
| `/pos` | Interface Point de Vente |
| `/about` | A propos |
| `/pricing` | Tarification |
| `/contact` | Contact |
| `/documentation` | Documentation |
| `/api-documentation` | Documentation API detaillee |
| `/pay/:linkId` | Page de paiement par lien |
| `/payment/success` | Confirmation de paiement |
| `/shop/:slug` | Boutique publique |
| `/shop/:shopSlug/product/:productId` | Detail produit |
| `/shop/:shopSlug/cart` | Panier d'achat |
| `/shop/:shopSlug/checkout` | Checkout |
| `/shop/:shopSlug/order/:orderNumber` | Confirmation de commande |
| `/my-downloads` | Telechargements digitaux du client |

---

## Installation Rapide

```bash
# Cloner le depot
git clone https://github.com/votre-utilisateur/dypay.git
cd dypay

# Installer les dependances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Editer .env avec vos cles (voir INSTALL.md pour les details)

# Lancer le serveur de developpement
npm run dev

# Build pour la production
npm run build
```

Pour le guide d'installation complet, consultez [INSTALL.md](./INSTALL.md).

---

## Utilisation

Pour la documentation complete d'utilisation, consultez [USAGE.md](./USAGE.md).

### Demarrage rapide

1. **Inscription marchand** : Allez sur `/auth` et creez un compte
2. **Configuration** : Completez votre profil marchand avec les informations de votre entreprise
3. **Creer une boutique** : Onglet "Boutiques" > "Creer une boutique"
4. **Ajouter des produits** : Onglet "Produits" > "Ajouter un Produit" > Choisir "Produit digital" ou "Produit physique"
5. **Recevoir des paiements** : Partagez vos liens de paiement ou votre boutique avec vos clients

---

## SDK Disponibles

| Langage | Repertoire | Installation |
|---------|-----------|--------------|
| JavaScript/Node.js | `public/sdks/javascript/` | `npm install dypay` |
| Python | `public/sdks/python/` | `pip install dypay` |
| PHP | `public/sdks/php/` | `composer require dypay/sdk` |
| Java | `public/sdks/java/` | Maven/Gradle |

Chaque SDK inclut le code source, des exemples, et une documentation.

---

## Structure du Projet

```
dypay/
├── public/
│   ├── sdks/                    # SDK officiels (JS, Python, PHP, Java)
│   ├── close-up-payment.jpg
│   ├── dyapy_pos.png
│   └── modern-payment.jpg
├── src/
│   ├── components/
│   │   ├── builder/             # Composants du Page Builder
│   │   │   └── blocks/         # Blocs du Page Builder
│   │   ├── ApiKeys.tsx
│   │   ├── CartContext.tsx
│   │   ├── DigitalDownloads.tsx
│   │   ├── MerchantAuth.tsx
│   │   ├── MerchantDashboard.tsx
│   │   ├── MerchantSettings.tsx
│   │   ├── OrdersList.tsx
│   │   ├── PageBuilderManager.tsx
│   │   ├── PaymentForm.tsx
│   │   ├── PaymentLinkGenerator.tsx
│   │   ├── POSInterface.tsx
│   │   ├── ProductManagement.tsx
│   │   ├── ShopManagement.tsx
│   │   ├── Sidebar.tsx
│   │   ├── VirtualCardManager.tsx
│   │   ├── WebhookManager.tsx
│   │   └── WithdrawalManager.tsx
│   ├── contexts/
│   │   └── CartContext.tsx
│   ├── lib/
│   │   ├── api-keys.ts
│   │   ├── auth.ts
│   │   ├── cart.ts
│   │   ├── currency.ts
│   │   ├── monetbil.ts
│   │   ├── orders.ts
│   │   ├── page-builder.ts
│   │   ├── products.ts
│   │   ├── service-fees.ts
│   │   ├── shops.ts
│   │   ├── supabase.ts
│   │   ├── virtual-cards.ts
│   │   └── withdrawals.ts
│   ├── pages/
│   │   ├── About.tsx
│   │   ├── APIDocumentation.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── Contact.tsx
│   │   ├── Documentation.tsx
│   │   ├── Home.tsx
│   │   ├── LandingPage.tsx
│   │   ├── MyDownloads.tsx
│   │   ├── OrderConfirmation.tsx
│   │   ├── PaymentLinkPage.tsx
│   │   ├── PaymentSuccess.tsx
│   │   ├── POSPage.tsx
│   │   ├── Pricing.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── ShopPublicPage.tsx
│   │   └── ...
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── supabase/
│   ├── functions/               # Edge Functions Deno
│   │   ├── dypay-process-payment/
│   │   ├── monetbil-webhook/
│   │   ├── process-withdrawal/
│   │   ├── generate-download-link/
│   │   ├── update-exchange-rates/
│   │   └── trigger-webhooks/
│   └── migrations/              # Migrations SQL (22+ fichiers)
├── .env.example
├── INSTALL.md
├── USAGE.md
├── CONTRIBUTING.md
├── LICENSE
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Contribution

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines.

---

## Licence

MIT License - voir le fichier [LICENSE](./LICENSE) pour les details.

---

## Support

- **Documentation** : [USAGE.md](./USAGE.md)
- **Installation** : [INSTALL.md](./INSTALL.md)
- **Contribution** : [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Issues** : [GitHub Issues](https://github.com/votre-utilisateur/dypay/issues)
