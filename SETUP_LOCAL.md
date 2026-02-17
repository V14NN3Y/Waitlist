# TrustLink Waitlist - Test Local Setup

## 🚀 Installation Rapide (5 minutes)

### Étape 1 : Créer la database

```bash
# Dans ton terminal
createdb trustlink_waitlist
```

Si ça ne marche pas, essaie avec ton user PostgreSQL :
```bash
sudo -u postgres createdb trustlink_waitlist
```

### Étape 2 : Configurer la connexion

Édite le fichier `.env` et change le mot de passe :

```env
DATABASE_URL=postgresql://postgres:TON_MOT_DE_PASSE@localhost:5432/trustlink_waitlist
```

**Trouver ton mot de passe PostgreSQL :**
- Si tu ne le connais pas, tu peux le réinitialiser :
```bash
sudo -u postgres psql
# Dans psql :
ALTER USER postgres PASSWORD 'nouveau_mot_de_passe';
\q
```

### Étape 3 : Appliquer le schema

```bash
psql trustlink_waitlist -f waitlist_schema.sql
```

Si erreur de permission, essaie :
```bash
sudo -u postgres psql trustlink_waitlist -f waitlist_schema.sql
```

### Étape 4 : Installer les dépendances

```bash
npm install
```

### Étape 5 : Lancer le serveur

```bash
npm start
```

Ou avec auto-reload :
```bash
npm run dev
```

### Étape 6 : Tester !

Ouvre ton navigateur : **http://localhost:3000**

---

## ✅ Vérification rapide

### 1. Database créée ?
```bash
psql -l | grep trustlink
```
Tu dois voir `trustlink_waitlist` dans la liste.

### 2. Tables créées ?
```bash
psql trustlink_waitlist -c "\dt"
```
Tu dois voir la table `waitlist`.

### 3. Serveur marche ?
```bash
curl http://localhost:3000/health
```
Réponse : `{"status":"ok",...}`

---

## 🧪 Tests

### Test 1 : Ajouter une inscription

```bash
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chioma Test",
    "email": "chioma@test.com",
    "phone": "+2348012345678",
    "actor_type": "vendor",
    "city": "Lagos"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Successfully joined the waitlist!",
  "data": { ... }
}
```

### Test 2 : Dashboard Admin

1. Ouvre : **http://localhost:3000/admin/waitlist**
2. Entre la clé admin : `test_admin_key_change_me_in_production`
3. Tu dois voir tes stats et la liste !

### Test 3 : Vérifier dans la DB

```bash
psql trustlink_waitlist -c "SELECT * FROM waitlist;"
```

---

## 🆘 Problèmes courants

### Erreur : "role postgres does not exist"

Ton user PostgreSQL n'est pas `postgres`. Trouve ton user :
```bash
whoami
```

Puis change dans `.env` :
```env
DATABASE_URL=postgresql://TON_USER:password@localhost:5432/trustlink_waitlist
```

### Erreur : "password authentication failed"

Mauvais mot de passe. Réinitialise-le :
```bash
sudo -u postgres psql
ALTER USER postgres PASSWORD 'nouveau_mdp';
```

### Erreur : "database does not exist"

Crée la database :
```bash
createdb trustlink_waitlist
```

### Port 3000 déjà utilisé ?

Change le port dans `.env` :
```env
PORT=3001
```

---

## 📊 Tester avec plusieurs inscriptions

Script rapide pour ajouter plusieurs entrées :

```bash
# Vendor
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"name":"Vendor 1","email":"vendor1@test.com","phone":"+2348011111111","actor_type":"vendor","city":"Lagos"}'

# Buyer
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"name":"Buyer 1","email":"buyer1@test.com","phone":"+2348022222222","actor_type":"buyer","city":"Abuja"}'

# Rider
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"name":"Rider 1","email":"rider1@test.com","phone":"+2348033333333","actor_type":"rider","city":"Port Harcourt"}'
```

Ensuite, refresh le dashboard admin pour voir les stats !

---

## 🎯 Prochaines étapes

Une fois que ça marche localement :

1. ✅ Intégrer dans ton projet TrustLink principal
2. ✅ Déployer sur Render avec la vraie DB
3. ✅ Donner l'endpoint à ton collègue (landing page)
4. ✅ Générer une vraie ADMIN_KEY sécurisée

---

Bon test ! 🚀
