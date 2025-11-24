# SecureID - Application Mobile-First

Application Next.js 14+ optimisée pour les réseaux mobiles africains (3G/4G), développée selon les spécifications du cahier des charges Phase 0.

## Technologies Utilisées

- **Framework**: Next.js 14+ (App Router)
- **Langage**: TypeScript
- **Styling**: Tailwind CSS v4
- **Composants UI**: Shadcn/UI (Style Default, Couleur Slate)
- **Icônes**: Lucide React
- **Animations**: Framer Motion
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Polices**: Inter & Roboto Mono (optimisées avec next/font)

## Caractéristiques Principales

### Mobile-First Design
- Viewport configuré pour empêcher le zoom intempestif (`maximum-scale=1, user-scalable=0`)
- Boutons tactiles optimisés (min 44px de hauteur)
- Design responsive avec Safe Areas pour notches iPhone

### Palette de Couleurs
- `brand-black`: #1a1a1a (Noir mat profond)
- `brand-orange`: #f97316 (Orange sécurité haute visibilité)
- `tactical-green`: #10b981 (Vert HUD)
- `alert-red`: #ef4444 (Urgence vitale)

### Performance
- Optimisé pour un score Lighthouse Mobile de 100/100
- Polices optimisées avec next/font
- Code léger et performant
- Priorité au First Contentful Paint

## Installation

1. **Cloner le projet** et naviguer dans le dossier :
   ```bash
   cd secureid-app
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configurer Firebase** :
   - Copier `.env.local.example` vers `.env.local`
   - Remplir avec vos clés Firebase :
     ```env
     NEXT_PUBLIC_FIREBASE_API_KEY=votre_cle_api
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_domaine.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_bucket.appspot.com
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
     ```

4. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```

5. **Ouvrir l'application** :
   - Dans votre navigateur : [http://localhost:3000](http://localhost:3000)
   - Sur mobile via IP locale pour tester le design mobile

## Structure du Projet

```
secureid-app/
├── src/
│   ├── app/
│   │   ├── globals.css      # Styles globaux et configuration Tailwind
│   │   ├── layout.tsx       # Layout principal avec viewport mobile
│   │   └── page.tsx         # Page d'accueil (Proof of Concept)
│   ├── components/
│   │   └── ui/              # Composants Shadcn/UI
│   │       └── button.tsx
│   └── lib/
│       ├── firebase.ts      # Configuration Firebase (Singleton)
│       └── utils.ts         # Utilitaires Shadcn
├── .env.local.example       # Template des variables d'environnement
└── components.json          # Configuration Shadcn/UI
```

## Scripts Disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm start` - Lance le serveur de production
- `npm run lint` - Vérifie le code avec ESLint

## Proof of Concept - Page d'Accueil

La page d'accueil actuelle démontre :
- ✅ Fond sombre (`bg-brand-black`)
- ✅ Bouton Shadcn centré "SYSTÈME OPÉRATIONNEL"
- ✅ Animations Framer Motion fluides
- ✅ Design mobile-first avec boutons tactiles optimisés
- ✅ Icône Shield avec effet de pulsation
- ✅ Indicateur de statut animé
- ✅ Polices Roboto Mono pour un look technique

## Test Mobile

Pour tester sur votre téléphone :

1. Assurez-vous que votre ordinateur et téléphone sont sur le même réseau WiFi
2. Trouvez l'adresse IP locale de votre ordinateur
3. Lancez `npm run dev`
4. Sur votre téléphone, ouvrez `http://[VOTRE_IP]:3000`
5. Vérifiez que les boutons sont facilement cliquables (min 44px)

## Prochaines Étapes

Ce projet est la **Phase 0 - Fondations & Architecture**. Les prochaines phases incluront :
- Module d'authentification sécurisée
- Système de scan QR
- Gestion des identités
- Tableau de bord utilisateur

## Notes Importantes

⚠️ **Sécurité** : Ne jamais committer le fichier `.env.local` contenant vos vraies clés Firebase.

🎯 **Performance** : Toute librairie ajoutée doit être justifiée et ne pas impacter les performances mobiles.

📱 **Mobile-First** : 99% des utilisateurs sont sur mobile. Tester systématiquement sur appareil réel.

## Licence

Projet développé selon le cahier des charges Phase 0.
