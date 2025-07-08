@echo off
setlocal enabledelayedexpansion

echo Checking build directory...
if not exist "build" (
    echo Creating build directory...
    mkdir build
)

echo Entering build directory...
cd build

echo Configuring CMake project...
cmake -G "MinGW Makefiles" ..
if !errorlevel! neq 0 (
    echo CMake configuration failed!
    pause
    exit /b !errorlevel!
)

echo Building project...
mingw32-make
if !errorlevel! neq 0 (
    echo Build failed!
    pause
    exit /b !errorlevel!
)

echo Build completed successfully!
echo You can now run the project by executing terrain.exe in the build directory
pause
