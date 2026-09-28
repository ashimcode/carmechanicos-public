@echo off
setlocal
cd /d "%~dp0"

echo Starting CarMechanicOS local server on port 5501...
start "CarMechanicOS Local Server" /min node "%~dp0serve-local.js"

timeout /t 1 /nobreak >nul
echo Starting Cloudflare Tunnel for carmechanicos.com...
set "CLOUDFLARED="
if exist "%~dp0cloudflared.exe" set "CLOUDFLARED=%~dp0cloudflared.exe"
if not defined CLOUDFLARED for /f "delims=" %%C in ('where cloudflared 2^>nul') do if not defined CLOUDFLARED set "CLOUDFLARED=%%C"
if not defined CLOUDFLARED (
  echo Cloudflare Tunnel client not found. Local server is still available at http://127.0.0.1:5501.
  start "" "http://127.0.0.1:5501"
  exit /b 1
)
start "CarMechanicOS Cloudflare Tunnel" /min "%CLOUDFLARED%" tunnel run mechanicos > "%~dp0cloudflared.log" 2>&1

timeout /t 2 /nobreak >nul
start "" "https://carmechanicos.com"
echo Live site opened: https://carmechanicos.com
