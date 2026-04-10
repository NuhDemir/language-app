@echo off
echo ======================================
echo   Language Learning App - Starter
echo ======================================
echo.

:: Docker, Backend ve Mobile icin ayri terminal pencereleri acar

echo [1/3] Docker (PostgreSQL + PgBouncer) baslatiliyor...
cd /d %~dp0
docker compose up -d
timeout /t 2 /nobreak > nul

echo [2/3] Backend (NestJS) baslatiliyor...
start "Backend - NestJS" cmd /k "cd /d %~dp0language-learning-core && npm run start:dev"

echo [3/3] Mobile (Expo - LAN Mode) baslatiliyor...
timeout /t 3 /nobreak > nul
start "Mobile - Expo" cmd /k "cd /d %~dp0mobile && npx expo start --lan"

echo.
echo ======================================
echo   Tum servisler baslatildi!
echo   Docker: PostgreSQL + PgBouncer
echo   Backend: http://localhost:3000
echo   Mobile: Expo DevTools (LAN Mode)
echo ======================================
echo.
echo Bu pencereyi kapatabilirsiniz.
pause
