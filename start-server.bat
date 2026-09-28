@echo off
echo ==============================================
echo   Mechanic Tycoon Server Launcher
echo ==============================================
echo.

echo Starting local web server on port 5501...
start "CarMechanicOS Local Server" /min node "%~dp0serve-local.js"

echo Starting Cloudflare Tunnel (carmechanicos.com)...
set "CLOUDFLARED="
if exist "%~dp0cloudflared.exe" set "CLOUDFLARED=%~dp0cloudflared.exe"
if not defined CLOUDFLARED for /f "delims=" %%C in ('where cloudflared 2^>nul') do if not defined CLOUDFLARED set "CLOUDFLARED=%%C"
if not defined CLOUDFLARED (
  echo Cloudflare Tunnel client not found. The local server will continue without the live tunnel.
) else (
  start "CarMechanicOS Cloudflare Tunnel" /min "%CLOUDFLARED%" tunnel run mechanicos > "%~dp0cloudflared.log" 2>&1
)

timeout /t 2 /nobreak >nul
start "" "https://carmechanicos.com"

echo.
echo Server processes have been started in the background!
echo Check cloudflared.log for tunnel output.
pause
