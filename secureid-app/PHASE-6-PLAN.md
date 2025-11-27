# Phase 6: Polish UX & AI Design - Plan d'implémentation

## Vue d'ensemble
Transformation de l'interface en expérience immersive "Glass Tactical" avec:
- Glassmorphism (transparence, flou, profondeur)
- Animations fluides
- Chatbot IA intégré visuellement (UI mockup)
- Micro-interactions avancées

---

## Phase 6A - Design System "Glass Tactical"

### 1. Fond d'écran avec texture
- **Fichier**: `src/app/s/[slug]/page-client.tsx`
- **Changement**: Remplacer `bg-slate-900` par gradient mesh
- **CSS**: Dégradé radial subtil avec effet de profondeur

### 2. Cartes Glassmorphism
- **Fichiers**: Tous les composants emergency
- **Changement**:
  - `bg-slate-800` → `bg-slate-900/60 backdrop-blur-xl`
  - Ajouter `border border-white/10`
  - Ombres portées colorées (glow effects)

### 3. Ombres lumineuses (Glow)
- Photo enfant: Shadow coloré subtil
- Alerte médicale: `shadow-red-500/20` diffus
- Status badge: Glow orange ou rouge selon état

---

## Phase 6B - Identité Visuelle Renforcée

### 4. Status Badge Animé
- **Fichier**: `src/components/emergency/EmergencyHeader.tsx`
- **Animation**: `animate-pulse` sur badge alerte (battement cœur)
- **Effet**: Captation visuelle immédiate

### 5. Photo avec cercle de scan
- **Fichier**: `src/components/emergency/IdentityCard.tsx`
- **Ajout**: SVG cercle de progression qui tourne (radar effect)
- **Animation**: Rotation lente continue (scan en cours)

---

## Phase 6C - Chatbot IA (Design Mockup)

### 6. Floating Action Button (FAB)
- **Fichier**: `src/components/emergency/AIChatFab.tsx` (NEW)
- **Position**: Fixed bottom-right
- **Design**: Cercle dégradé bleu/violet avec icône Bot
- **Micro-interaction**:
  - Scroll down: Réduit (icône seule)
  - Scroll stop: Étend avec texte "Assistant IA"

### 7. Bottom Sheet Chat (Mockup)
- **Fichier**: `src/components/emergency/AIChatSheet.tsx` (NEW)
- **Trigger**: Clic sur FAB
- **Animation**: Slide up from bottom (50% viewport)
- **Contenu mockup**:
  - En-tête: "Assistant Médical IA 🤖"
  - Message accueil: "Bonjour. Je détecte..."
  - 3 chips suggestions: Pharmacie / Médecin / Premiers Secours

---

## Phase 6D - Micro-interactions Avancées

### 8. Copie rapide numéro téléphone
- **Fichier**: `src/components/emergency/IdentityCard.tsx`
- **Ajout**: Icône Copy à côté du contact
- **Action**: Clipboard API + Toast "Copié!"

### 9. Mini carte GPS (Preview)
- **Fichier**: `src/components/emergency/GPSPreview.tsx` (NEW)
- **Design**: Carte statique avec radar ondulant
- **Intégration**: Remplace bouton GPS simple

---

## Structure fichiers à créer/modifier

```
src/
├── app/s/[slug]/
│   └── page-client.tsx                # MODIFIER (gradient mesh background)
├── components/emergency/
│   ├── EmergencyHeader.tsx            # MODIFIER (badge animated)
│   ├── IdentityCard.tsx               # MODIFIER (scan circle, copy button)
│   ├── MedicalCard.tsx                # MODIFIER (glassmorphism)
│   ├── ActionsFooter.tsx              # MODIFIER (glassmorphism)
│   ├── AIChatFab.tsx                  # NEW (floating button)
│   ├── AIChatSheet.tsx                # NEW (bottom sheet mockup)
│   └── GPSPreview.tsx                 # NEW (mini map preview)
└── styles/
    └── glassmorphism.css              # NEW (optional, inline styles OK)
```

---

## Détails techniques

### Glassmorphism CSS
```css
.glass-card {
  background: rgba(15, 23, 42, 0.6);  /* slate-900/60 */
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
}
```

### Gradient Mesh Background
```css
background:
  radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.05) 0px, transparent 50%),
  radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.05) 0px, transparent 50%),
  radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.05) 0px, transparent 50%),
  #0f172a;  /* slate-900 base */
```

### Scan Circle SVG
```tsx
<svg className="absolute inset-0" viewBox="0 0 100 100">
  <circle
    cx="50"
    cy="50"
    r="48"
    fill="none"
    stroke="url(#gradient)"
    strokeWidth="2"
    strokeDasharray="10 5"
    className="animate-spin-slow"
  />
  <defs>
    <linearGradient id="gradient">
      <stop offset="0%" stopColor="#f97316" />
      <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
    </linearGradient>
  </defs>
</svg>
```

### FAB Scroll Behavior
```tsx
const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 100);
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

---

## Animations Tailwind Custom

Ajouter dans `tailwind.config.ts`:
```js
animation: {
  'spin-slow': 'spin 8s linear infinite',
  'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
}
keyframes: {
  'pulse-glow': {
    '0%, 100%': {
      opacity: '1',
      boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
    },
    '50%': {
      opacity: '0.8',
      boxShadow: '0 0 40px rgba(239, 68, 68, 0.8)'
    },
  },
}
```

---

## Ordre d'implémentation

1. **Phase 6A**: Design System Glass (fond + cartes)
2. **Phase 6B**: Identité visuelle (badge + scan circle)
3. **Phase 6C**: Chatbot IA (FAB + Bottom Sheet)
4. **Phase 6D**: Micro-interactions (copy + GPS preview)

---

## Résultat attendu

Une interface qui ressemble à:
- **Apple Health** (glassmorphism, depth)
- **Notion AI** (chat assistant intégré)
- **Military HUD** (scan effects, tactical feel)
- **iOS Dark Mode** (smooth, polished, premium)

---

**Temps estimé**: 2-3 heures
**Impact UX**: 🚀 **Transformation majeure**
