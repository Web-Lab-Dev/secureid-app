# Fichiers Sons pour Alertes

## Alert.mp3

Ce dossier doit contenir le fichier son `alert.mp3` utilisé pour les alertes de géofencing.

### Caractéristiques recommandées:
- **Format**: MP3 ou WAV
- **Durée**: 2-5 secondes
- **Volume**: Normalisé (pas trop fort)
- **Type**: Son d'alerte sécurité (bip, sirène douce, notification)

### Sources gratuites pour télécharger un son d'alerte:

1. **Freesound.org** (Creative Commons)
   - https://freesound.org/search/?q=alert+notification
   - Recherche: "security alert", "notification beep", "warning sound"

2. **Pixabay Sounds** (Libre de droits)
   - https://pixabay.com/sound-effects/search/alert/
   - Recherche: "alert", "notification", "warning"

3. **Zapsplat** (Usage gratuit avec attribution)
   - https://www.zapsplat.com/sound-effect-category/alarms-and-sirens/
   - Section: Alarms & Sirens

### Nommer le fichier:
Une fois téléchargé, renommer le fichier en `alert.mp3` et le placer dans ce dossier.

### Test:
Le son sera joué automatiquement quand:
- L'enfant sort de toutes les zones de sécurité configurées
- Le délai d'alerte est écoulé (délai configurable par zone)
- L'alerte visuelle apparaît sur la carte

### Alternative simple:
Si vous n'avez pas de fichier son, vous pouvez utiliser un bip système par défaut en modifiant le code pour utiliser `new Audio('/sounds/alert.mp3')` ou l'API Web Audio.
