# Solution Firewall pour accès réseau local

## Problème
Le serveur Next.js est accessible en local (http://localhost:3001) mais pas depuis le réseau (http://192.168.1.73:3001).

**Cause**: Le firewall Windows bloque les connexions entrantes sur le profil "Public".

---

## Solution 1: Créer une règle firewall (RECOMMANDÉ)

### Via l'interface graphique:

1. Appuyez sur **Windows + R**
2. Tapez `wf.msc` et appuyez sur **Entrée**
3. Dans le panneau gauche, cliquez sur **"Règles de trafic entrant"**
4. Dans le panneau droit, cliquez sur **"Nouvelle règle..."**
5. Sélectionnez **"Programme"** → **Suivant**
6. Chemin du programme: `C:\Program Files\nodejs\node.exe` → **Suivant**
7. Sélectionnez **"Autoriser la connexion"** → **Suivant**
8. Cochez **toutes les cases** (Domaine, Privé, Public) → **Suivant**
9. Nom: `Node.js - SecureID Dev Server` → **Terminer**

### Via PowerShell (Admin):

```powershell
netsh advfirewall firewall add rule name="Node.js - SecureID" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes profile=private,public
```

---

## Solution 2: Désactiver temporairement le firewall (TEST UNIQUEMENT)

⚠️ **ATTENTION**: Utilisez cette solution UNIQUEMENT pour tester. Ne laissez pas le firewall désactivé!

### Via interface graphique:
1. Windows + I (Paramètres)
2. **Mise à jour et sécurité** → **Sécurité Windows**
3. **Pare-feu et protection réseau**
4. Cliquez sur **"Réseau public"**
5. Désactivez **"Pare-feu Microsoft Defender"**
6. **Testez** l'accès depuis le téléphone: http://192.168.1.73:3001/s/BF-9000?t=m2SZFK2a
7. **Réactivez** immédiatement le firewall après le test

### Via PowerShell (Admin):
```powershell
# Désactiver
netsh advfirewall set publicprofile state off

# Tester l'accès

# Réactiver
netsh advfirewall set publicprofile state on
```

---

## Solution 3: Changer le réseau de "Public" à "Privé"

Si votre réseau WiFi domestique est configuré en "Public", changez-le en "Privé":

1. Windows + I (Paramètres)
2. **Réseau et Internet** → **Wi-Fi**
3. Cliquez sur votre réseau actuel
4. Sous **Profil réseau**, sélectionnez **"Privé"**
5. Le firewall sera moins restrictif

---

## Vérification

Après avoir appliqué une solution, vérifiez:

1. **Serveur actif**: http://localhost:3001 (sur PC)
2. **Accès réseau**: http://192.168.1.73:3001/s/BF-9000?t=m2SZFK2a (sur téléphone)
3. **Même WiFi**: Téléphone et PC sur le même réseau

---

## Notes

- **IP actuelle du PC**: 192.168.1.73
- **Port utilisé**: 3001
- **Réseau**: 192.168.1.0/24 (passerelle: 192.168.1.254)
- **Profil actif**: Public (bloque par défaut)

---

## Dépannage

Si ça ne fonctionne toujours pas:

1. Vérifiez que le serveur est démarré: `npm run dev`
2. Vérifiez l'IP avec: `ipconfig`
3. Pingez le PC depuis le téléphone (app "Network Analyzer" ou similaire)
4. Vérifiez que le téléphone est sur le même WiFi (192.168.1.x)
