#!/bin/bash

echo "🧪 ChatApp Manual Testing Script"
echo "================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_frontend() {
    echo -e "${YELLOW}Testing Frontend...${NC}"
    if curl -s http://localhost:3000 | grep -q "ChatApp"; then
        echo -e "${GREEN}✅ Frontend is running at http://localhost:3000${NC}"
    else
        echo -e "${RED}❌ Frontend is not responding${NC}"
    fi
}

test_auth_service() {
    echo -e "${YELLOW}Testing Auth Service...${NC}"
    if curl -s http://localhost:3001/health 2>/dev/null | grep -q "OK"; then
        echo -e "${GREEN}✅ Auth Service is running at http://localhost:3001${NC}"
    else
        echo -e "${RED}❌ Auth Service is not running${NC}"
    fi
}

test_chat_service() {
    echo -e "${YELLOW}Testing Chat Service...${NC}"
    if curl -s http://localhost:3002/health 2>/dev/null | grep -q "OK"; then
        echo -e "${GREEN}✅ Chat Service is running at http://localhost:3002${NC}"
    else
        echo -e "${RED}❌ Chat Service is not running${NC}"
    fi
}

test_api_gateway() {
    echo -e "${YELLOW}Testing API Gateway...${NC}"
    if curl -s http://localhost:4000/graphql 2>/dev/null | grep -q "GraphQL"; then
        echo -e "${GREEN}✅ API Gateway is running at http://localhost:4000/graphql${NC}"
    else
        echo -e "${RED}❌ API Gateway is not running${NC}"
    fi
}

# Run tests
echo "Running tests..."
test_frontend
test_auth_service
test_chat_service
test_api_gateway

echo ""
echo "📋 Manual Testing Checklist:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Test login/register pages"
echo "3. Test chat interface"
echo "4. Check responsive design"
echo "5. Test form validations"
echo ""
echo "🚀 To start backend services:"
echo "cd services/auth-service && npm run dev"
echo "cd services/chat-service && npm run dev"
echo "cd services/api-gateway && npm run dev"
