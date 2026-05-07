# Système de Conversion de Devises - Dypay

## Vue d'ensemble

Le système de conversion de devises permet aux marchands de gérer leurs transactions dans leur devise locale tout en acceptant les paiements dans différentes devises. Les taux de change sont mis à jour automatiquement pour garantir une conversion précise.

## Fonctionnalités

### 1. Base de données

#### Tables créées :
- **`supported_currencies`** : Liste des devises supportées (XAF, XOF, NGN, GHS, KES, TZS, UGX, ZAR, MAD, EGP, USD, EUR, GBP)
- **`currency_exchange_rates`** : Taux de change entre devises avec horodatage
- **Colonnes ajoutées à `merchants`** :
  - `currency` : Devise préférée du marchand
  - `country` : Pays du marchand

#### Devises supportées :
- **Afrique Centrale** : XAF (FCFA)
- **Afrique de l'Ouest** : XOF (CFA)
- **Nigeria** : NGN (Naira)
- **Ghana** : GHS (Cedi)
- **Kenya** : KES (Shilling)
- **Tanzanie** : TZS (Shilling)
- **Ouganda** : UGX (Shilling)
- **Afrique du Sud** : ZAR (Rand)
- **Maroc** : MAD (Dirham)
- **Égypte** : EGP (Pound)
- **International** : USD, EUR, GBP

### 2. Inscription des marchands

Lors de l'inscription, chaque marchand doit choisir :
- **Son pays** : Détermine automatiquement la devise par défaut
- **Sa devise** : Toutes les transactions seront affichées dans cette devise

### 3. Mise à jour automatique des taux

Une fonction edge déployée (`update-exchange-rates`) permet de :
- Récupérer les taux de change en temps réel depuis une API externe
- Calculer les taux croisés entre toutes les devises
- Mettre à jour la base de données automatiquement
- Endpoint : `/functions/v1/update-exchange-rates`

### 4. Fonctions de conversion

Le fichier `src/lib/currency.ts` fournit :
- `getSupportedCurrencies()` : Liste toutes les devises disponibles
- `getExchangeRate(from, to)` : Obtient le taux de change entre deux devises
- `convertCurrency(amount, from, to)` : Convertit un montant
- `formatCurrency(amount, code, symbol)` : Formate un montant avec le symbole approprié
- `updateExchangeRate()` : Met à jour un taux de change
- `getCurrencyByCountry()` : Trouve la devise d'un pays

### 5. Affichage dans le Dashboard

Le tableau de bord marchand affiche automatiquement :
- Revenus dans la devise du marchand
- Solde disponible converti
- Symbole de devise approprié

## Utilisation

### Appeler la mise à jour des taux de change

```bash
curl -X POST https://[VOTRE-PROJET].supabase.co/functions/v1/update-exchange-rates
```

### Convertir une devise en code

```typescript
import { convertCurrency, formatCurrency } from './lib/currency';

// Convertir 1000 XAF en USD
const amountInUSD = await convertCurrency(1000, 'XAF', 'USD');

// Formater pour l'affichage
const formatted = formatCurrency(1000, 'XAF', 'FCFA');
// Résultat: "1 000 FCFA"
```

### Obtenir les devises supportées

```typescript
import { getSupportedCurrencies } from './lib/currency';

const currencies = await getSupportedCurrencies();
currencies.forEach(currency => {
  console.log(`${currency.name} (${currency.code}): ${currency.symbol}`);
});
```

## Production

### Configuration recommandée

1. **API FastForex** :
   - L'application utilise l'API FastForex pour récupérer les taux de change en temps réel
   - Endpoint : `https://api.fastforex.io/fetch-multi`
   - La clé API est configurée automatiquement dans les variables d'environnement

2. **Mise à jour automatique des taux** :
   - Créer un cron job pour appeler `/functions/v1/update-exchange-rates` toutes les heures
   - Ou utiliser Supabase Edge Functions avec un trigger schedulé
   - Exemple de cron : `0 * * * *` (toutes les heures)

3. **Cache des taux** :
   - Les taux sont stockés en base avec timestamp
   - Réutilisation des taux récents pour éviter les appels API excessifs
   - FastForex fournit un timestamp de mise à jour dans sa réponse

4. **Fallback** :
   - Si un taux n'est pas disponible, utiliser le taux inverse
   - Si aucun taux n'existe, retourner `null` et afficher un avertissement
   - Valeurs par défaut intégrées en cas d'erreur API

5. **Sécurité** :
   - Les taux ne peuvent être modifiés que par le service role
   - Lecture publique pour tous les utilisateurs authentifiés
   - La clé API FastForex n'est jamais exposée côté client

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              FastForex API                           │
│         (api.fastforex.io/fetch-multi)              │
│  - Taux de change en temps réel                     │
│  - Support multi-devises                            │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│       Edge Function: update-exchange-rates           │
│  - Récupère les taux depuis FastForex               │
│  - Calcule les taux croisés                         │
│  - Met à jour la base de données                    │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│         Supabase Database                            │
│  ┌─────────────────────────────────────────────┐   │
│  │   currency_exchange_rates                    │   │
│  │  - base_currency                             │   │
│  │  - target_currency                           │   │
│  │  - rate                                      │   │
│  │  - last_updated                              │   │
│  └─────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│         Frontend Application                         │
│  - Dashboard affiche montants convertis              │
│  - Sélection devise lors inscription                │
│  - Formatage automatique                             │
└─────────────────────────────────────────────────────┘
```

## Exemples de taux

| De  | Vers | Taux approx. | Exemple       |
|-----|------|-------------|---------------|
| XAF | USD  | 0.00165     | 1000 XAF = 1.65 USD |
| XAF | EUR  | 0.00152     | 1000 XAF = 1.52 EUR |
| XAF | NGN  | 1.35        | 1000 XAF = 1350 NGN |
| USD | XAF  | 606         | 1 USD = 606 XAF     |

## Notes importantes

- Les taux de change fluctuent constamment ; mettre à jour régulièrement
- Toujours stocker les montants en devise de base (XAF) dans la base de données
- Convertir uniquement pour l'affichage
- Conserver un historique des taux pour l'audit
