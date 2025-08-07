@echo off
title Word Search Game
color 0B

echo ======================================
echo       WORD SEARCH GAME PLAYER
echo ======================================
echo.

cd %~dp0

:: Check if the dist folder exists
if not exist dist\ (
    color 0C
    echo ERROR: The game has not been built yet.
    echo Running build process first...
    
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
    
    :: Build the project
    echo Building the project...
    call npm run build
    if %ERRORLEVEL% neq 0 (
        color 0C
        echo ERROR: Failed to build the project.
        echo.
        pause
        exit /b 1
    )
)

:: Start a simple HTTP server to serve the dist folder
echo Starting the game...
echo.

:: Check if Python is installed (for simple HTTP server)
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    start "" cmd /c "title Word Search Game Server && color 0A && cd dist && python -m http.server 8080"
    timeout /t 2 /nobreak >nul
    start http://localhost:8080/
) else (
    :: Try Python3 if Python is not found
    where python3 >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        start "" cmd /c "title Word Search Game Server && color 0A && cd dist && python3 -m http.server 8080"
        timeout /t 2 /nobreak >nul
        start http://localhost:8080/
    ) else (
        :: If no Python, try with npm preview
        echo Python not found, using npm preview instead...
        start "" cmd /c "title Word Search Game Server && color 0A && npm run preview"
        timeout /t 2 /nobreak >nul
        start http://localhost:4173/
    )
)

echo.
echo ======================================
echo Game launched successfully!
echo.
echo You can now play the Word Search Game in your browser.
echo.
echo To close the game when you're done playing,
echo close the server command window.
echo ======================================
echo.

pause