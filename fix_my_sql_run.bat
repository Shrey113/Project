@echo off
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Requesting administrative privileges...
    powershell -Command "Start-Process cmd -ArgumentList '/c %~s0' -Verb RunAs"
    exit /b
)
echo Starting MySQL Service...
net start MYSQL80
if %errorlevel% equ 0 (
    echo MySQL Service started successfully.
) else (
    echo Failed to start MySQL Service.
)
pause
