@echo off
setlocal
call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\Common7\Tools\VsDevCmd.bat" -arch=x64 -no_logo
cd /d "D:\TechVault\experiments\p1-c"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "D:\TechVault\experiments\p1-c\Run-P1C-Desktop.ps1"
