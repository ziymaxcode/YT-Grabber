@echo off
echo Starting YT Grabber Pro...

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed! Please install Python 3.8+ and add it to PATH.
    pause
    exit /b
)

:: Check Node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed! Please install Node.js 18+ and add it to PATH.
    pause
    exit /b
)

:: Setup Backend
echo Setting up backend...
cd backend
if not exist "venv" (
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
start "YT Grabber Pro Backend" cmd /c "uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
cd ..

:: Setup Frontend
echo Setting up frontend...
if not exist "node_modules" (
    npm install
)
start "YT Grabber Pro Frontend" cmd /c "npm run dev"

:: Open Browser
timeout /t 3
start http://localhost:3000
