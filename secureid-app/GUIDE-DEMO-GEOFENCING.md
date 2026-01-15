# Guide Démo - Système de Geofencing Multi-Zones

## 🎯 Objectif

Ce guide explique comment utiliser le **Mode Démo** pour présenter le système de zones de sécurité avec alertes en temps réel lors de démonstrations clients.

---

## 📋 Prérequis

### 1. Configuration des Zones de Sécurité

Avant la démo, configurez au moins une zone de sécurité :

1. **Accéder à la configuration** :
   - Aller sur `/dashboard/profile/[id]/safe-zones`
   - Ou cliquer sur "Configurer les zones" depuis le profil

2. **Créer une zone de test** :
   - Nom : "École Test" ou "Zone Démo"
   - Icône : 🏫 (école) ou 🏠 (maison)
   - Position : Utiliser votre position actuelle pour faciliter le test
   - Rayon : **500m** (recommandé pour démo)
   - Couleur : Vert (par défaut)
   - Délai d'alerte : **2 minutes** (pour démo rapide) ou 1 minute pour encore plus rapide

3. **Activer la zone** :
   - S'assurer que le toggle est sur "Activée" (vert)

### 2. Fichier Son d'Alerte

1. Télécharger un son d'alerte :
   - Source recommandée : https://freesound.org/ ou https://pixabay.com/sound-effects/
   - Rechercher : "alert", "security alert", "notification"
   - Format : MP3, durée 2-5 secondes

2. Placer le fichier :
   ```
   /public/sounds/alert.mp3
   ```

3. Tester le son :
   - Ouvrir `/public/sounds/alert.mp3` dans le navigateur
   - Vérifier que le volume est audible mais pas trop fort

---

## 🎬 Scénario de Démonstration

### Étape 1 : Activer le Mode Démo

1. **Accéder à la page de tracking** :
   ```
   /dashboard/profile/[id]/tracking?demo=true
   ```

   Ou modifier le code pour passer `enableDemoControls={true}` au composant `GpsSimulationCard`.

2. **Vérifier que le bouton "Mode Démo" apparaît** en bas à gauche de la carte.

3. **Cliquer sur "Mode Démo"** pour afficher les contrôles.

### Étape 2 : Présentation Initiale

**Narration suggérée** :

> "SecureID permet aux parents de configurer des zones de sécurité autour des lieux fréquentés par leurs enfants. Sur cette carte, vous voyez en temps réel :
>
> - 🔵 La position du parent (marqueur bleu avec horloge)
> - 🟢 Les zones de sécurité configurées (cercles colorés)
> - 👦 La position de l'enfant (photo ou pin avec effet radar)
> - 📊 La distance et le temps de trajet en temps réel
>
> En ce moment, l'enfant est **dans la zone sûre** (badge vert en haut à gauche)."

### Étape 3 : Déclencher l'Alerte

1. **Cliquer sur "Sortir de la zone"** dans les contrôles démo.

2. **Narration** :
   > "Simulons maintenant une situation où l'enfant sort de la zone de sécurité..."

3. **Observer les changements** :
   - 🔴 Le marqueur enfant se déplace hors du cercle vert
   - ⚠️ Le badge passe au orange avec "Hors de toutes les zones"
   - ⏱️ Un timer interne démarre (2 minutes dans notre config)

4. **Narration pendant l'attente** :
   > "Le système a détecté que l'enfant est sorti de la zone. Un délai configurable (ici 2 minutes) est en cours avant de déclencher l'alerte. Cela évite les fausses alertes si l'enfant traverse simplement la zone rapidement."

### Étape 4 : Alerte Déclenchée

Après le délai configuré (1-2 minutes) :

1. **L'alerte visuelle apparaît** :
   - 🚨 Bannière rouge en haut : "ALERTE SÉCURITÉ"
   - Message : "Votre enfant est hors de la zone sécurisée depuis plus de X minutes"

2. **Le son d'alerte joue** :
   - 🔊 Son d'alerte audible (si fichier alert.mp3 présent)

3. **Notification push** (si configurée) :
   - 📱 Notification envoyée sur le téléphone du parent

4. **Narration** :
   > "Voilà ! Le parent reçoit immédiatement :
   > - Une alerte visuelle sur l'application
   > - Un son d'alerte
   > - Une notification push sur son téléphone
   >
   > Il peut ainsi réagir rapidement et contacter l'enfant ou les autorités si nécessaire."

### Étape 5 : Retour dans la Zone

1. **Cliquer sur "Rentrer dans la zone"** dans les contrôles démo.

2. **Observer** :
   - ✅ Le marqueur enfant retourne au centre de la zone verte
   - 🟢 Le badge redevient vert : "Dans 1 zone"
   - ❌ L'alerte disparaît automatiquement
   - ⏱️ Le timer est annulé

3. **Narration** :
   > "Si l'enfant rentre dans la zone avant la fin du délai, le timer est automatiquement annulé. Aucune alerte n'est envoyée. C'est ce qui rend le système intelligent et évite les fausses alertes."

### Étape 6 : Démonstration Multi-Zones (Bonus)

Si vous avez configuré plusieurs zones :

1. **Créer 2-3 zones** (École, Maison, Parc) avant la démo.

2. **Montrer que l'enfant peut être dans plusieurs zones** :
   - Badge affiche : "Dans 2 zones" si les zones se chevauchent

3. **Expliquer la logique** :
   > "Le système déclenche l'alerte uniquement si l'enfant sort de **TOUTES** les zones configurées. Chaque zone a son propre rayon et délai d'alerte personnalisable."

---

## 🎨 Personnalisation pour la Démo

### Ajuster le Délai d'Alerte

Pour des démos plus rapides :

1. Aller dans la configuration de zone
2. Régler "Délai avant alerte" à **1 minute** minimum
3. Sauvegarder

**Note** : En production, recommander aux parents des délais de 5-10 minutes pour éviter les fausses alertes.

### Utiliser des Emplacements Réels

Pour une démo plus impactante :

1. **Position actuelle** :
   - Utiliser la géolocalisation réelle lors de la démo
   - Configurer une zone autour du lieu de présentation

2. **Positions connues** :
   - École locale, parc, centre commercial
   - Montre que le système fonctionne avec de vraies adresses

### Désactiver le Mouvement Automatique

Si le mouvement automatique de simulation perturbe la démo :

1. Modifier `GpsSimulationCard.tsx` ligne 189-211
2. Commenter le `useEffect` du mouvement automatique
3. L'enfant ne bougera que via les contrôles manuels

---

## 🐛 Troubleshooting

### Le Mode Démo n'apparaît pas

**Vérifier** :
- La prop `enableDemoControls={true}` est passée au composant
- Ou ajouter `?demo=true` dans l'URL et gérer via query params

### Le Son ne Joue Pas

**Vérifier** :
1. Le fichier `/public/sounds/alert.mp3` existe
2. Le format est bien MP3
3. Le navigateur autorise la lecture audio (cliquer sur la page d'abord)
4. Console browser pour voir les erreurs

**Solution alternative** :
```typescript
// Utiliser l'API Audio native
const audio = new Audio('/sounds/alert.mp3');
audio.play();
```

### L'Alerte ne se Déclenche Pas

**Vérifier** :
1. La zone est bien **activée** (toggle vert)
2. Le `profileId` est passé au composant
3. Les zones sont bien chargées depuis Firestore
4. L'enfant est bien **hors de TOUTES les zones**
5. Le délai configuré est écoulé (attendre 1-2 minutes)

**Debug** :
- Ouvrir la console navigateur
- Chercher les logs : "Child exited all safe zones, timer started"
- Vérifier `activeZones.length === 0`

### La Carte ne Charge Pas

**Vérifier** :
1. La clé Google Maps API est valide
2. Variable d'environnement `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` définie
3. API Google Maps activée dans la console Google Cloud

---

## 📱 Démo sur Mobile

Pour une démo sur téléphone mobile :

1. **Build production** :
   ```bash
   npm run build
   npm start
   ```

2. **Accès réseau local** :
   - Trouver l'IP locale : `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
   - Accéder via : `http://192.168.x.x:3000` sur mobile

3. **Notifications push** :
   - S'assurer que les notifications sont autorisées
   - Tester en amont avec `/test-notif`

---

## ✅ Checklist Pré-Démo

- [ ] Au moins 1 zone de sécurité configurée
- [ ] Zone activée (toggle vert)
- [ ] Délai d'alerte court (1-2 min pour démo)
- [ ] Fichier alert.mp3 présent dans /public/sounds/
- [ ] Mode démo activé (`enableDemoControls={true}`)
- [ ] Batterie téléphone chargée
- [ ] Connexion internet stable
- [ ] Google Maps API fonctionne
- [ ] Son testé et audible
- [ ] Notifications push testées (si applicable)

---

## 🚀 Tips pour une Démo Réussie

1. **Préparer les transitions** : Connaître l'ordre des clics pour fluidité
2. **Tester en amont** : Faire une répétition complète 30 min avant
3. **Avoir un backup** : Vidéo enregistrée si problème technique
4. **Expliquer la valeur** : Insister sur la sécurité enfants et la tranquillité parents
5. **Montrer la simplicité** : "3 clics pour configurer une zone"
6. **Personnaliser** : Utiliser le nom de l'enfant du prospect dans la démo

---

**Bonne démo ! 🎉**
