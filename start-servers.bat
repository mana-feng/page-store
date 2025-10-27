@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo  Starting Newsworthy Editor
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed
    pause
    exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
    echo Error: npm is not installed
    pause
    exit /b 1
)

if not exist "Newsworthy Editor" (
    echo Error: Newsworthy Editor directory not found
    pause
    exit /b 1
)

if not exist "Newsworthy Editor\backend" (
    echo Error: Backend directory not found
    pause
    exit /b 1
)

echo Checking dependencies...
echo.

if not exist "Newsworthy Editor\backend\node_modules" (
    echo Installing backend dependencies...
    cd "Newsworthy Editor\backend"
    call npm install
    cd ..\..
)

if not exist "Newsworthy Editor\node_modules" (
    echo Installing frontend dependencies...
    cd "Newsworthy Editor"
    call npm install
    cd ..
)

echo.
echo Starting servers in new windows...
echo.

set BACKEND_DIR=%~dp0Newsworthy Editor\backend
set FRONTEND_DIR=%~dp0Newsworthy Editor

start "Backend Server" cmd /k "cd /d "%BACKEND_DIR%" & node server.js"

timeout /t 3 /nobreak >nul

start "Frontend Server" cmd /k "cd /d "%FRONTEND_DIR%" & npm run dev"

echo.
echo Servers started
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul

start http://localhost:5173

echo.
echo Close the server windows to stop
pause
