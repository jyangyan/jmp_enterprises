@echo off
title JMP Enterprises - Stopping Servers...
echo ========================================================
echo        STOPPING JMP ENTERPRISES APP SERVERS
echo ========================================================
echo.

echo Stopping backend processes on port 5184...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5184" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a 2>nul
)

echo Stopping frontend processes on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a 2>nul
)

echo.
echo ========================================================
echo  All JMP Enterprises servers have been stopped.
echo ========================================================
pause
