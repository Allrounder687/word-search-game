@echo off
title Create Desktop Shortcut
color 0B

echo Creating desktop shortcut for Word Search Game...

:: Get the current directory
set "CURRENT_DIR=%~dp0"
set "SHORTCUT_NAME=Word Search Game.lnk"
set "DESKTOP_PATH=%USERPROFILE%\Desktop"

:: Create the shortcut using PowerShell
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP_PATH%\%SHORTCUT_NAME%'); $Shortcut.TargetPath = '%CURRENT_DIR%play-word-search.bat'; $Shortcut.WorkingDirectory = '%CURRENT_DIR%'; $Shortcut.IconLocation = '%CURRENT_DIR%public\favicon.ico,0'; $Shortcut.Save()"

if %ERRORLEVEL% equ 0 (
    color 0A
    echo.
    echo Desktop shortcut created successfully!
    echo You can now launch the Word Search Game from your desktop.
) else (
    color 0C
    echo.
    echo Failed to create desktop shortcut.
    echo You can still run the game by double-clicking on play-word-search.bat
)

echo.
pause