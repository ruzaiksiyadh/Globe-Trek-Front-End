@echo off
REM Double-click this file to start the GlobeTrek website.
REM It automatically finds its own folder, so it works no matter where you put it.

cd /d "%~dp0"

echo ============================================
echo   GlobeTrek Frontend
echo   Folder: %cd%
echo ============================================
echo.

if not exist "index.html" (
  echo ERROR: index.html not found in this folder.
  echo This .bat file must stay inside the globetrek folder.
  pause
  exit /b 1
)

echo Starting local web server on port 5500...
echo Once you see "Listening", open this in your browser:
echo    http://localhost:5500
echo.
echo This window must stay open while you use the site.
echo.
call bunx serve -l 5500

pause
