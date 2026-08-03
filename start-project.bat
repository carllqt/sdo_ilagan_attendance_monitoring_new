@echo off
setlocal

set "PROJECT=C:\xampp\htdocs\sdo_ilagan_attendance_monitoring_new"
set "BIOMETRIC=%PROJECT%\Biometric-Config"
set "PHP=C:\xampp\php\php.exe"

timeout /t 10 /nobreak >nul

start "" /min /D "%PROJECT%" "%PHP%" artisan serve --host=0.0.0.0 --port=8000
start "" /min /D "%PROJECT%" "%PHP%" artisan reverb:start --host=0.0.0.0 --port=8080
start "" /min /D "%BIOMETRIC%" python -m uvicorn examples.example:app --host=0.0.0.0 --port=5000 --reload

:waitForLaravel
curl.exe -fsS http://127.0.0.1:8000/ >nul 2>&1

if errorlevel 1 (
    timeout /t 1 /nobreak >nul
    goto waitForLaravel
)

start "" "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" "http://10.10.103.146:8000/attendance"