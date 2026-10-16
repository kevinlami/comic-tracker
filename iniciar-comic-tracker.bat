@echo off
chcp 65001 >nul
title Comic Tracker - Iniciar
set "SELF=%~f0"

rem === Copia NAO elevada (vinda do atalho do desktop) ===
net session >nul 2>&1
if errorlevel 1 (
    REM Sobe a copia elevada em segundo plano, com janela OCULTA
    REM (evita o segundo console visivel apos o UAC).
    powershell -NoProfile -Command "Start-Process -FilePath '%SELF%' -ArgumentList 'run' -Verb RunAs -WindowStyle Hidden"
    REM Aguarda os servidores ficarem prontos (max ~45s) e entao abre
    REM o navegador a partir DESTE processo nao elevado (Chrome normal,
    REM mesma instancia/aba - nao abre uma segunda janela do browser).
    powershell -NoProfile -Command "$d=(Get-Date).AddSeconds(45); do { if (Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue) { exit 0 }; Start-Sleep -Seconds 2 } while ((Get-Date) -lt $d); exit 1"
    if errorlevel 1 (
        echo Servidores nao responderam em 45s. Verifique a janela "Comic Tracker" aberta e os erros nela.
        pause
        exit /b
    )
    start "" "http://comic.local:3001"
    exit /b
)

rem === Copia ELEVADA (executa em segundo plano, janela oculta) ===
cd /d "%~dp0"
echo [1/3] Hostname amigavel: comic.local
findstr /i /c:"comic.local" "%WINDIR%\System32\drivers\etc\hosts" >nul 2>&1
if errorlevel 1 echo 127.0.0.1 comic.local>> "%WINDIR%\System32\drivers\etc\hosts"
if errorlevel 1 echo     Registro adicionado ao arquivo hosts.
ipconfig /flushdns >nul 2>&1
echo [2/3] Banco PostgreSQL
sc query postgresql-x64-18 | findstr /i /c:"RUNNING" >nul 2>&1
if errorlevel 1 net start postgresql-x64-18
echo [3/3] Servidores (API e Web) em uma unica janela...
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }" >nul 2>&1
if errorlevel 1 (set "API_BUSY=1") else (set "API_BUSY=0")
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }" >nul 2>&1
if errorlevel 1 (set "WEB_BUSY=1") else (set "WEB_BUSY=0")
if "%API_BUSY%"=="0" if "%WEB_BUSY%"=="0" (
    start "Comic Tracker" cmd /k "title Comic Tracker && pnpm run dev"
) else (
    echo     API/Web ja estao rodando.
)

rem Se foi chamada com o argumento 'run' (filho do UAC), apenas termina.
rem Caso contrario (executada ja como admin), aguarda prontidao e abre o navegador.
if /i "%~1"=="run" exit /b
powershell -NoProfile -Command "$d=(Get-Date).AddSeconds(45); do { if (Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue) { exit 0 }; Start-Sleep -Seconds 2 } while ((Get-Date) -lt $d); exit 1"
if not errorlevel 1 start "" "http://comic.local:3001"
exit /b
