# 🚀 FitPro Fitness - Pipeline CI/CD & Déploiement

## 📋 Vue d'ensemble

Ce projet utilise un pipeline CI/CD complet avec trois environnements :
- **Development** : Branche `develop` → Déploiement automatique sur URL de dev
- **Test** : Validation des PR avant merge
- **Production** : Branche `main` → Déploiement sur domaine principal

## 🛠️ Configuration initiale

### 1. Prérequis

- Compte GitHub avec repository
- Compte Vercel avec organisation
- Variables d'environnement configurées

### 2. Secrets GitHub (dans Settings > Secrets and variables > Actions)

```bash
# Obligatoires
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id

# Pour les déploiements multi-environnements
VERCEL_PROJECT_ID_DEV=your_dev_project_id
VERCEL_PROJECT_ID_PROD=your_prod_project_id
```

### 3. Configuration Vercel

#### Projet Development
- **Nom** : `fitpro-fitness-dev`
- **Domaine** : `dev-fitpro.vercel.app`

#### Projet Production
- **Nom** : `fitpro-fitness`
- **Domaine** : `fitpro.vercel.app`

## 🌍 Variables d'environnement

### Fichiers d'environnement créés :
- `env/development.env` - Configuration développement
- `env/test.env` - Configuration test
- `env/production.env` - Configuration production

### Variables importantes à configurer :

#### Développement local :
```bash
cp env/development.env .env.local
# Éditer .env.local avec vos vraies valeurs
```

#### Vercel Dashboard :
Aller dans chaque projet Vercel et ajouter :
- `NODE_ENV`
- `NEXT_PUBLIC_APP_ENV`
- `KV_URL` (Upstash Redis)
- `KV_REST_API_*` (tokens Upstash)
- Autres variables selon besoins

## 🚀 Pipeline CI/CD

### Workflow GitHub Actions

Le fichier `.github/workflows/deploy.yml` gère :

#### Job `test` (sur toute PR et push)
- ✅ Installation des dépendances
- ✅ Linting (`pnpm lint`)
- ✅ Tests (`pnpm test`)
- ✅ Build de test

#### Job `deploy-dev` (push sur `develop`)
- ✅ Build pour développement
- ✅ Déploiement sur Vercel (dev)
- ✅ Alias domaine : `dev-fitpro.yourdomain.com`

#### Job `deploy-prod` (push sur `main`)
- ✅ Build pour production
- ✅ Déploiement sur Vercel (prod)
- ✅ Alias domaine : `fitpro.yourdomain.com`

#### Job `deploy-preview` (sur PR)
- ✅ Build preview
- ✅ Déploiement preview automatique
- ✅ Commentaire GitHub avec lien

## 📦 Scripts de build

```bash
# Développement
pnpm build:dev

# Test
pnpm build:test

# Production
pnpm build:prod

# Développement local
pnpm dev

# Production locale
pnpm build && pnpm start
```

## 🔧 Configuration des domaines personnalisés

### Dans Vercel Dashboard :

#### Projet Development :
1. Settings > Domains
2. Ajouter : `dev-fitpro.yourdomain.com`
3. Configurer CNAME

#### Projet Production :
1. Settings > Domains
2. Ajouter : `fitpro.yourdomain.com`
3. Configurer CNAME

### Dans votre registrar DNS :
```bash
# Développement
dev-fitpro.yourdomain.com CNAME dev-fitpro.vercel.app

# Production
fitpro.yourdomain.com CNAME fitpro.vercel.app
```

## 🔐 Sécurité et environnements

### Rate Limiting (Upstash Redis)
- **Dev** : Limite basse pour tests
- **Prod** : Limite stricte (5 req/h)

### Variables sensibles
- **Jamais** dans le code
- **Toujours** dans Vercel env vars
- **Différentes** par environnement

## 🚀 Déploiement manuel

### Via Vercel CLI (optionnel)
```bash
# Installation
pnpm add -D vercel

# Deploy dev
vercel --prod=false

# Deploy prod
vercel --prod=true
```

## 📊 Monitoring et logs

### Vercel Analytics
- Activé par défaut
- Logs accessibles dans le dashboard

### Sentry (optionnel)
Pour monitoring d'erreurs avancées :
```bash
pnpm add @sentry/nextjs
```

## 🧪 Tests

Actuellement : `echo 'No tests defined yet'`

Pour ajouter des tests :
```bash
pnpm add -D jest @testing-library/react
# Configurer jest.config.js
```

## 🔄 Workflow recommandé

### Développement
1. Créer branche feature : `feature/nouvelle-fonctionnalite`
2. Développer et tester localement
3. Push → PR vers `develop`
4. Tests automatiques s'exécutent
5. Review et merge dans `develop`
6. Déploiement automatique sur dev

### Production
1. PR de `develop` vers `main`
2. Tests automatiques
3. Review finale
4. Merge → Déploiement automatique sur prod

## 🆘 Support

En cas de problème :
1. Vérifier les logs GitHub Actions
2. Vérifier les logs Vercel
3. Vérifier les variables d'environnement

## 📝 Notes importantes

- ⏱️ **Build time** : ~2-3 minutes
- 🔒 **Sécurité** : Variables chiffrées
- 🚀 **Auto-deploy** : Push = déploiement
- 🔄 **Rollback** : Possible via Git revert

---

🎉 **Votre projet est maintenant prêt pour un déploiement professionnel avec CI/CD complet !**
