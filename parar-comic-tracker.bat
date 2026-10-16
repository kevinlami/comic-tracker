@echo off
chcp 65001 >nul
title Comic Tracker - Parar
echo ================================================
echo   Comic Tracker - Desligando o projeto
echo ================================================
net session >nul 2>&1
if errorlevel 1 powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
if errorlevel 1 exit /b
echo [1/2] Parando API e Web...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000,3001 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }; Get-Process | Where-Object { $_.ProcessName -eq 'cmd' -and $_.MainWindowTitle -like '*Comic Tracker*' } | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }"
echo     API e Web parados.
echo [2/2] Parando o PostgreSQL...
sc query postgresql-x64-18 | findstr /i /c:"RUNNING" >nul 2>&1
if errorlevel 1 echo     PostgreSQL ja estava parado.
if not errorlevel 1 net stop postgresql-x64-18 >nul 2>&1
echo.
echo ================================================
echo   Projeto desligado. Ate a proxima!
echo ================================================
pause
exit /b
