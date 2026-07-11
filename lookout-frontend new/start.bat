@echo off
:: LookOut - Frontend & Backend Launcher Script (Windows)

echo.
echo =====================================
echo       LookOut Launcher
echo =====================================
echo.

:: Get the directory where the script is located
set "SCRIPT_DIR=%~dp0"
set "FRONTEND_DIR=%SCRIPT_DIR%front_end\lookout-pg1"
set "BACKEND_DIR=%SCRIPT_DIR%front_end\lookout-pg1\backend"

echo Script directory: %SCRIPT_DIR%
echo Frontend directory: %FRONTEND_DIR%
echo Backend directory: %BACKEND_DIR%
echo.

:: Check if Node.js is installed
echo Checking prerequisites...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)
echo [OK] Node.js found

:: Check if npm is installed
call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)
echo [OK] npm found
echo.

:: Install frontend dependencies
echo Setting up frontend dependencies...
cd /d "%FRONTEND_DIR%"
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo [OK] Frontend dependencies installed
) else (
    echo [OK] Frontend dependencies already installed
)

:: Install backend dependencies
echo Setting up backend dependencies...
cd /d "%BACKEND_DIR%"
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install backend dependencies
        pause
        exit /b 1
    )
    echo [OK] Backend dependencies installed
) else (
    echo [OK] Backend dependencies already installed
)

:: Start the application
echo.
echo =====================================
echo      Starting LookOut App
echo =====================================
echo.
echo Frontend will run on: http://localhost:3000
echo Backend will run on: http://localhost:3001
echo.
echo Press Ctrl+C to stop both services
echo.

cd /d "%FRONTEND_DIR%"
call npm run start