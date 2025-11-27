@echo off
echo ========================================
echo Configuration Firewall pour Node.js
echo ========================================
echo.
echo Ce script va creer une regle firewall pour autoriser Node.js
echo.

REM Chercher le chemin de node.exe
where node.exe > temp_node_path.txt
set /p NODE_PATH=<temp_node_path.txt
del temp_node_path.txt

echo Chemin Node.js detecte: %NODE_PATH%
echo.

REM Créer la règle firewall
echo Creation de la regle firewall...
netsh advfirewall firewall add rule name="Node.js - SecureID Dev Server" dir=in action=allow program="%NODE_PATH%" enable=yes profile=private,public

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS! Regle firewall creee.
    echo ========================================
    echo.
    echo Vous pouvez maintenant acceder au serveur depuis votre telephone:
    echo http://192.168.1.73:3001/s/BF-9000?t=m2SZFK2a
    echo.
) else (
    echo.
    echo ========================================
    echo ERREUR! Execution echouee.
    echo ========================================
    echo.
    echo Assurez-vous d'executer ce script en tant qu'ADMINISTRATEUR:
    echo 1. Clic droit sur le fichier
    echo 2. Executer en tant qu'administrateur
    echo.
)

pause
