#!/bin/bash

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Newsworthy Editor - Quick Start${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js not found${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "[OK] Node.js found"
echo ""

# Check project structure
if [ ! -f "Newsworthy Editor/backend/package.json" ]; then
    echo -e "${RED}[ERROR] Backend not found${NC}"
    exit 1
fi

if [ ! -f "Newsworthy Editor/package.json" ]; then
    echo -e "${RED}[ERROR] Frontend not found${NC}"
    exit 1
fi

# Install backend dependencies
if [ ! -d "Newsworthy Editor/backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd "Newsworthy Editor/backend"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] Backend install failed${NC}"
        exit 1
    fi
    cd ../..
    echo ""
fi

# Install frontend dependencies
if [ ! -d "Newsworthy Editor/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd "Newsworthy Editor"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] Frontend install failed${NC}"
        exit 1
    fi
    cd ..
    echo ""
fi

# Create .env if needed
if [ ! -f "Newsworthy Editor/backend/.env" ]; then
    if [ -f "Newsworthy Editor/backend/env.example" ]; then
        echo "Creating .env file..."
        cp "Newsworthy Editor/backend/env.example" "Newsworthy Editor/backend/.env"
    fi
fi

# Start backend
echo "Starting backend..."
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/Newsworthy Editor/backend"
FRONTEND_DIR="$SCRIPT_DIR/Newsworthy Editor"

if [[ "$OSTYPE" == "darwin"* ]]; then
    osascript -e "tell application \"Terminal\" to do script \"cd '$BACKEND_DIR' && node server.js\"" > /dev/null 2>&1 &
elif command -v gnome-terminal &> /dev/null; then
    gnome-terminal --title="Backend Server" -- bash -c "cd '$BACKEND_DIR' && node server.js; exec bash" > /dev/null 2>&1 &
elif command -v xterm &> /dev/null; then
    xterm -T "Backend Server" -e "cd '$BACKEND_DIR' && node server.js" > /dev/null 2>&1 &
else
    cd "$BACKEND_DIR"
    node server.js > backend.log 2>&1 &
    cd "$SCRIPT_DIR"
fi

# Wait for backend
sleep 3

# Start frontend
echo "Starting frontend..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    osascript -e "tell application \"Terminal\" to do script \"cd '$FRONTEND_DIR' && npm run dev\"" > /dev/null 2>&1 &
elif command -v gnome-terminal &> /dev/null; then
    gnome-terminal --title="Frontend Server" -- bash -c "cd '$FRONTEND_DIR' && npm run dev; exec bash" > /dev/null 2>&1 &
elif command -v xterm &> /dev/null; then
    xterm -T "Frontend Server" -e "cd '$FRONTEND_DIR' && npm run dev" > /dev/null 2>&1 &
else
    cd "$FRONTEND_DIR"
    npm run dev > frontend.log 2>&1 &
    cd "$SCRIPT_DIR"
fi

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Servers Started!${NC}"
echo -e "${CYAN}========================================${NC}"
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo ""
sleep 5

if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:5173
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
fi
