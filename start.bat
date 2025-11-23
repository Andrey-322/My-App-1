@echo off
echo Запуск бэкенда...
start "Backend" cmd /k "cd /d %~dp0express-backend && npm start"
timeout /t 3 /nobreak >nul
echo Запуск фронтенда...
start "Frontend" cmd /k "cd /d %~dp0my-app && npm run dev"
echo.
echo Оба сервера запущены!
echo Бэкенд: http://localhost:8000
echo Фронтенд: http://localhost:5173
pause

