# Test Phase 5 - HUD Secouriste

## URLs de test disponibles

Voici les bracelets ACTIFS que vous pouvez tester:

### Bracelet BF-9000 (Swabo Hamadou)
```
http://localhost:3001/s/BF-9000?t=sec_9beb30be
```
**Status**: ACTIVE
**Profil**: Swabo Hamadou
**PIN médecin**: Vérifier dans Firestore

### Bracelet BF-9002 (diallo hassan)
```
http://localhost:3001/s/BF-9002?t=sec_9002token
```
**Status**: Maintenant ACTIVE (activé via script)
**Profil**: diallo hassan
**PIN médecin**: Vérifier dans Firestore

---

## Checklist de test

### ✅ 1. Affichage page d'urgence
- [ ] La page charge rapidement (< 2s)
- [ ] Header "SecureID" + Badge statut visible
- [ ] Photo de l'enfant affichée (si disponible)
- [ ] Nom complet affiché
- [ ] Âge calculé et affiché
- [ ] Badge groupe sanguin visible

### ✅ 2. Effet scan biométrique
- [ ] Ligne lumineuse passe sur la photo
- [ ] Animation dure ~2 secondes
- [ ] S'affiche une seule fois

### ✅ 3. Alertes vitales
- [ ] Si allergies → Bloc rouge "ALERTE MÉDICALE"
- [ ] Si conditions → Affichées dans le bloc
- [ ] Si médicaments → Listés avec icône
- [ ] Si notes → Affichées en italique

### ✅ 4. Contacts d'urgence
- [ ] Contacts affichés (top 2)
- [ ] Nom + Relation visibles
- [ ] Bouton "Appeler" fonctionnel (ouvre tel:)

### ✅ 5. Actions rapides (sticky bottom)
- [ ] 3 boutons visibles
- [ ] Bouton "Appeler Parent" → Ouvre téléphone
- [ ] Bouton "Envoyer Position GPS" → Demande permission
- [ ] Bouton "Accès Médecin" → Ouvre dialog

### ✅ 6. Géolocalisation
- [ ] Clic "Envoyer Position GPS"
- [ ] Permission demandée par navigateur
- [ ] Si accepté → Message "Position GPS enregistrée"
- [ ] Si refusé → Message erreur explicatif
- [ ] Vérifier dans Firestore collection `scans`

### ✅ 7. Portail médecin - PIN incorrect
- [ ] Clic "Accès Médecin"
- [ ] Dialog s'ouvre
- [ ] Saisir 0000 (incorrect)
- [ ] Message erreur "Code PIN incorrect"

### ✅ 8. Portail médecin - PIN correct
- [ ] Saisir le bon PIN (vérifier Firestore)
- [ ] Message "Accès autorisé"
- [ ] Liste documents affichée (ou "Aucun document")
- [ ] Si documents → Icône PDF/Image différenciée
- [ ] Clic sur document → Téléchargement

### ✅ 9. Responsive design
- [ ] Tester sur mobile (http://192.168.1.71:3001/s/...)
- [ ] Boutons assez grands pour touch
- [ ] Texte lisible
- [ ] Pas de scroll horizontal

### ✅ 10. Animations Framer Motion
- [ ] Cartes apparaissent en cascade
- [ ] Effet slide up depuis le bas
- [ ] Animations fluides (60 FPS)

---

## Scripts de vérification

### Vérifier les scans enregistrés
```typescript
// Dans Firebase Console → Firestore
// Collection: scans
// Vérifier: braceletId, timestamp, lat, lng, userAgent
```

### Créer un bracelet de test
```bash
cd secureid-app
npx tsx scripts/activate-bracelet.ts BF-9002
```

### Vérifier les Storage Rules
```bash
firebase deploy --only storage
```

### Vérifier les Firestore Rules
```bash
firebase deploy --only firestore:rules
```

---

## Problèmes connus et solutions

### Problème: "Profil introuvable"
**Cause**: Le bracelet n'a pas de `linkedProfileId`
**Solution**:
```bash
npx tsx scripts/link-bracelet-to-profile.ts
```

### Problème: "Permission géolocalisation refusée"
**Cause**: Navigateur bloque la géolocalisation
**Solution**: Activer dans paramètres navigateur

### Problème: "Code PIN incorrect" (mais PIN est bon)
**Cause**: PIN stocké différemment dans Firestore
**Solution**: Vérifier le champ `doctorPin` exact dans Firestore Console

### Problème: Documents ne s'affichent pas
**Cause**: Storage Rules non déployées
**Solution**:
```bash
firebase deploy --only storage
```

---

## Données de test dans Firestore

### Vérifier un profil
```
Collection: profiles
Document ID: profile_1764154564422_7szca59
Champs importants:
- fullName
- dateOfBirth
- medicalInfo.bloodType
- medicalInfo.allergies
- doctorPin (Noter ce PIN pour tests!)
- emergencyContacts[0].phone
```

### Vérifier un bracelet
```
Collection: bracelets
Document ID: BF-9000
Champs importants:
- status: "ACTIVE"
- linkedProfileId: "profile_xxx"
- secretToken: "sec_xxx"
```

---

## Test final - Scénario complet

1. **Ouvrir**: `http://localhost:3001/s/BF-9000?t=sec_9beb30be`
2. **Vérifier**: Page charge avec toutes les infos
3. **Cliquer**: "Envoyer Position GPS" → Accepter permission
4. **Vérifier**: Message "Position GPS enregistrée"
5. **Cliquer**: "Appeler Parent" → Téléphone s'ouvre
6. **Cliquer**: "Accès Médecin"
7. **Saisir**: PIN incorrect → Erreur
8. **Saisir**: PIN correct → Documents affichés
9. **Cliquer**: Sur un document → Téléchargement
10. **Fermer**: Dialog

**Résultat attendu**: Tous les tests passent ✓

---

## Performance attendue

- **Time to First Byte**: < 200ms (SSR)
- **First Contentful Paint**: < 500ms
- **Largest Contentful Paint**: < 1s
- **Time to Interactive**: < 1.5s
- **Cumulative Layout Shift**: 0 (pas de décalage)

---

## Checklist déploiement production

- [ ] Tests passés en local
- [ ] Tests passés sur mobile
- [ ] Firestore Rules déployées
- [ ] Storage Rules déployées
- [ ] Build production sans erreurs (`npm run build`)
- [ ] Test en production (`npm start`)
- [ ] Monitoring configuré (optionnel)
- [ ] Analytics configuré (optionnel)

---

**Date du test**: _______________
**Testeur**: _______________
**Résultat global**: ⬜ Pass / ⬜ Fail
**Notes**: _________________________________________________
