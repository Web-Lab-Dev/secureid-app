# Migration PIN Médecin: 4→6 Chiffres

## Contexte

Le code PIN médecin a été augmenté de 4 à 6 chiffres pour améliorer la sécurité :
- **Avant** : 4 chiffres = 10,000 combinaisons possibles
- **Après** : 6 chiffres = 1,000,000 combinaisons possibles (100x plus sécurisé)

## Fichiers Modifiés

### 1. Validation Backend
- ✅ [src/lib/validation.ts](src/lib/validation.ts#L48) - Regex `^[0-9]{6}$`
- ✅ [src/schemas/activation.ts](src/schemas/activation.ts#L43) - doctorPinSchema
- ✅ [src/lib/pin-helper.ts](src/lib/pin-helper.ts) - Commentaires mis à jour

### 2. Composants UI
- ✅ [src/components/dashboard/PinManagement.tsx](src/components/dashboard/PinManagement.tsx) - `maxLength={6}`
- ✅ [src/components/activation/MedicalForm.tsx](src/components/activation/MedicalForm.tsx) - `maxLength={6}`
- ✅ [src/components/emergency/PinDialog.tsx](src/components/emergency/PinDialog.tsx) - `maxLength={6}`
- ✅ [src/components/emergency/GenericPinDialog.tsx](src/components/emergency/GenericPinDialog.tsx) - `maxLength={6}`

### 3. Placeholders UI
Tous les champs PIN affichent maintenant `••••••` (6 points) au lieu de `••••` (4 points).

## Impact sur les Utilisateurs

### Nouveaux Utilisateurs
✅ Aucun impact - Les nouveaux profils créés utiliseront automatiquement des PINs à 6 chiffres.

### Utilisateurs Existants (PINs à 4 chiffres)

**Option 1 : Migration Automatique (Recommandé)**
Les anciens PINs à 4 chiffres continuent de fonctionner grâce à la migration automatique dans `emergency-actions.ts` :

```typescript
// Si le PIN stocké est en clair (ancien format)
if (!isBcryptHash(storedPin)) {
  // Comparer en clair puis migrer vers bcrypt
  if (pin === storedPin) {
    // ✅ PIN valide, migrer vers bcrypt
    const hashedPin = await hashPin(pin);
    // Sauvegarder le hash
  }
}
```

**Option 2 : Forcer la Mise à Jour (Sécurité Maximale)**
Si vous souhaitez forcer tous les utilisateurs à créer un nouveau PIN à 6 chiffres :

1. Ajouter une migration Firestore :
```javascript
// scripts/migrate-pins.js
const admin = require('firebase-admin');

async function migratePins() {
  const profiles = await admin.firestore().collection('profiles').get();

  for (const doc of profiles.docs) {
    const data = doc.data();

    // Si le doctorPin existe et fait 4 chiffres
    if (data.medicalInfo?.doctorPin && data.medicalInfo.doctorPin.length === 4) {
      // Marquer comme expiré
      await doc.ref.update({
        'medicalInfo.pinNeedsMigration': true,
        'medicalInfo.oldPinLength': 4
      });
    }
  }
}
```

2. Dans l'UI, détecter `pinNeedsMigration` et afficher un message :
```typescript
if (profile.medicalInfo?.pinNeedsMigration) {
  toast.error('Votre code PIN à 4 chiffres doit être mis à jour vers 6 chiffres pour des raisons de sécurité.');
  // Rediriger vers formulaire de mise à jour
}
```

## Compatibilité Ascendante

### ✅ PINs Hashés avec bcrypt
Les PINs existants hashés avec bcrypt continuent de fonctionner :
- Le hash bcrypt ne change pas selon la longueur du PIN original
- La validation échouera naturellement (regex vérifie 6 chiffres)
- L'utilisateur devra créer un nouveau PIN à 6 chiffres

### ⚠️ PINs en Clair (Anciens Profils)
Les très anciens profils avec PINs en clair (avant migration bcrypt) :
- **NE FONCTIONNERONT PLUS** car la regex rejette les PINs à 4 chiffres
- Solution : Ces utilisateurs devront réinitialiser leur PIN

## Tests Requis

### Tests Unitaires
```bash
# Valider les nouveaux schemas
npm test src/lib/validation.test.ts
npm test src/schemas/activation.test.ts
```

### Tests Manuels
1. **Nouveau Profil**
   - ✅ Créer un profil avec PIN à 6 chiffres
   - ✅ Vérifier que le PIN est accepté
   - ✅ Vérifier que le PIN est hashé (bcrypt)

2. **Profil Existant (PIN bcrypt 4 chiffres)**
   - ❌ Essayer de se connecter avec ancien PIN → Doit échouer
   - ✅ Réinitialiser le PIN → Doit demander 6 chiffres
   - ✅ Se connecter avec nouveau PIN → Doit fonctionner

3. **Validation Frontend**
   - ✅ Taper 7 chiffres → Input bloque à 6
   - ✅ Taper des lettres → Bloqué (only digits)
   - ✅ Placeholder affiche 6 points

## Déploiement

### 1. Déployer le Code
```bash
git add .
git commit -m "security: Upgrade doctor PIN from 4 to 6 digits (1M combinations)"
git push origin main
```

### 2. Communication Utilisateurs
Envoyer un email/notification aux utilisateurs existants :

```
🔒 MISE À JOUR SÉCURITÉ - Code PIN Médical

Pour améliorer la sécurité de vos données médicales, nous avons renforcé le code PIN :
- Avant : 4 chiffres
- Maintenant : 6 chiffres

📝 ACTION REQUISE :
Lors de votre prochaine connexion, vous devrez créer un nouveau code PIN à 6 chiffres.

Merci de votre compréhension,
L'équipe SecureID
```

### 3. Monitorer les Erreurs
Surveiller les logs pour détecter les tentatives avec anciens PINs :
```bash
# Vercel Logs
vercel logs --follow

# Chercher les erreurs de validation PIN
grep "PIN doit contenir exactement 6 chiffres"
```

## Rollback (Si Nécessaire)

En cas de problème critique, rollback rapide :

```bash
# Revenir à la version précédente
git revert HEAD
git push origin main

# OU revenir aux 4 chiffres manuellement
# 1. src/lib/validation.ts: /^[0-9]{4}$/
# 2. src/schemas/activation.ts: .length(4, ...)
# 3. Tous les composants: maxLength={4}
```

## FAQ

**Q: Les anciens PINs à 4 chiffres continuent-ils de fonctionner ?**
R: Non, la validation regex rejette désormais les PINs de moins de 6 chiffres. Les utilisateurs devront créer un nouveau PIN.

**Q: Que se passe-t-il si un utilisateur oublie son PIN ?**
R: Le flux de réinitialisation existe déjà (rate-limited, 5 tentatives/15 min). Il sera mis à jour pour accepter 6 chiffres.

**Q: Peut-on garder les deux formats temporairement ?**
R: Oui, modifier la regex en `^[0-9]{4,6}$` pour accepter 4-6 chiffres pendant la transition. Mais cela réduit la sécurité.

## Améliorations Futures

- [ ] Ajouter CAPTCHA après 3 tentatives échouées
- [ ] Système de notification par email lors de changement de PIN
- [ ] Audit log des accès aux données médicales
- [ ] Option PIN biométrique (FaceID/TouchID)

---

**Date de migration** : 18 Janvier 2026
**Version** : 0.1.1 → 0.2.0
**Breaking Change** : ✅ Oui (PINs existants invalides)
