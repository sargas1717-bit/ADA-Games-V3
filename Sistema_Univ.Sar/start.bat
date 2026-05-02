@echo off
TITLE Motor Modular Adagames - Sistema_Univ.Sar
echo.
echo =====================================================
echo   MOTOR MODULAR ADAGAMES - Sistema_Univ.Sar
echo   Puerto 8080 (Independiente del Adagames original)
echo =====================================================
echo.

cd /d "%~dp0"

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python no encontrado. Instala Python 3.9+.
    pause
    exit /b 1
)

echo [1/3] Verificando dependencias...
pip install fastapi uvicorn python-multipart -q

echo [2/3] Iniciando servidor en puerto 8080...
cd backend
python main.py

pause
