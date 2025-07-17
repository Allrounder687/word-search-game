@echo off
title Word Search Game Launcher
color 0B

echo ======================================
echo       WORD SEARCH GAME LAUNCHER
echo ======================================
echo.

cd %~dp0

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist node_modules\ (
    echo Installing dependencies...
    npm install
    if %ERRORLEVEL% neq 0 (
        color 0C
        echo ERROR: Failed to install dependencies.
        echo.
        pause
        exit /b 1
    )
)

:: Check if server is already running
netstat -ano | findstr :5173 >nul
if %ERRORLEVEL% equ 0 (
    echo Server is already running on port 5173.
    echo Opening game in browser...
    start http://localhost:5173/
) else (
    echo Launching development server...
    start cmd /c "title Word Search Game Server && color 0A && npm run dev"
    
    echo Waiting for server to start...
    echo This may take a few moments...
    
    :: Wait for server to start (up to 30 seconds)
    set /a attempts=0
    :WAIT_LOOP
    timeout /t 1 /nobreak >nul
    set /a attempts+=1
    
    :: Check if server is running
    netstat -ano | findstr :5173 >nul
    if %ERRORLEVEL% equ 0 (
        goto SERVER_STARTED
    )
    
    :: Try up to 30 times (30 seconds)
    if %attempts% lss 30 (
        echo Waiting for server to start... %attempts%/30
        goto WAIT_LOOP
    ) else (
        color 0E
        echo WARNING: Server might not have started properly.
        echo Will try to open the game anyway.
    )
    
    :SERVER_STARTED
    echo Server started successfully!
    echo Opening game in browser...
    start http://localhost:5173/
)

echo.
echo ======================================
echo Game launched successfully!
echo.
echo You can now play the Word Search Game in your browser.
echo.
echo To close the game server when you're done playing,
echo close the server command window or press Ctrl+C in that window.
echo ======================================
echo.

pause