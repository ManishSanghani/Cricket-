@echo off
echo ========================================
echo Cricket Statistics Management System
echo ========================================
echo.

echo Step 1: Starting C++ Backend Server...
echo.
start "Cricket API Server" cmd /k "compile_and_run.bat"

echo.
echo Step 2: Waiting for server to start...
timeout /t 3 /nobreak > nul

echo.
echo Step 3: Opening Frontend...
echo.
start "" "index.html"

echo.
echo Step 4: Opening API Test Page...
echo.
start "" "test_api.html"

echo.
echo ========================================
echo System Started Successfully!
echo ========================================
echo.
echo Backend: http://localhost:8080
echo Frontend: index.html (opened in browser)
echo API Test: test_api.html (opened in browser)
echo.
echo Press any key to exit this launcher...
pause > nul 