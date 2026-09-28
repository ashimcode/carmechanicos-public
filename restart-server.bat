@echo off
echo ==============================================
echo   Restarting Mechanic Tycoon Server
echo ==============================================
echo.

call stop-server.bat
echo Waiting for processes to close...
timeout /t 2 >nul

call start-server.bat
