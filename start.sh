#!/bin/bash
echo "Starting YT Grabber Pro..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "Python3 is not installed! Please install Python 3.8+."
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed! Please install Node.js 18+."
    exit 1
fi

# Setup Backend
echo "Setting up backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt

# Start Backend in background
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Setup Frontend
echo "Setting up frontend..."
if [ ! -d "node_modules" ]; then
    npm install
fi

# Start Frontend in background
npm run dev &
FRONTEND_PID=$!

# Open Browser
sleep 3
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
fi

echo "YT Grabber Pro is running!"
echo "Press Ctrl+C to stop."

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
