@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ════════════════════════════════════════════════════════════
::  Newsworthy Editor - Quick Start Script (Windows)
::  双击此文件即可启动前后端服务器
:: ════════════════════════════════════════════════════════════

title Newsworthy Editor - Starting...

:: 颜色定义 (使用 PowerShell 实现彩色输出)
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RED=[91m"
set "CYAN=[96m"
set "RESET=[0m"

echo.
echo ════════════════════════════════════════════════════════════
echo   Newsworthy Editor - Quick Start
echo ════════════════════════════════════════════════════════════
echo.

:: ────────────────────────────────────────────────────────────
:: Step 1: Environment Check
:: ────────────────────────────────────────────────────────────
echo [1/5] Checking environment...
echo.

:: Check Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please download and install Node.js from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo   [OK] Node.js %NODE_VERSION% found

:: Check npm
where npm >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo   [OK] npm %NPM_VERSION% found

:: Check directories
if not exist "Newsworthy Editor" (
    echo ERROR: "Newsworthy Editor" directory not found!
    echo.
    echo Please ensure you're running this script from the project root directory.
    pause
    exit /b 1
)

if not exist "Newsworthy Editor\backend" (
    echo ERROR: Backend directory not found!
    pause
    exit /b 1
)

echo   [OK] Project directories found
echo.

:: ────────────────────────────────────────────────────────────
:: Step 2: Check Dependencies
:: ────────────────────────────────────────────────────────────
echo [2/5] Checking dependencies...
echo.

:: Check backend dependencies
if not exist "Newsworthy Editor\backend\node_modules" (
    echo   Installing backend dependencies...
    cd "Newsworthy Editor\backend"
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install backend dependencies!
        cd ..\..
        pause
        exit /b 1
    )
    cd ..\..
    echo   [OK] Backend dependencies installed
) else (
    echo   [OK] Backend dependencies already installed
)

:: Check frontend dependencies
if not exist "Newsworthy Editor\node_modules" (
    echo   Installing frontend dependencies...
    cd "Newsworthy Editor"
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies!
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo   [OK] Frontend dependencies installed
) else (
    echo   [OK] Frontend dependencies already installed
)

echo.

:: ────────────────────────────────────────────────────────────
:: Step 3: Check Ports
:: ────────────────────────────────────────────────────────────
echo [3/5] Checking ports...
echo.

:: Check if port 3001 is in use
netstat -ano | findstr :3001 >nul
if not errorlevel 1 (
    echo WARNING: Port 3001 is already in use!
    echo.
    choice /C YN /M "Do you want to kill the process and continue"
    if errorlevel 2 (
        echo Cancelled by user.
        pause
        exit /b 1
    )
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    echo   [OK] Port 3001 freed
) else (
    echo   [OK] Port 3001 is available
)

:: Check if port 5173 is in use
netstat -ano | findstr :5173 >nul
if not errorlevel 1 (
    echo WARNING: Port 5173 is already in use!
    echo.
    choice /C YN /M "Do you want to kill the process and continue"
    if errorlevel 2 (
        echo Cancelled by user.
        pause
        exit /b 1
    )
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    echo   [OK] Port 5173 freed
) else (
    echo   [OK] Port 5173 is available
)

echo.

:: ────────────────────────────────────────────────────────────
:: Step 4: Start Backend Server
:: ────────────────────────────────────────────────────────────
echo [4/5] Starting backend server...
echo.

:: Start backend in a new window
start "Newsworthy Editor - Backend (Port 3001)" cmd /k "cd /d "%~dp0Newsworthy Editor\backend" && npm start"

:: Wait for backend to be ready
echo   Waiting for backend to start...
timeout /t 3 /nobreak >nul
echo   [OK] Backend window opened (http://localhost:3001)

echo.

:: ────────────────────────────────────────────────────────────
:: Step 5: Start Frontend Server
:: ────────────────────────────────────────────────────────────
echo [5/5] Starting frontend server...
echo.

:: Start frontend in a new window
start "Newsworthy Editor - Frontend (Port 5173)" cmd /k "cd /d "%~dp0Newsworthy Editor" && npm run dev"

:: Wait for frontend to be ready
echo   Waiting for frontend to start...
timeout /t 5 /nobreak >nul
echo   [OK] Frontend window opened (http://localhost:5173)

echo.

:: ────────────────────────────────────────────────────────────
:: Setup Complete!
:: ────────────────────────────────────────────────────────────
echo ════════════════════════════════════════════════════════════
echo   Setup Complete!
echo ════════════════════════════════════════════════════════════
echo.
echo   Two new windows have been opened:
echo   1. Backend Server  (Port 3001)
echo   2. Frontend Server (Port 5173)
echo.
echo   Next Steps:
echo   1. Open your browser and navigate to:
echo      http://localhost:5173
echo.
echo   2. Configure your GitHub settings in the app:
echo      - Click the Settings button in the sidebar
echo      - Enter your GitHub token, owner, repo, and branch
echo      - Save the configuration
echo.
echo   Server URLs:
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:3001
echo   - API Docs: http://localhost:3001/api
echo.
echo   To stop the servers, close the backend and frontend windows
echo   or press Ctrl+C in each window.
echo.
echo ════════════════════════════════════════════════════════════
echo.

:: Open browser automatically (optional)
choice /C YN /M "Do you want to open the browser now"
if not errorlevel 2 (
    start http://localhost:5173
)

echo.
echo Press any key to close this window...
pause >nul

