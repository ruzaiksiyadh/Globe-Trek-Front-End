@echo off
REM Double-click this file to start both the GlobeTrek Backend and Frontend simultaneously.
cd /d "%~dp0"

echo ===================================================
echo   Starting GlobeTrek (Frontend + Backend)
echo ===================================================
echo.

REM Check if backend folder exists
if exist "..\globetrek-backend\start.bat" (
  echo [1/2] Starting GlobeTrek Backend (Port 4000)...
  start "GlobeTrek Backend (Port 4000)" cmd /k "cd /d "%~dp0..\globetrek-backend" && call start.bat"
  timeout /t 2 /nobreak >nul
) else (
  echo [!] Backend folder not found at ..\globetrek-backend. Running in standalone frontend mode.
)

echo.
echo [2/2] Starting GlobeTrek Frontend (Port 5500)...
echo Opening http://localhost:5500 in your browser...
start http://localhost:5500

echo.
echo Server is running. Keep this window open while testing.
call bunx serve -l 5500

pause
