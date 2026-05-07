# Guide d'Installation Dypay

Ce guide detaille l'installation complete de Dypay, du clonage du depot jusqu'au deploiement en production.

---

## Prerequis

### Logiciels requis
- **Node.js** >= 18.x (recommande : 20.x LTS)
- **npm** >= 9.x (inclus avec Node.js)
- **Git** >= 2.x

### Comptes externes requis
- **Supabase** : [https://supabase.com](https://supabase.com) - Base de donnees, Auth, Storage, Edge Functions
- **Monetbil** : [https://monetbil.com](https://monetbil.com) - Paiements Mobile Money
- **FastForex** : [https://fastforex.io](https://fastforex.io) - Taux de change (optionnel)

### Verifier les prerequis
```bash
node --version    # Doit afficher v18+ ou v20+
npm --version     # Doit afficher 9+
git --version     # Doit afficher 2+
```

---

## Etape 1 : Cloner le Depot

```bash
git clone https://github.com/votre-utilisateur/dypay.git
cd dypay
```

---

## Etape 2 : Installer les Dependances

```bash
npm install
```

Cela installe toutes les dependances definies dans `package.json` :
- React 18.3, React DOM 18.3
- React Router DOM 7.12
- Supabase JS Client 2.57+
- Tailwind CSS 3.4
- Lucide React (icones)
- qrcode.react (QR codes)
- Vite 5.4 (bundler)
- TypeScript 5.5

---

## Etape 3 : Configurer Supabase

### 3.1 Creer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com) et connectez-vous
2. Cliquez sur **"New Project"**
3. Remplissez les informations :
   - **Name** : `dypay` (ou le nom de votre choix)
   - **Database Password** : Choisissez un mot de passe fort
   - **Region** : Selectionnez la region la plus proche de vos utilisateurs
4. Attendez que le projet soit initialise (1-2 minutes)

### 3.2 Recuperer les cles du projet

1. Dans le dashboard Supabase, allez dans **Settings > API**
2. Notez les valeurs suivantes :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public** : `eyJhbGci...` (cle publique)
   - **service_role** : `eyJhbGci...` (cle secrete - a garder privee!)

### 3.3 Appliquer les migrations de base de donnees

Les fichiers de migration se trouvent dans `supabase/migrations/`. Ils doivent etre appliques dans l'ordre.

**Option A : Via le dashboard Supabase (recommande)**

1. Allez dans **SQL Editor** dans le dashboard Supabase
2. Copiez le contenu de chaque fichier de migration dans l'ordre chronologique
3. Executez chaque migration une par une

Les migrations a appliquer dans l'ordre :

```
01. 20251105133149_create_payments_tables.sql
02. 20260121144619_add_merchant_insert_policy.sql
03. 20260121144857_fix_merchant_signup_with_trigger.sql
04. 20260122081236_create_payment_links.sql
05. 20260122082127_remove_monetbil_service_key_from_merchants.sql
06. 20260122082810_add_merchant_id_to_payments.sql
07. 20260128141932_add_public_access_to_payment_links.sql
08. 20260128143746_fix_virtual_cards_merchant_reference.sql
09. 20260128143923_add_merchant_payments_policy.sql
10. 20260129125426_add_api_keys_delete_update_policies.sql
11. 20260129125536_fix_payments_security_policies.sql
12. 20260211154615_create_shops_table.sql
13. 20260211171353_create_products_and_orders_tables.sql
14. 20260212082809_add_currency_and_countries_to_shops.sql
15. 20260212094242_add_multi_currency_prices_to_products.sql
16. 20260212112556_add_accept_all_countries_to_shops.sql
17. 20260212114719_fix_orders_insert_policy.sql
18. 20260212115347_fix_orders_insert_policy_v2.sql
19. 20260213134410_create_shop_page_builder.sql
20. 20260218094308_add_account_types_to_merchants.sql
21. 20260218094448_update_merchant_trigger_for_account_type.sql
22. 20260218095035_fix_merchant_trigger_error_handling.sql
23. 20260218095117_remove_duplicate_merchant_trigger.sql
24. 20260218110830_add_currency_and_country_to_pos.sql
25. 20260218111105_create_pos_transactions_table.sql
26. 20260218132751_create_admin_config_and_commissions.sql
27. 20260220102620_add_service_role_access_to_admin_config.sql
28. 20260220103125_fix_admin_config_service_role_access.sql
29. 20260220103136_disable_rls_for_admin_config.sql
30. 20260220104714_fix_orders_rls_complete_v2.sql
31. 20260224093837_create_currency_exchange_system_v2.sql
32. 20260224100916_create_withdrawals_and_pin_system.sql
33. 20260224120141_add_withdrawal_pins_insert_policy.sql
34. 20260226151820_add_shop_themes.sql
35. 20260301084909_update_merchant_stats_on_transaction.sql
36. 20260301085941_create_merchant_webhooks_fixed.sql
37. 20260302094436_fix_pos_trigger_status.sql
38. 20260302105958_add_default_currency_country_to_merchants.sql
39. 20260302115959_add_stock_management_to_products.sql
40. 20260302155316_add_more_professional_themes.sql
41. 20260302160953_add_custom_theme_images_to_shops.sql
42. 20260302161114_create_shop_images_storage_bucket.sql
43. 20260304131512_add_digital_products_system.sql
44. 20260304131536_create_digital_products_storage_v2.sql
```

**Option B : Via la CLI Supabase**

```bash
# Installer la CLI Supabase
npm install -g supabase

# Lier le projet
supabase link --project-ref votre-project-ref

# Appliquer les migrations
supabase db push
```

### 3.4 Configurer le Storage

1. Allez dans **Storage** dans le dashboard Supabase
2. Verifiez que les buckets suivants existent (cres par les migrations) :
   - `digital-products` : Pour les fichiers de produits digitaux
   - `shop-images` : Pour les images de boutique
3. Configurez les politiques de stockage si necessaire

### 3.5 Configurer l'Authentification

1. Allez dans **Authentication > Providers** dans le dashboard
2. Assurez-vous que **Email/Password** est active (par defaut)
3. Desactivez **Email Confirmation** si vous ne voulez pas de confirmation par email :
   - Allez dans **Authentication > Settings**
   - Desactivez **"Enable email confirmations"**

---

## Etape 4 : Configurer les Edge Functions

Les Edge Functions sont deployees directement depuis le code. Elles sont dans `supabase/functions/`.

### 4.1 Deployer les fonctions

Deployez chaque fonction via le dashboard Supabase ou la CLI :

```bash
# Via la CLI Supabase
supabase functions deploy dypay-process-payment
supabase functions deploy monetbil-webhook
supabase functions deploy process-withdrawal
supabase functions deploy generate-download-link
supabase functions deploy update-exchange-rates
supabase functions deploy trigger-webhooks
```

### 4.2 Configurer les secrets des Edge Functions

Dans le dashboard Supabase, allez dans **Edge Functions > Secrets** et ajoutez :

```
MONETBIL_SERVICE_KEY=votre_cle_monetbil
FASTFOREX_API_KEY=votre_cle_fastforex
```

Les variables suivantes sont automatiquement disponibles :
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

---

## Etape 5 : Configurer les Variables d'Environnement

### 5.1 Creer le fichier .env

```bash
cp .env.example .env
```

### 5.2 Remplir les variables

Editez le fichier `.env` avec vos valeurs :

```env
# Supabase (obligatoire)
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Monetbil (obligatoire pour les paiements)
VITE_MONETBIL_SERVICE_KEY=votre_cle_monetbil_service
```

### Description des variables

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `VITE_SUPABASE_URL` | Oui | URL de votre projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Oui | Cle anonyme Supabase (publique) |
| `VITE_MONETBIL_SERVICE_KEY` | Oui | Cle de service Monetbil pour les paiements |

> **Note** : Les variables prefixees par `VITE_` sont exposees cote client. Ne mettez jamais de cles secretes dans ces variables. Les cles sensibles (service_role, etc.) sont gerees cote serveur via les secrets Supabase.

---

## Etape 6 : Configurer Monetbil

1. Creez un compte sur [https://monetbil.com](https://monetbil.com)
2. Creez un service de paiement
3. Recuperez votre **Service Key**
4. Configurez le webhook de retour :
   - URL : `https://votre-projet.supabase.co/functions/v1/monetbil-webhook`
   - Methode : POST
5. Ajoutez la cle dans vos variables d'environnement et secrets

---

## Etape 7 : Lancer le Projet

### Developpement

```bash
npm run dev
```

Le serveur de developpement demarre sur `http://localhost:5173`.

### Build de Production

```bash
npm run build
```

Les fichiers de production sont generes dans le dossier `dist/`.

### Previsualiser le Build

```bash
npm run preview
```

---

## Etape 8 : Deploiement en Production

### Option A : Vercel (recommande)

```bash
# Installer Vercel CLI
npm install -g vercel

# Deployer
vercel
```

Configurez les variables d'environnement dans le dashboard Vercel :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_MONETBIL_SERVICE_KEY`

### Option B : Netlify

```bash
# Build
npm run build

# Deployer
npx netlify-cli deploy --prod --dir=dist
```

### Option C : Serveur propre (Nginx)

```bash
# Build
npm run build

# Copier les fichiers dans le repertoire web
cp -r dist/* /var/www/dypay/
```

Configuration Nginx minimale :

```nginx
server {
    listen 80;
    server_name dypay.com;
    root /var/www/dypay;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Verification de l'Installation

Apres avoir lance le serveur, verifiez les points suivants :

1. **Landing page** : `http://localhost:5173/` doit afficher la page d'accueil
2. **Inscription** : `http://localhost:5173/auth` doit afficher le formulaire d'inscription
3. **Dashboard** : Apres inscription, le tableau de bord doit se charger
4. **Boutiques** : L'onglet "Boutiques" doit fonctionner
5. **Produits** : L'onglet "Produits" doit permettre d'ajouter des produits
6. **Paiement** : Un lien de paiement doit rediriger vers Monetbil

---

## Resolution des Problemes

### Erreur "Invalid Supabase URL"
- Verifiez que `VITE_SUPABASE_URL` est correct dans `.env`
- L'URL doit etre au format `https://xxxxx.supabase.co`

### Erreur "Missing Supabase API Key"
- Verifiez que `VITE_SUPABASE_ANON_KEY` est correct dans `.env`

### Les migrations echouent
- Verifiez que vous executez les migrations dans l'ordre chronologique
- Certaines migrations dependent des precedentes

### Les Edge Functions ne fonctionnent pas
- Verifiez que les secrets sont configures dans Supabase
- Verifiez les logs dans le dashboard Supabase > Edge Functions > Logs

### Les paiements ne fonctionnent pas
- Verifiez votre cle Monetbil
- Verifiez que le webhook Monetbil est configure
- Verifiez les logs de l'Edge Function `monetbil-webhook`

### Erreur CORS
- Les Edge Functions incluent deja les headers CORS
- Si vous avez des problemes, verifiez que les headers sont bien presents

---

## Mise a Jour

```bash
# Recuperer les dernieres modifications
git pull origin main

# Installer les nouvelles dependances
npm install

# Appliquer les nouvelles migrations (si necessaire)
# Verifiez les nouveaux fichiers dans supabase/migrations/

# Relancer le serveur
npm run dev
```
