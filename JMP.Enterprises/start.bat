@echo off
title JMP Enterprises - Starting Servers...
echo ========================================================
echo        STARTING JMP ENTERPRISES APP SERVERS
echo ========================================================
echo.

echo Starting ASP.NET Core Backend API (Port 5184)...
start "JMP Enterprises Backend API" cmd /k "cd /d "%~dp0backend\JMP.Enterprises.Api" && dotnet run --launch-profile http"

timeout /t 3 >nul

echo Starting React + Vite Frontend (Port 5173)...
start "JMP Enterprises Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 >nul

echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo ========================================================
echo  Both servers have been launched!
echo  - Frontend: http://localhost:5173
echo  - Backend:  http://localhost:5184
echo ========================================================
pause
