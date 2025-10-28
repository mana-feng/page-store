#!/bin/bash

# ================================================================
# Stop Servers Script - Unix/Linux/MacOS/Git Bash Version
# Automatically finds and kills processes using ports 5173, 5174, and 3001
# ================================================================

echo ""
echo "===================================="
echo "  Stop Newsworthy Editor Servers"
echo "===================================="
echo ""

# Colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local service_name=$2
    
    echo -e "${BLUE}Checking port ${port} (${service_name})...${NC}"
    
    # Check if running on Windows Git Bash
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows (Git Bash) approach
        pids=$(netstat -ano | grep ":${port}" | grep "LISTENING" | awk '{print $5}' | sort -u)
        
        if [ -z "$pids" ]; then
            echo -e "  ${GREEN}> Port ${port} is already free${NC}"
        else
            for pid in $pids; do
                if [ "$pid" != "0" ]; then
                    echo -e "  ${YELLOW}> Found process PID: ${pid}${NC}"
                    taskkill //PID $pid //F > /dev/null 2>&1
                    if [ $? -eq 0 ]; then
                        echo -e "  ${GREEN}> Successfully killed PID: ${pid}${NC}"
                    else
                        echo -e "  ${RED}> Failed to kill PID: ${pid} (may already be terminated)${NC}"
                    fi
                fi
            done
        fi
    else
        # Unix/Linux/MacOS approach
        if command -v lsof &> /dev/null; then
            # Use lsof if available (MacOS, most Linux)
            pids=$(lsof -ti :${port} 2>/dev/null)
        elif command -v fuser &> /dev/null; then
            # Use fuser if lsof not available (some Linux)
            pids=$(fuser ${port}/tcp 2>/dev/null | awk '{print $1}')
        else
            # Fallback to netstat
            pids=$(netstat -tulpn 2>/dev/null | grep ":${port}" | awk '{print $7}' | cut -d'/' -f1)
        fi
        
        if [ -z "$pids" ]; then
            echo -e "  ${GREEN}> Port ${port} is already free${NC}"
        else
            for pid in $pids; do
                if [ -n "$pid" ] && [ "$pid" != "-" ]; then
                    echo -e "  ${YELLOW}> Found process PID: ${pid}${NC}"
                    kill -9 $pid 2>/dev/null
                    if [ $? -eq 0 ]; then
                        echo -e "  ${GREEN}> Successfully killed PID: ${pid}${NC}"
                    else
                        echo -e "  ${RED}> Failed to kill PID: ${pid} (may require sudo)${NC}"
                    fi
                fi
            done
        fi
    fi
    
    echo -e "  ${GREEN}> Port ${port} cleared${NC}"
    echo ""
}

# Kill processes on each port
echo "[1/3] Frontend Vite Dev Server"
kill_port 5173 "Frontend Vite Dev Server"

echo "[2/3] Frontend HMR"
kill_port 5174 "Frontend HMR"

echo "[3/3] Backend API Server"
kill_port 3001 "Backend API Server"

echo "===================================="
echo -e "${GREEN}All servers stopped successfully!${NC}"
echo "===================================="
echo ""
echo "You can now start fresh servers with:"
echo "  ./start-servers.sh   (Linux/Mac/Git Bash)"
echo "  start-servers.bat    (Windows)"
echo ""

