@echo off
echo ==============================================
echo   Stopping Mechanic Tycoon Server
echo ==============================================
echo.

echo Killing Cloudflare Tunnel process...
taskkill /IM cloudflared.exe /F 2>nul

echo Killing CarMechanicOS local server...
taskkill /FI "WINDOWTITLE eq CarMechanicOS Local Server*" /T /F 2>nul

echo.
echo All server processes have been stopped!
pause
