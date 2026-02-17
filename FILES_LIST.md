# 📦 TrustLink Waitlist - Liste des fichiers

## ✅ Fichiers que tu dois avoir dans ~/Waitlist/

```
~/Waitlist/
├── server.js                      ← Serveur de test (NOUVEAU)
├── package.json                   ← Dépendances npm (NOUVEAU)
├── .env                          ← Configuration locale (NOUVEAU)
├── waitlist_schema.sql           ← Schema database
├── waitlist_routes.js            ← Routes API
├── waitlist_admin.html           ← Dashboard admin
├── SETUP_LOCAL.md                ← Instructions setup (NOUVEAU)
├── WAITLIST_INTEGRATION.md       ← Guide intégration
├── WAITLIST_API_TESTS.md         ← Tests API
└── .env.example                  ← Exemple config
```

## 📋 Rôle de chaque fichier

### Fichiers essentiels pour le test

| Fichier | Rôle | Obligatoire |
|---------|------|-------------|
| **server.js** | Serveur Express pour tester | ✅ Oui |
| **package.json** | Dépendances npm | ✅ Oui |
| **.env** | Configuration (DB, admin key) | ✅ Oui |
| **waitlist_schema.sql** | Créer la table database | ✅ Oui |
| **waitlist_routes.js** | Routes API | ✅ Oui |
| **waitlist_admin.html** | Dashboard admin | ✅ Oui |

### Fichiers de documentation

| Fichier | Rôle | 
|---------|------|
| **SETUP_LOCAL.md** | Guide setup pas à pas |
| **WAITLIST_INTEGRATION.md** | Guide intégration dans TrustLink |
| **WAITLIST_API_TESTS.md** | Exemples de tests API |
| **.env.example** | Template de config |

---

## 🚀 Commandes rapides

### Setup complet (copy-paste)

```bash
# 1. Aller dans le dossier
cd ~/Waitlist/

# 2. Créer la database
createdb trustlink_waitlist

# 3. Éditer .env avec ton mot de passe PostgreSQL
nano .env
# Change la ligne DATABASE_URL

# 4. Appliquer le schema
psql trustlink_waitlist -f waitlist_schema.sql

# 5. Installer dépendances
npm install

# 6. Lancer le serveur
npm start

# 7. Ouvrir dans le navigateur
# http://localhost:3000
```

---

## ✅ Checklist de vérification

Avant de lancer le serveur, assure-toi que :

- [ ] Tous les fichiers sont dans ~/Waitlist/
- [ ] PostgreSQL est démarré
- [ ] Database `trustlink_waitlist` créée
- [ ] Schema appliqué (table `waitlist` existe)
- [ ] `.env` configuré avec le bon mot de passe
- [ ] Dépendances installées (`npm install`)

Ensuite : `npm start` 🚀

---

## 🔄 Workflow typique

1. **Développement local**
   - Tester la waitlist dans ~/Waitlist/
   - Vérifier que tout marche

2. **Intégration TrustLink**
   - Copier les fichiers dans le projet principal
   - Suivre WAITLIST_INTEGRATION.md

3. **Déploiement**
   - Push sur GitHub
   - Render redéploie automatiquement

---

## 🆘 Aide

Si tu as un problème :
1. Lis **SETUP_LOCAL.md** (problèmes courants)
2. Vérifie que PostgreSQL tourne : `sudo systemctl status postgresql`
3. Teste la connexion DB : `psql trustlink_waitlist`

Bon test ! 🎯
