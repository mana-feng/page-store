#!/bin/bash
# ================================================================
# Newsworthy Editor - Quick Start Script
# For: Linux & macOS
# 
# Prerequisites:
# - Node.js (v16 or higher)
# - npm
#
# Usage:
#   chmod +x start-servers.sh
#   ./start-servers.sh
# ================================================================

# Color codes for output
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}   Newsworthy Editor - Server Startup Script   ${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

# Check if Node.js is installed
echo -e "${YELLOW}[1/4] Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed or not in PATH${NC}"
    echo -e "${RED}Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"
echo ""

# Check if required directories exist
echo -e "${YELLOW}[2/4] Checking project structure...${NC}"
FRONTEND_PATH="Newsworthy Editor"
BACKEND_PATH="Newsworthy Editor/backend"

if [ ! -d "$FRONTEND_PATH" ]; then
    echo -e "${RED}❌ Error: Frontend directory not found: $FRONTEND_PATH${NC}"
    exit 1
fi

if [ ! -d "$BACKEND_PATH" ]; then
    echo -e "${RED}❌ Error: Backend directory not found: $BACKEND_PATH${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Project directories found${NC}"
echo ""

# Check if dependencies are installed
echo -e "${YELLOW}[3/4] Checking dependencies...${NC}"

# Check backend dependencies
if [ ! -d "$BACKEND_PATH/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Backend dependencies not found. Installing...${NC}"
    cd "$BACKEND_PATH" || exit 1
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install backend dependencies${NC}"
        exit 1
    fi
    cd - > /dev/null || exit 1
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Backend dependencies already installed${NC}"
fi

# Check frontend dependencies
if [ ! -d "$FRONTEND_PATH/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend dependencies not found. Installing...${NC}"
    cd "$FRONTEND_PATH" || exit 1
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
        exit 1
    fi
    cd - > /dev/null || exit 1
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
fi

echo ""

# Start servers
echo -e "${YELLOW}[4/4] Starting development servers...${NC}"
echo ""
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}  Starting Backend Server (Port 3001)...${NC}"
echo -e "${CYAN}================================================${NC}"

# Start backend server in background
cd "$BACKEND_PATH" || exit 1
echo -e "${GREEN}🚀 Starting Backend Server...${NC}"
echo -e "${GRAY}📍 Location: $BACKEND_PATH${NC}"
echo -e "${GRAY}🌐 URL: http://localhost:3001${NC}"
echo ""

# Check if we're on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - use 'open' with Terminal
    osascript -e "tell application \"Terminal\" to do script \"cd '$PWD' && npm start\""
else
    # Linux - try common terminal emulators
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "npm start; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "npm start" &
    else
        # Fallback - run in background with log file
        npm start > backend.log 2>&1 &
        BACKEND_PID=$!
        echo -e "${GREEN}✅ Backend server started (PID: $BACKEND_PID)${NC}"
        echo -e "${GRAY}   Log file: backend.log${NC}"
    fi
fi

cd - > /dev/null || exit 1
echo ""

# Wait a moment before starting frontend
sleep 2

echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}  Starting Frontend Server (Port 5173)...${NC}"
echo -e "${CYAN}================================================${NC}"

# Start frontend server
cd "$FRONTEND_PATH" || exit 1
echo -e "${GREEN}🚀 Starting Frontend Server...${NC}"
echo -e "${GRAY}📍 Location: $FRONTEND_PATH${NC}"
echo -e "${GRAY}🌐 URL: http://localhost:5173${NC}"
echo ""

# Start in new terminal or background
if [[ "$OSTYPE" == "darwin"* ]]; then
    osascript -e "tell application \"Terminal\" to do script \"cd '$PWD' && npm run dev\""
else
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "npm run dev; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "npm run dev" &
    else
        npm run dev > ../frontend.log 2>&1 &
        FRONTEND_PID=$!
        echo -e "${GREEN}✅ Frontend server started (PID: $FRONTEND_PID)${NC}"
        echo -e "${GRAY}   Log file: frontend.log${NC}"
    fi
fi

cd - > /dev/null || exit 1
echo ""

# Wait for servers to start
echo -e "${YELLOW}⏳ Waiting for servers to start...${NC}"
sleep 5

# Check if servers are running
echo ""
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}  Server Status Check${NC}"
echo -e "${CYAN}================================================${NC}"

# Check backend
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend server is running at http://localhost:3001${NC}"
else
    echo -e "${YELLOW}⚠️  Backend server may still be starting...${NC}"
    echo -e "${GRAY}   Check the backend server terminal for details${NC}"
fi

# Check frontend
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend server is running at http://localhost:5173${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend server may still be starting...${NC}"
    echo -e "${GRAY}   Check the frontend server terminal for details${NC}"
fi

echo ""
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}  🎉 Setup Complete!${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "${WHITE}   1. Open your browser and navigate to:${NC}"
echo -e "${CYAN}      👉 http://localhost:5173${NC}"
echo ""
echo -e "${WHITE}   2. Configure your GitHub settings in the app:${NC}"
echo -e "${WHITE}      • Click the ⚙️ Settings button in the sidebar${NC}"
echo -e "${WHITE}      • Enter your GitHub token, owner, repo, and branch${NC}"
echo -e "${WHITE}      • Save the configuration${NC}"
echo ""
echo -e "${YELLOW}📡 Server URLs:${NC}"
echo -e "${WHITE}   • Frontend: http://localhost:5173${NC}"
echo -e "${WHITE}   • Backend:  http://localhost:3001${NC}"
echo -e "${WHITE}   • API Docs: http://localhost:3001/api${NC}"
echo ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo -e "${WHITE}   • Both servers are running in separate terminals${NC}"
echo -e "${WHITE}   • To stop the servers, press Ctrl+C in each terminal${NC}"
if [ -n "$BACKEND_PID" ] || [ -n "$FRONTEND_PID" ]; then
    echo -e "${WHITE}   • Or use: kill $BACKEND_PID $FRONTEND_PID${NC}"
fi
echo ""
echo -e "${CYAN}================================================${NC}"
echo ""

