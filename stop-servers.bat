@echo off
REM ================================================================
REM Stop Servers Script - Windows Batch Version
REM Automatically finds and kills processes using ports 5173, 5174, and 3001
REM ================================================================

echo.
echo ====================================
echo   Stop Newsworthy Editor Servers
echo ====================================
echo.

REM Function to kill process on a specific port
REM %1 = port number

:KILL_PORT_5173
echo [1/3] Checking port 5173 (Frontend Vite Dev Server)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    if not "%%a"=="0" (
        echo   ^> Found process PID: %%a
        taskkill /PID %%a /F >nul 2>&1
        if errorlevel 1 (
            echo   ^> Process %%a already terminated or not found
        ) else (
            echo   ^> Successfully killed PID: %%a
        )
    )
)
echo   ^> Port 5173 cleared

:KILL_PORT_5174
echo.
echo [2/3] Checking port 5174 (Frontend HMR)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5174" ^| findstr "LISTENING"') do (
    if not "%%a"=="0" (
        echo   ^> Found process PID: %%a
        taskkill /PID %%a /F >nul 2>&1
        if errorlevel 1 (
            echo   ^> Process %%a already terminated or not found
        ) else (
            echo   ^> Successfully killed PID: %%a
        )
    )
)
echo   ^> Port 5174 cleared

:KILL_PORT_3001
echo.
echo [3/3] Checking port 3001 (Backend API Server)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do (
    if not "%%a"=="0" (
        echo   ^> Found process PID: %%a
        taskkill /PID %%a /F >nul 2>&1
        if errorlevel 1 (
            echo   ^> Process %%a already terminated or not found
        ) else (
            echo   ^> Successfully killed PID: %%a
        )
    )
)
echo   ^> Port 3001 cleared

REM Also kill any established connections
echo.
echo [Extra] Cleaning up established connections...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "ESTABLISHED"') do (
    if not "%%a"=="0" (
        taskkill /PID %%a /F >nul 2>&1
    )
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5174" ^| findstr "ESTABLISHED"') do (
    if not "%%a"=="0" (
        taskkill /PID %%a /F >nul 2>&1
    )
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "ESTABLISHED"') do (
    if not "%%a"=="0" (
        taskkill /PID %%a /F >nul 2>&1
    )
)
echo   ^> Connections cleaned

echo.
echo ====================================
echo   All servers stopped successfully!
echo ====================================
echo.
echo You can now start fresh servers with start-servers.bat
echo.

pause

