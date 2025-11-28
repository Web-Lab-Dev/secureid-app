# 🧪 TEST SCÉNARIO COMPLET - Bracelets TEST-001, TEST-002, TEST-003

**Date** : 28 Novembre 2025
**Bracelets générés** : 3 (TEST-001, TEST-002, TEST-003)
**Statut initial** : FACTORY_LOCKED
**URL Production** : https://secureid-app.vercel.app

---

## 📱 QR CODES À SCANNER

### QR Code TEST-001
Fichier : `output/LOT_TEST_001/qr-codes/TEST-001.png`

**URL** :
```
https://secureid-app.vercel.app/s/TEST-001?token=45d81dee0327614b58b4b399da5cc001c551376ab279806885ff403c6b902965
```

### QR Code TEST-002
Fichier : `output/LOT_TEST_001/qr-codes/TEST-002.png`

**URL** :
```
https://secureid-app.vercel.app/s/TEST-002?token=8b227fc45db388566e67a1d39936a51b698cabac7798daa19c87811383e13219
```

### QR Code TEST-003
Fichier : `output/LOT_TEST_001/qr-codes/TEST-003.png`

**URL** :
```
https://secureid-app.vercel.app/s/TEST-003?token=c44b514e480af25db8d818e850683596c5a1471bcc4c1de8f08ceeb3a48537a2
```

---

## 🎬 SCÉNARIO DE TEST COMPLET

### Étape 1 : FACTORY_LOCKED (Maintenance)

**Action** : Scanner TEST-001 (ou ouvrir l'URL dans le navigateur)

**Résultat attendu** :
```
🔧 MAINTENANCE
Ce bracelet n'est pas encore disponible
Ce produit est en cours de préparation et sera bientôt activable.
🏭 Ce bracelet fait partie d'un lot en transit.
```

✅ **Validation** :
- [ ] Page grise s'affiche
- [ ] Icône 🔧 visible
- [ ] Message maintenance lisible
- [ ] Pas d'erreur

---

### Étape 2 : DÉBLOCAGE → INACTIVE

**Action** : Sur votre PC, débloquer le lot
```bash
npm run unlock-batch LOT_TEST_001
```

**Résultat attendu** :
```
✅ 3 bracelet(s) débloqués
FACTORY_LOCKED → INACTIVE
```

**Action** : Rescanner TEST-001 (ou recharger la page)

**Résultat attendu** :
```
→ Redirection automatique vers /activate?id=TEST-001&token=...
→ Page d'inscription/connexion affichée
```

✅ **Validation** :
- [ ] Redirection effectuée
- [ ] Formulaire signup visible
- [ ] Champs : Nom, Téléphone, Mot de passe
- [ ] Bouton "Se connecter" / "S'inscrire"

---

### Étape 3 : ACTIVATION - Création Compte

**Action** : Remplir le formulaire d'inscription

**Données de test** :
```
Nom complet    : Test Mobile Parent
Téléphone      : 70123456 (ou votre vrai numéro)
Mot de passe   : Test123456!
Confirmation   : Test123456!
```

**Clic** : Bouton "S'inscrire"

**Résultat attendu** :
```
→ Compte créé dans Firebase Auth
→ Email généré automatiquement : 70123456@secureid.bf
→ Redirection vers formulaire profil enfant
```

✅ **Validation** :
- [ ] Compte créé (vérifier Firebase Console si besoin)
- [ ] Pas d'erreur "email déjà utilisé"
- [ ] Redirection vers formulaire médical

---

### Étape 4 : PROFIL ENFANT - Données Médicales

**Action** : Remplir le formulaire de profil enfant

**Données de test** :
```
INFORMATIONS DE BASE
- Photo         : (Optionnel - prendre une photo test ou skip)
- Nom complet   : Sophie Martin
- Date naissance: 15/03/2021
- Groupe sanguin: A+

INFORMATIONS MÉDICALES
- Allergies     :
  1. Arachides
  2. Lactose
- Conditions    :
  1. Asthme léger
- Médicaments   :
  1. Ventoline (en cas de crise)
- Notes         : RAS - Enfant en bonne santé générale

PIN MÉDECIN
- PIN           : 1234
- Confirmation  : 1234

CONTACTS D'URGENCE (Minimum 1)
Contact 1 :
- Nom           : Marie Martin
- Relation      : MOTHER (Mère)
- Téléphone     : 70987654
- Email         : (Optionnel)

Contact 2 (Optionnel) :
- Nom           : Pierre Martin
- Relation      : FATHER (Père)
- Téléphone     : 76543210
```

**Clic** : Bouton "Créer le Profil"

**Résultat attendu** :
```
→ Profil créé dans Firestore
→ Bracelet TEST-001 lié au profil
→ Statut bracelet : INACTIVE → ACTIVE
→ Redirection vers dashboard parent
```

✅ **Validation** :
- [ ] Formulaire soumis sans erreur
- [ ] Profil créé (visible dans dashboard)
- [ ] Bracelet TEST-001 lié au profil
- [ ] Redirection dashboard

---

### Étape 5 : DASHBOARD PARENT

**Résultat attendu** :
```
Dashboard avec :
- Statistiques : 1 profil actif, 1 bracelet actif
- Carte profil : Sophie Martin, 3 ans, Statut ACTIVE
- Boutons : Gérer le Dossier, Options
```

✅ **Validation** :
- [ ] Dashboard s'affiche
- [ ] Carte Sophie Martin visible
- [ ] Statut bracelet : ACTIVE (badge vert)
- [ ] Photo (si uploadée) affichée

**Action** : Cliquer sur "Gérer le Dossier Médical"

**Résultat attendu** :
```
→ Page /dashboard/profile/[id]
→ 2 onglets : Infos Publiques | Zone Confidentielle
→ Formulaire pré-rempli avec données Sophie
```

✅ **Validation** :
- [ ] Page détail s'affiche
- [ ] Données pré-remplies
- [ ] Onglets fonctionnels

---

### Étape 6 : MODE URGENCE (HUD Secouriste)

**Action** : Se déconnecter (ou ouvrir navigation privée)

**Action** : Rescanner TEST-001 (ou ouvrir l'URL)

**Résultat attendu** :
```
🚨 MODE URGENCE
--------------------------------
Badge Sécurité :
- Photo Sophie
- Nom : Sophie Martin
- Âge : 3 ans
- Bouton WhatsApp Parent
- Bouton Appeler Parent (70987654)
- Contact urgence : Marie Martin (Mère)

Dossier Médical :
- Groupe sanguin : A+ (gros badge rouge)
- ALLERGIES : Arachides, Lactose (zone rouge)
- Conditions : Asthme léger
- Médicaments : Ventoline
- Notes : RAS

Actions :
- Bouton "Envoyer ma Position GPS" (orange)
- Bouton "Accès Personnel Médical" (bleu)
```

✅ **Validation** :
- [ ] Page mode urgence s'affiche (PAS de redirection /activate)
- [ ] Photo Sophie visible
- [ ] Nom, âge corrects
- [ ] Groupe sanguin A+ en gros
- [ ] Allergies en zone rouge
- [ ] Boutons contacts cliquables

**Action** : Cliquer sur "Appeler Parent"

**Résultat attendu** :
```
→ Ouvre l'application téléphone
→ Numéro pré-rempli : 70987654
```

✅ **Validation** :
- [ ] App téléphone s'ouvre
- [ ] Numéro correct

**Action** : Cliquer sur "WhatsApp Parent"

**Résultat attendu** :
```
→ Ouvre WhatsApp
→ Numéro : 70987654
→ Message pré-rempli : "Bonjour, j'ai trouvé votre enfant Sophie Martin..."
```

✅ **Validation** :
- [ ] WhatsApp s'ouvre
- [ ] Numéro et message corrects

**Action** : Cliquer sur "Envoyer ma Position GPS"

**Résultat attendu** :
```
→ Popup demande permission localisation
→ Une fois acceptée : Message "Position envoyée"
→ Scan enregistré dans Firestore (collection scans)
```

✅ **Validation** :
- [ ] Permission demandée
- [ ] Message succès après envoi
- [ ] (Optionnel) Vérifier collection `scans` dans Firebase Console

**Action** : Cliquer sur "Accès Personnel Médical"

**Résultat attendu** :
```
→ Dialog PIN médecin s'ouvre
→ Champ 4 chiffres
```

**Action** : Entrer PIN : 1234

**Résultat attendu** :
```
→ Validation côté serveur
→ Affichage documents médicaux (si uploadés)
→ Ou message "Aucun document" si vide
```

✅ **Validation** :
- [ ] Dialog PIN s'ouvre
- [ ] Validation fonctionne
- [ ] Message approprié affiché

---

### Étape 7 : DÉCLARER PERDU (Dashboard)

**Action** : Se reconnecter au dashboard (70123456 / Test123456!)

**Action** : Sur la carte Sophie Martin, activer le toggle "Déclarer Perdu"

**Résultat attendu** :
```
→ Toggle passe au rouge
→ Statut bracelet : ACTIVE → LOST
→ Badge change de couleur (vert → rouge)
→ Toast notification : "Bracelet déclaré perdu"
```

✅ **Validation** :
- [ ] Toggle change d'état
- [ ] Badge statut rouge
- [ ] Notification affichée

**Action** : Rescanner TEST-001 en mode urgence (navigation privée)

**Résultat attendu** :
```
→ Mode urgence s'affiche NORMALEMENT
→ (Futur : + notification parent "Bracelet scanné")
```

✅ **Validation** :
- [ ] Mode urgence toujours fonctionnel
- [ ] Aucune différence visible (statut LOST transparent pour secouriste)

**Action** : Réactiver le bracelet (toggle OFF)

**Résultat attendu** :
```
→ Toggle repasse au vert
→ Statut : LOST → ACTIVE
→ Badge vert
```

✅ **Validation** :
- [ ] Réactivation fonctionne
- [ ] Statut redevient ACTIVE

---

## 🔄 TEST BRACELETS 2 & 3

### TEST-002 : Scénario Transfert

**Action** : Scanner TEST-002

**Workflow** :
1. Débloquer LOT_TEST_001 (déjà fait)
2. Scanner TEST-002 → Redirection /activate
3. Se connecter avec le MÊME compte (70123456)
4. Choisir "Transférer un profil existant"
5. Sélectionner Sophie Martin
6. Valider le transfert

**Résultat attendu** :
```
→ TEST-002 devient le nouveau bracelet de Sophie
→ TEST-001 passe en DEACTIVATED
→ Sophie désormais liée à TEST-002
```

✅ **Validation** :
- [ ] Transfert réussi
- [ ] Dashboard affiche TEST-002 pour Sophie
- [ ] Scanner TEST-001 → Erreur "Bracelet désactivé"

---

### TEST-003 : Scénario Multi-Profils

**Action** : Scanner TEST-003

**Workflow** :
1. Scanner TEST-003 → Redirection /activate
2. Se connecter avec le MÊME compte
3. Créer un NOUVEAU profil (ex: Lucas Dupont, 5 ans, B+)
4. Lier TEST-003 à Lucas

**Résultat attendu** :
```
→ 2 profils dans le dashboard : Sophie + Lucas
→ 2 bracelets actifs
→ Statistiques : 2 profils, 2 bracelets actifs
```

✅ **Validation** :
- [ ] 2 cartes profils dans dashboard
- [ ] Scanner TEST-002 → Sophie
- [ ] Scanner TEST-003 → Lucas

---

## 📊 CHECKLIST GLOBALE

### Fonctionnalités Testées

#### Infrastructure
- [ ] Page FACTORY_LOCKED (maintenance)
- [ ] Redirection INACTIVE → /activate
- [ ] Mode urgence ACTIVE
- [ ] Validation token (sécurité)

#### Activation
- [ ] Signup + création compte
- [ ] Login compte existant
- [ ] Formulaire médical complet
- [ ] Upload photo
- [ ] PIN médecin
- [ ] Contacts d'urgence (min 1, max 5)
- [ ] Liaison bracelet<>profil

#### Dashboard
- [ ] Liste profils
- [ ] Statistiques KPIs
- [ ] Bouton "Déclarer Perdu"
- [ ] Édition profil
- [ ] Multi-profils (plusieurs enfants)

#### Mode Urgence
- [ ] Affichage identité (photo, nom, âge)
- [ ] Groupe sanguin visible
- [ ] Allergies zone rouge
- [ ] Bouton Appeler
- [ ] Bouton WhatsApp
- [ ] Bouton GPS
- [ ] Dialog PIN médecin
- [ ] Enregistrement scan automatique

#### Workflow Avancé
- [ ] Transfert bracelet (ancien → nouveau)
- [ ] Multi-profils (plusieurs enfants, 1 parent)
- [ ] Statut LOST (déclaration + réactivation)

---

## 🐛 BUGS À REPORTER

**Format** :
```
Page : [Nom de la page]
Action : [Ce que vous avez fait]
Attendu : [Résultat attendu]
Obtenu : [Résultat obtenu]
Screenshot : (si possible)
```

**Exemples** :
- Bouton WhatsApp ne s'ouvre pas → Vérifier numéro format international
- Photo ne s'affiche pas → Vérifier permissions Firebase Storage
- Formulaire ne soumet pas → Vérifier validation Zod (console)

---

## ✅ SUCCÈS FINAL

Si TOUS les scénarios fonctionnent :
```
🎉 Le système SecureID est VALIDÉ end-to-end !
✅ Infrastructure : OK
✅ Activation : OK
✅ Dashboard : OK
✅ Mode Urgence : OK
✅ Workflow Avancé : OK

→ Prêt pour la production ! 🚀
```

---

## 📞 SUPPORT

**Problèmes** : Consulter [AUDIT-QA-COMPLET.md](AUDIT-QA-COMPLET.md) section "Dette Technique"

**Logs** : Vérifier la console navigateur (F12) pour erreurs JavaScript

**Firestore** : Firebase Console → Firestore → Collections `bracelets`, `profiles`, `scans`

---

**Bon test !** 📱🧪
