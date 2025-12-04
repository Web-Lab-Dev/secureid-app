# Configuration Firebase Storage

## Problème
Firebase Storage n'est pas encore activé sur le projet `taskflow-26718`.

## Solution

### Étape 1: Activer Firebase Storage
1. Aller sur: https://console.firebase.google.com/project/taskflow-26718/storage
2. Cliquer sur "Get Started" ou "Commencer"
3. Choisir la localisation (recommandé: `europe-west1` pour la France/BF)
4. Cliquer sur "Terminé"

### Étape 2: Déployer les règles Storage
Une fois Storage activé, exécuter:

```bash
cd secureid-app
firebase deploy --only storage
```

## Règles Storage configurées

### `/profiles/{profileId}/`
- **Lecture**: Publique (pour affichage des photos sur bracelets scannés)
- **Écriture**: Utilisateurs authentifiés seulement
- **Limite**: 10MB par photo
- **Type**: Images uniquement

### `/medical_docs/{profileId}/`
- **Lecture/Écriture**: Parent propriétaire seulement
- **Limite**: 10MB par document
- **Type**: Images et PDF

### `/pickup_photos/{profileId}/` (Phase 8 - Anges Gardiens)
- **Lecture**: Publique (pour portail école)
- **Écriture**: Parent propriétaire seulement
- **Limite**: 5MB par photo
- **Type**: Images uniquement

## Vérification
Après activation et déploiement, tester l'upload:
1. Se connecter au dashboard
2. Aller sur un profil enfant
3. Onglet "École & Sorties"
4. Cliquer sur "Ajouter" un ange gardien
5. Upload une photo
6. Vérifier que l'ajout se fait sans erreur
