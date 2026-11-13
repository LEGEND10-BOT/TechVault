@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Run-P1C-Desktop.ps1" %*
echo.
echo P1-C runner finished. Review the JSON and logs in this folder's results directory.
pause
