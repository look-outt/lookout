#!/bin/bash

# LookOut - Frontend & Backend Launcher Script
echo "🚀 LookOut Launcher"
echo "===================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FRONTEND_DIR="$SCRIPT_DIR/front_end/lookout-pg1"
BACKEND_DIR="$SCRIPT_DIR/front_end/lookout-pg1/backend"

echo -e "${BLUE}📁 Script directory: $SCRIPT_DIR${NC}"
echo -e "${BLUE}🎨 Frontend directory: $FRONTEND_DIR${NC}"
echo -e "${BLUE}⚙️  Backend directory: $BACKEND_DIR${NC}"
echo ""

# Function to check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
}

# Function to check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"
}

# Function to install frontend dependencies
install_frontend_deps() {
    echo -e "${YELLOW}📦 Checking frontend dependencies...${NC}"
    cd "$FRONTEND_DIR"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📥 Installing frontend dependencies...${NC}"
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
    else
        echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
    fi
}

# Function to install backend dependencies
install_backend_deps() {
    echo -e "${YELLOW}📦 Checking backend dependencies...${NC}"
    cd "$BACKEND_DIR"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📥 Installing backend dependencies...${NC}"
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Failed to install backend dependencies${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ Backend dependencies installed${NC}"
    else
        echo -e "${GREEN}✅ Backend dependencies already installed${NC}"
    fi
}

# Function to start the application
start_app() {
    echo ""
    echo -e "${BLUE}🎯 Starting LookOut Application...${NC}"
    echo -e "${YELLOW}📝 Frontend will run on: http://localhost:3000${NC}"
    echo -e "${YELLOW}🔧 Backend will run on: http://localhost:3001${NC}"
    echo ""
    echo -e "${GREEN}Press Ctrl+C to stop both services${NC}"
    echo ""
    
    cd "$FRONTEND_DIR"
    npm run start
}

# Main execution
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
check_node
check_npm

echo ""
echo -e "${BLUE}📦 Setting up dependencies...${NC}"
install_frontend_deps
install_backend_deps

echo ""
start_app