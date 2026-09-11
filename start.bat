@echo off
setlocal
cd /d "%~dp0"

echo ========================================
echo  Priyadharshini Portfolio (Vite)
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed or not in PATH.
  echo Install Node.js from https://nodejs.org and try again.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
  echo.
)

echo Scanning assets and starting Vite...
echo Site: http://localhost:3000
echo Close this window to stop the server.
echo.

call npm start

pause
