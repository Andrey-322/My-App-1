# Скрипт для запуска бэкенда и фронтенда

Write-Host "Запуск бэкенда..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\express-backend'; npm start"

Start-Sleep -Seconds 3

Write-Host "Запуск фронтенда..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\my-app'; npm run dev"

Write-Host "`nОба сервера запущены!" -ForegroundColor Yellow
Write-Host "Бэкенд: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Фронтенд: http://localhost:5173" -ForegroundColor Cyan

