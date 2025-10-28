@echo off
cls
echo ========================================
echo  Newsworthy Editor - Quick Start
echo ========================================
echo.

REM Check Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found
echo.

REM Check project structure
if not exist "Newsworthy Editor\backend\package.json" (
    echo [ERROR] Backend not found
    pause
    exit /b 1
)

if not exist "Newsworthy Editor\package.json" (
    echo [ERROR] Frontend not found
    pause
    exit /b 1
)

REM Install backend dependencies
if not exist "Newsworthy Editor\backend\node_modules" (
    echo Installing backend dependencies...
    cd "Newsworthy Editor\backend"
    call npm install
    if errorlevel 1 (
        echo [ERROR] Backend install failed
        pause
        exit /b 1
    )
    cd ..\..
    echo.
)

REM Install frontend dependencies
if not exist "Newsworthy Editor\node_modules" (
    echo Installing frontend dependencies...
    cd "Newsworthy Editor"
    call npm install
    if errorlevel 1 (
        echo [ERROR] Frontend install failed
        pause
        exit /b 1
    )
    cd ..
    echo.
)

REM Create .env if needed
if not exist "Newsworthy Editor\backend\.env" (
    if exist "Newsworthy Editor\backend\env.example" (
        echo Creating .env file...
        copy "Newsworthy Editor\backend\env.example" "Newsworthy Editor\backend\.env" >nul
    )
)

REM Start backend
echo Starting backend...
start "Backend" cmd /k "cd /d "%~dp0Newsworthy Editor\backend" && node server.js"

REM Wait for backend
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend...
start "Frontend" cmd /k "cd /d "%~dp0Newsworthy Editor" && npm run dev"

echo.
echo ========================================
echo  Servers Started!
echo ========================================
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
timeout /t 5 /nobreak >nul
start http://localhost:5173
pause