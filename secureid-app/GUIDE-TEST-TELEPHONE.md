# 📱 Guide de Test sur Téléphone

## 🌐 Adresse Réseau Locale

**Votre serveur local est accessible depuis le téléphone à** :
```
http://192.168.1.66:3001
```

## ⚠️ Prérequis

1. **Le PC et le téléphone doivent être sur le même réseau WiFi**
2. **Le serveur local doit tourner** (`npm run dev`)
3. **Le pare-feu Windows doit autoriser le port 3001** (voir ci-dessous si besoin)

---

## 🧪 URLs de Test pour Téléphone

### Test 1 : FACTORY_LOCKED (Page Maintenance)

**URL TEST-001** :
```
http://192.168.1.66:3001/s/TEST-001?token=a992ad4f021636b01f9c9f71d685b502ae1bf89762d15c57d94ba5f686cea5fa
```

**Résultat attendu** :
- Page avec fond gris
- Icône 🔧
- "MAINTENANCE"
- "Ce bracelet n'est pas encore disponible"

---

### Test 2 : INACTIVE (Redirection Activate)

**Étape 1** : Débloquer le bracelet
```bash
# Sur le PC
npm run unlock-batch LOT_TEST_001
```

**Étape 2** : Ouvrir sur le téléphone
```
http://192.168.1.66:3001/s/TEST-001?token=a992ad4f021636b01f9c9f71d685b502ae1bf89762d15c57d94ba5f686cea5fa
```

**Résultat attendu** :
- Redirection vers `/activate?id=TEST-001&token=...`
- Page d'inscription avec formulaire

---

### Test 3 : Activation Complète (Signup)

**Sur** : La page /activate (après redirection)

**Actions** :
1. Remplir :
   - Email : `test-mobile@example.com`
   - Password : `Test123456!`
   - Confirm : `Test123456!`
2. Soumettre

**Résultat attendu** :
- Compte créé
- Redirection vers formulaire profil enfant

---

### Test 4 : Profil Enfant

**Actions** :
1. Remplir les données :
   ```
   Nom : Martin
   Prénom : Sophie
   Date naissance : 15/03/2021
   Groupe sanguin : A+
   ```
2. Ajouter allergies : Arachides
3. Ajouter contact : Mère - 06 12 34 56 78
4. Prendre/uploader une photo (optionnel)
5. Soumettre

**Résultat attendu** :
- Profil créé
- Bracelet TEST-001 passe en ACTIVE
- Redirection dashboard

---

### Test 5 : Mode Urgence

**Déconnexion** puis ouvrir (ou navigation privée) :
```
http://192.168.1.66:3001/s/TEST-001?token=a992ad4f021636b01f9c9f71d685b502ae1bf89762d15c57d94ba5f686cea5fa
```

**Résultat attendu** :
- Page rouge/orange
- Photo de Sophie Martin
- Âge : 3-4 ans
- Groupe sanguin : A+ (gros)
- Allergies : Arachides
- Contact urgence cliquable (appel direct)

---

## 📱 Générer des QR Codes pour Scanner

### Option 1 : Utiliser les PNG Existants

**Chemin** : `output/LOT_TEST_001/qr-codes/`

**Fichiers** :
- `TEST-001.png`
- `TEST-002.png`
- `TEST-003.png`

**Comment scanner** :
1. Ouvrir les fichiers PNG sur votre PC
2. Scanner avec l'appareil photo du téléphone
3. Toucher la notification pour ouvrir l'URL

---

### Option 2 : Générateur QR Code en Ligne

**Site** : https://www.qr-code-generator.com/

**Étapes** :
1. Copier l'URL :
   ```
   http://192.168.1.66:3001/s/TEST-001?token=a992ad4f021636b01f9c9f71d685b502ae1bf89762d15c57d94ba5f686cea5fa
   ```
2. Coller dans le générateur
3. Télécharger le QR code
4. Scanner avec le téléphone

---

## 🔧 Résolution de Problèmes

### Problème 1 : "Connexion impossible" ou "Délai d'attente dépassé"

**Causes possibles** :
1. PC et téléphone sur des réseaux WiFi différents
2. Pare-feu Windows bloque le port 3001

**Solutions** :

#### Vérifier le Réseau
```bash
# Sur le PC, vérifier l'IP
ipconfig
# Chercher "Adresse IPv4" de votre connexion WiFi
# Doit correspondre à 192.168.1.66
```

#### Autoriser le Port dans le Pare-feu

**Windows PowerShell (Administrateur)** :
```powershell
# Autoriser le port 3001 en entrée
New-NetFirewallRule -DisplayName "Next.js Dev Server" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

**Ou via l'interface** :
1. Paramètres Windows → Sécurité Windows
2. Pare-feu et protection réseau
3. Paramètres avancés
4. Règles de trafic entrant → Nouvelle règle
5. Port → TCP → 3001 → Autoriser

---

### Problème 2 : QR Code ne scanne pas

**Solutions** :
1. Augmenter la taille de l'affichage du PNG
2. Améliorer l'éclairage
3. Utiliser un générateur de QR code en ligne (voir Option 2)
4. Copier/coller l'URL directement dans le navigateur mobile

---

### Problème 3 : Page blanche ou erreur

**Vérifier** :
1. Le serveur local tourne : `npm run dev`
2. L'URL est correcte (192.168.1.66, pas localhost)
3. Le token est complet (64 caractères)

**Console navigateur** (sur PC) :
```
F12 → Console → Vérifier les erreurs
```

---

## 📊 Checklist de Test Mobile

### Test 1 : FACTORY_LOCKED
- [ ] URL ouverte sur téléphone
- [ ] Page maintenance s'affiche
- [ ] Icône 🔧 visible
- [ ] Texte lisible sur mobile
- [ ] Pas d'erreur

### Test 2 : INACTIVE
- [ ] Déblocage effectué sur PC
- [ ] Réouverture URL sur téléphone
- [ ] Redirection vers /activate
- [ ] Formulaire signup s'affiche correctement
- [ ] Champs input utilisables sur mobile

### Test 3 : Signup
- [ ] Email rempli
- [ ] Password rempli (clavier sécurisé)
- [ ] Confirmation password
- [ ] Bouton submit cliquable
- [ ] Compte créé (vérifier Firebase Console)
- [ ] Redirection vers formulaire profil

### Test 4 : Profil Enfant
- [ ] Formulaire s'affiche bien sur mobile
- [ ] Date picker fonctionne
- [ ] Dropdown groupe sanguin
- [ ] Ajout allergies (bouton +)
- [ ] Ajout contacts (bouton +)
- [ ] Upload photo (depuis galerie ou caméra)
- [ ] Submit réussi
- [ ] Redirection dashboard

### Test 5 : Mode Urgence
- [ ] Page rouge/orange s'affiche
- [ ] Photo visible
- [ ] Nom/prénom/âge lisibles
- [ ] Groupe sanguin EN GROS
- [ ] Liste allergies visible
- [ ] Boutons contacts urgence cliquables
- [ ] Clic sur contact → Ouvre l'app téléphone

### Test 6 : Dashboard
- [ ] Liste profils s'affiche
- [ ] Carte bracelet visible
- [ ] Bouton "Modifier" fonctionne
- [ ] Navigation onglets (Infos/Médical/Contacts)
- [ ] Modifications sauvegardées

---

## 🎯 Scénario Complet Recommandé

**Durée estimée** : 10-15 minutes

1. **Scanner QR code TEST-001** (ou ouvrir URL)
   → Page MAINTENANCE

2. **Sur PC** : `npm run unlock-batch LOT_TEST_001`

3. **Rescanner** ou recharger
   → Redirection /activate

4. **Créer compte** : test-mobile@example.com / Test123456!
   → Compte créé

5. **Remplir profil enfant** : Sophie Martin, 3 ans, A+, Arachides
   → Profil créé

6. **Déconnexion** (ou navigation privée)

7. **Rescanner TEST-001**
   → Mode urgence avec infos Sophie

8. **Tester appel contact**
   → Clic bouton → Ouvre téléphone

---

## 🔄 URLs de Test (Copie Rapide)

**TEST-001 (FACTORY_LOCKED)** :
```
http://192.168.1.66:3001/s/TEST-001?token=a992ad4f021636b01f9c9f71d685b502ae1bf89762d15c57d94ba5f686cea5fa
```

**TEST-002 (Alternative)** :
```
http://192.168.1.66:3001/s/TEST-002?token=9280936826f480b5bf4ba960d5ce8cd7ac0e75328224b6199c1fdfd747a2f4d6
```

**TEST-003 (Alternative)** :
```
http://192.168.1.66:3001/s/TEST-003?token=712b1fff4ccbfce8d095ad7e796e4442bde6b3c09025d9f3e6feb44f0ff7fb75
```

**Fichier complet** :
```
output/LOT_TEST_001/data/urls.txt
```

---

## 📱 QR Codes pour Scanner

**Emplacement** :
```
output/LOT_TEST_001/qr-codes/
- TEST-001.png
- TEST-002.png
- TEST-003.png
```

**Utilisation** :
1. Ouvrir le PNG sur votre écran PC
2. Scanner avec l'appareil photo du téléphone
3. Toucher la notification
4. L'URL s'ouvre dans le navigateur mobile

---

## ✅ Validation Finale Mobile

Après tous les tests :

- [ ] Page FACTORY_LOCKED : Design correct sur mobile
- [ ] Page /activate : Formulaire utilisable sur tactile
- [ ] Formulaire profil : Tous les champs fonctionnels
- [ ] Mode urgence : Infos lisibles, boutons appel fonctionnent
- [ ] Dashboard : Navigation fluide sur mobile
- [ ] Photos : Upload depuis galerie/caméra fonctionne
- [ ] Performance : Pas de lag, chargement rapide

---

**Prêt pour les tests mobile !** 📱

Commencez par scanner le QR code TEST-001.png ou ouvrir directement l'URL dans le navigateur de votre téléphone.
