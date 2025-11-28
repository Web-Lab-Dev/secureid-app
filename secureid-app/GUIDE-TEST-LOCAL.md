# 🧪 Guide de Test Local Complet - SecureID

**Objectif** : Tester l'ensemble du parcours utilisateur en local sans affecter la production

**Port local** : http://localhost:3001
**Production** : https://secureid-app.vercel.app (INTOUCHABLE)

---

## 🔐 Protection de la Production

### Garanties de Sécurité

✅ **Les tests locaux N'AFFECTENT PAS la production** car :
1. Base de données partagée (Firestore) mais statuts indépendants
2. Les QR codes LOT_CHINA_001 ont des IDs uniques (BF-001 à BF-120)
3. Nos tests utiliseront des IDs différents (TEST-XXX)
4. Le serveur local (port 3001) et Vercel sont séparés

✅ **Les QR codes gravés sont PROTÉGÉS** car :
1. URLs immuables (gravées au laser)
2. Tokens secrets stockés dans Firestore (pas dans le code)
3. Modifications de code n'affectent que le comportement, pas les données

---

## 📋 Scénarios à Tester

### Scénario 1 : Bracelet FACTORY_LOCKED

**Contexte** : Bracelet en transit, pas encore reçu

**Test** :
```
1. Créer un bracelet test en statut FACTORY_LOCKED
2. Générer son URL locale
3. Scanner / Ouvrir l'URL
4. Vérifier page "MAINTENANCE"
```

**Résultat attendu** :
```
🔧 MAINTENANCE
Ce bracelet n'est pas encore disponible
Ce produit est en cours de préparation
🏭 Ce bracelet fait partie d'un lot en transit
```

---

### Scénario 2 : Bracelet INACTIVE (Déblocage)

**Contexte** : Bracelet reçu, débloqué, en stock

**Test** :
```
1. Débloquer le bracelet test (FACTORY_LOCKED → INACTIVE)
2. Scanner / Ouvrir l'URL
3. Vérifier redirection vers /activate
```

**Résultat attendu** :
```
→ Redirection vers /activate?id=TEST-001&token=...
→ Page d'activation pour le parent
→ Formulaire : email, mot de passe, confirmation
```

---

### Scénario 3 : Activation (Signup)

**Contexte** : Parent crée son compte et active le bracelet

**Test** :
```
1. Sur la page /activate
2. Remplir le formulaire d'inscription
3. Soumettre
4. Vérifier création du compte
```

**Résultat attendu** :
```
→ Compte parent créé dans Firebase Auth
→ Redirection vers page de création profil enfant
→ Formulaire données médicales affiché
```

---

### Scénario 4 : Création Profil Enfant

**Contexte** : Parent remplit les données médicales de l'enfant

**Test** :
```
1. Remplir le formulaire :
   - Nom, prénom, date de naissance
   - Groupe sanguin
   - Allergies
   - Conditions médicales
   - Médicaments
   - Contacts d'urgence
   - Photo
2. Soumettre
```

**Résultat attendu** :
```
→ Profil enfant créé dans Firestore
→ Bracelet lié au profil (linkedProfileId)
→ Bracelet passe en statut ACTIVE
→ Redirection vers dashboard
```

---

### Scénario 5 : Bracelet ACTIVE (Mode Urgence)

**Contexte** : Bracelet activé, quelqu'un le scanne

**Test** :
```
1. Scanner / Ouvrir l'URL du bracelet activé
2. Vérifier affichage mode urgence
```

**Résultat attendu** :
```
🚨 MODE URGENCE
- Photo de l'enfant
- Nom, prénom, âge
- Groupe sanguin (gros, visible)
- Allergies (liste)
- Conditions médicales
- Médicaments actuels
- Contacts d'urgence (boutons appel direct)
```

---

### Scénario 6 : Dashboard Parent

**Contexte** : Parent connecté gère ses bracelets

**Test** :
```
1. Se connecter avec le compte créé
2. Accéder au dashboard
3. Voir la liste des profils/bracelets
4. Modifier un profil
5. Gérer les statuts (déclaration perte/vol)
```

**Résultat attendu** :
```
→ Dashboard avec liste des enfants/bracelets
→ Boutons : Modifier, Déclarer perdu, Déclarer volé
→ Modifications enregistrées dans Firestore
```

---

## 🎬 Script de Test Automatisé

### Préparation

```bash
# 1. S'assurer que le serveur local tourne
npm run dev

# 2. Créer un bracelet de test
npm run test-china
# → Crée TEST-001, TEST-002, TEST-003
```

### Test 1 : FACTORY_LOCKED

```bash
# Ouvrir dans le navigateur
http://localhost:3001/s/TEST-001?token=<token_depuis_urls.txt>
```

**Checklist** :
- [ ] Page maintenance s'affiche
- [ ] Icône 🔧 visible
- [ ] Message "Ce bracelet n'est pas encore disponible"
- [ ] Fond gris (bg-slate-900/20)
- [ ] Pas d'erreur console

### Test 2 : Déblocage → INACTIVE

```bash
# Débloquer le lot de test
npm run unlock-batch LOT_TEST_001
```

**Checklist** :
- [ ] Script affiche "✅ 3 bracelets débloqués"
- [ ] Statut changé : FACTORY_LOCKED → INACTIVE

```bash
# Réouvrir l'URL
http://localhost:3001/s/TEST-001?token=<token>
```

**Checklist** :
- [ ] Redirection vers /activate?id=TEST-001&token=...
- [ ] Page d'activation affichée
- [ ] Formulaire signup visible

### Test 3 : Activation (Création Compte)

**Sur** : http://localhost:3001/activate?id=TEST-001&token=...

**Actions** :
1. Remplir le formulaire :
   ```
   Email    : test@example.com
   Password : Test123456!
   Confirm  : Test123456!
   ```
2. Soumettre

**Checklist** :
- [ ] Compte créé (vérifier Firebase Console)
- [ ] Redirection vers formulaire profil enfant
- [ ] Aucune erreur

### Test 4 : Création Profil Enfant

**Actions** :
1. Remplir les données :
   ```
   Nom                : Dupont
   Prénom             : Jean
   Date naissance     : 01/01/2020
   Groupe sanguin     : O+
   Allergies          : Arachides, Lactose
   Conditions         : Asthme
   Médicaments        : Ventoline
   Contact urgence 1  : Mère - 06 12 34 56 78
   Contact urgence 2  : Père - 06 98 76 54 32
   ```
2. Ajouter une photo (optionnel)
3. Soumettre

**Checklist** :
- [ ] Profil créé dans Firestore
- [ ] Bracelet TEST-001 lié au profil
- [ ] Statut bracelet = ACTIVE
- [ ] Redirection vers dashboard

### Test 5 : Mode Urgence

```bash
# Déconnexion (ou navigation privée)
# Ouvrir l'URL du bracelet
http://localhost:3001/s/TEST-001?token=<token>
```

**Checklist** :
- [ ] Page mode urgence s'affiche (PAS de redirection)
- [ ] Photo de l'enfant visible (ou placeholder)
- [ ] Nom/Prénom : Jean Dupont
- [ ] Âge calculé : 4-5 ans
- [ ] Groupe sanguin : O+ (en gros, visible)
- [ ] Allergies : Arachides, Lactose
- [ ] Conditions : Asthme
- [ ] Médicaments : Ventoline
- [ ] Contacts urgence cliquables (boutons téléphone)

### Test 6 : Dashboard

```bash
# Se reconnecter avec test@example.com
http://localhost:3001/login
```

**Checklist** :
- [ ] Dashboard affiche le profil Jean Dupont
- [ ] Carte bracelet TEST-001 visible
- [ ] Statut : ACTIVE
- [ ] Boutons : Modifier, QR Code, Options
- [ ] Clic "Modifier" ouvre le formulaire
- [ ] Modifications sauvegardées

---

## 🔍 Vérifications Base de Données

### Firebase Console

**Collections à vérifier** :

1. **bracelets** :
   ```
   TEST-001:
     - id: TEST-001
     - status: ACTIVE
     - batchId: LOT_TEST_001
     - linkedUserId: <uid du compte créé>
     - linkedProfileId: <id du profil créé>
   ```

2. **profiles** :
   ```
   <profile-id>:
     - firstName: Jean
     - lastName: Dupont
     - bloodType: O+
     - allergies: [Arachides, Lactose]
     - ...
   ```

3. **users** (Firebase Auth) :
   ```
   <uid>:
     - email: test@example.com
   ```

---

## ⚠️ Points d'Attention

### 1. Séparation Test / Production

**IDs de test** : `TEST-001`, `TEST-002`, `TEST-003`
**IDs production** : `BF-001` à `BF-120`

→ Impossible de conflit !

### 2. Base de Données Partagée

Firestore est partagé entre local et production, MAIS :
- Les bracelets LOT_CHINA_001 (BF-XXX) restent intouchés
- Les tests utilisent LOT_TEST_001 (TEST-XXX)
- Vous pouvez supprimer LOT_TEST_001 après tests

### 3. Nettoyage Après Tests

```javascript
// Firebase Console → Firestore
// Supprimer manuellement :
// - Collection bracelets : documents TEST-001, TEST-002, TEST-003
// - Collection profiles : le profil de test créé
// - Firebase Auth : compte test@example.com
```

Ou script de nettoyage (à créer si besoin) :
```bash
npm run cleanup-tests
```

---

## 📊 Tableau de Suivi des Tests

| Scénario | Statut | Notes |
|----------|--------|-------|
| 1. FACTORY_LOCKED → Maintenance | ⏳ | Page grise avec icône 🔧 |
| 2. Déblocage → INACTIVE | ⏳ | Redirection /activate |
| 3. Signup Parent | ⏳ | Compte créé |
| 4. Profil Enfant | ⏳ | Données médicales |
| 5. Mode Urgence | ⏳ | Affichage infos vitales |
| 6. Dashboard | ⏳ | Gestion bracelets |

---

## 🎯 Commandes Rapides

```bash
# Démarrer le serveur local
npm run dev

# Créer des bracelets de test
npm run test-china

# Débloquer les bracelets de test
npm run unlock-batch LOT_TEST_001

# Voir les URLs de test
cat output/LOT_TEST_001/data/urls.txt

# Ouvrir le premier bracelet test
# (Copier l'URL depuis urls.txt et ouvrir dans le navigateur)
```

---

## ✅ Validation Finale

Avant toute mise en production d'une nouvelle fonctionnalité :

1. [ ] Tous les scénarios testés en local
2. [ ] Aucune erreur console
3. [ ] Données correctement enregistrées dans Firestore
4. [ ] Workflow complet : FACTORY_LOCKED → INACTIVE → ACTIVE
5. [ ] Mode urgence fonctionne
6. [ ] Les QR codes LOT_CHINA_001 ne sont PAS touchés

---

**Prêt à tester !**

Commencez par :
```bash
npm run test-china
```

Puis suivez les scénarios 1 à 6 dans l'ordre.
