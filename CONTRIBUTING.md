# Guide de Contribution Dypay

Merci de votre interet pour contribuer a Dypay ! Ce guide vous aidera a demarrer.

---

## Code de Conduite

- Soyez respectueux et constructif dans vos interactions
- Signalez tout comportement inapproprie
- Priorisez la securite des utilisateurs et des donnees

---

## Comment Contribuer

### Rapporter un Bug

1. Verifiez que le bug n'est pas deja signale dans les [Issues](https://github.com/votre-utilisateur/dypay/issues)
2. Creez une nouvelle issue avec le template **"Bug Report"**
3. Incluez :
   - Description claire du probleme
   - Etapes pour reproduire
   - Comportement attendu vs actuel
   - Captures d'ecran si possible
   - Environnement (navigateur, OS, etc.)

### Proposer une Fonctionnalite

1. Verifiez que la fonctionnalite n'est pas deja proposee
2. Creez une nouvelle issue avec le template **"Feature Request"**
3. Decrivez :
   - Le probleme que la fonctionnalite resout
   - La solution proposee
   - Les alternatives envisagees

### Soumettre un Pull Request

1. **Forkez** le depot
2. **Creez une branche** depuis `main` :
   ```bash
   git checkout -b feature/nom-de-la-fonctionnalite
   # ou
   git checkout -b fix/nom-du-correctif
   ```
3. **Developpez** votre modification
4. **Testez** votre code :
   ```bash
   npm run build
   npm run lint
   npm run typecheck
   ```
5. **Commitez** avec un message clair :
   ```
   feat: ajout de la fonctionnalite X
   fix: correction du bug Y
   docs: mise a jour de la documentation Z
   ```
6. **Poussez** votre branche :
   ```bash
   git push origin feature/nom-de-la-fonctionnalite
   ```
7. **Creez une Pull Request** vers la branche `main`

---

## Conventions de Code

### Structure des Fichiers

- **Composants** : `src/components/NomDuComposant.tsx`
- **Pages** : `src/pages/NomDeLaPage.tsx`
- **Librairies** : `src/lib/nom-de-la-librairie.ts`
- **Contextes** : `src/contexts/NomDuContexte.tsx`
- **Migrations** : `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
- **Edge Functions** : `supabase/functions/nom-de-la-fonction/index.ts`

### Nommage

- **Composants** : PascalCase (`ProductManagement.tsx`)
- **Fichiers utilitaires** : kebab-case (`service-fees.ts`)
- **Variables et fonctions** : camelCase (`handleSubmit`)
- **Constantes** : UPPER_SNAKE_CASE (`SERVICE_FEE_PERCENTAGE`)
- **Types/Interfaces** : PascalCase (`Product`, `MerchantData`)

### TypeScript

- Utilisez TypeScript pour tout nouveau code
- Definissez des types explicites pour les props et les retours de fonctions
- Evitez `any` autant que possible
- Utilisez les types generes de Supabase quand disponible

### React

- Utilisez des fonctions composants (pas de classes)
- Utilisez les hooks React (`useState`, `useEffect`, etc.)
- Separez la logique metier de l'UI
- Utilisez `useCallback` et `useMemo` pour les optimisations si necessaire

### Tailwind CSS

- Utilisez les classes Tailwind pour le style
- Suivez le systeme d'espacement de 8px
- Utilisez les couleurs du theme defini dans `tailwind.config.js`
- Assurez-vous que le design est responsive

### Securite

- **Ne commitez jamais** de cles API, mots de passe ou donnees sensibles
- Activez toujours le RLS sur les nouvelles tables
- Validez les entrees utilisateur
- Utilisez des requetes parametrees (Supabase le fait par defaut)
- Verifiez les autorisations dans les politiques RLS

### Base de Donnees

- Chaque nouvelle table doit avoir le RLS active
- Chaque politique RLS doit verifier `auth.uid()`
- Utilisez `gen_random_uuid()` pour les IDs
- Ajoutez `created_at` et `updated_at` sur chaque table
- Documentez chaque migration avec un resume en commentaire

### Edge Functions

- Incluez toujours les headers CORS
- Gerez les requetes OPTIONS pour le preflight
- Utilisez `try/catch` pour la gestion d'erreurs
- Preferez les imports `npm:` et `jsr:` pour les dependances
- N'utilisez jamais `deno.land/x` ou `esm.sh`

---

## Processus de Review

1. Un mainteneur examinera votre PR
2. Des commentaires peuvent etre laisses pour des modifications
3. Apres approbation, la PR sera mergee
4. Si des conflits apparaissent, resolvez-les avant le merge

---

## Tests

Avant de soumettre une PR, verifiez :

```bash
# Build
npm run build

# Lint
npm run lint

# Verification de types
npm run typecheck
```

---

## Licence

En contribuant a Dypay, vous acceptez que vos contributions soient sous licence MIT.
