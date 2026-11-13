@echo off
setlocal
call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\Common7\Tools\VsDevCmd.bat" -arch=x64 -no_logo
echo ===WHERE-CL===
where cl 2>&1
echo ===CL-BANNER===
cl 2>&1
echo ===WHERE-CMAKE===
where cmake 2>&1
echo ===CMAKE-VERSION===
cmake --version 2>&1
echo ===WHERE-GIT===
where git 2>&1
echo ===GIT-VERSION===
git --version 2>&1
echo ===WHERE-FFMPEG===
where ffmpeg 2>&1
echo ===WHERE-VSWHERE===
where vswhere 2>&1
