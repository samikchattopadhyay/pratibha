@echo off
REM Windows Task Scheduler Setup for Pratibha Database Backups
REM Run this file as Administrator

echo.
echo ============================================
echo Pratibha Database Backup Scheduler
echo ============================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo.
    echo Please:
    echo 1. Right-click on this batch file
    echo 2. Select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo Setting up daily backup task at 10 PM...
echo.

REM Define variables
set TASK_NAME=Pratibha Database Backup Daily
set SCRIPT_PATH=C:\Development\pratibha\scripts\backup-db.ps1
set TRIGGER_TIME=22:00:00

REM Create the scheduled task
schtasks /create ^
    /tn "%TASK_NAME%" ^
    /tr "powershell.exe -NoProfile -ExecutionPolicy Bypass -File \"%SCRIPT_PATH%\"" ^
    /sc daily ^
    /st %TRIGGER_TIME% ^
    /f ^
    /ru %USERNAME%

if %errorLevel% equ 0 (
    echo.
    echo ✅ Task created successfully!
    echo.
    echo 📋 Task Details:
    echo    Name: %TASK_NAME%
    echo    Time: 10:00 PM (22:00) every day
    echo    Script: %SCRIPT_PATH%
    echo.
    echo 📌 To view/manage this task:
    echo    1. Press Win+R
    echo    2. Type: taskschd.msc
    echo    3. Click OK
    echo    4. Search for: "%TASK_NAME%"
    echo.
    echo 📌 To test the backup now:
    echo    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_PATH%"
    echo.
    echo 📌 To view backup logs:
    echo    C:\Development\pratibha\backups\backup.log
    echo.
) else (
    echo.
    echo ❌ Failed to create task
    echo    Error Code: %errorLevel%
    echo.
    echo Try:
    echo 1. Open Task Scheduler as Administrator
    echo 2. Manually create a task named "%TASK_NAME%"
    echo 3. Set trigger to: Daily at 10:00 PM
    echo 4. Set action to: Run powershell.exe
    echo 5. Set arguments to: -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_PATH%"
    echo.
)

pause
