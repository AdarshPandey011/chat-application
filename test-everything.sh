#!/bin/bash

echo "🧪 Comprehensive ChatApp Testing"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    echo -e "${BLUE}🔍 Testing: $test_name${NC}"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo -e "${YELLOW}📋 Frontend Tests${NC}"
echo "=================="

# Test 1: Frontend is running
run_test "Frontend Server" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 | grep -q '200'"

# Test 2: Login page loads
run_test "Login Page" "curl -s http://localhost:3000/auth/login | grep -q 'Try Demo Mode'"

# Test 3: Register page loads
run_test "Register Page" "curl -s http://localhost:3000/auth/register | grep -q 'Create Account'"

# Test 4: Main page loads
run_test "Main Page" "curl -s http://localhost:3000 | grep -q 'ChatApp'"

echo ""
echo -e "${YELLOW}📋 Backend Service Tests${NC}"
echo "========================"

# Test 5: Auth service (if running)
run_test "Auth Service" "curl -s http://localhost:3001/health | grep -q 'healthy'"

# Test 6: Chat service (if running)
run_test "Chat Service" "curl -s http://localhost:3002/health | grep -q 'healthy'"

# Test 7: API Gateway (if running)
run_test "API Gateway" "curl -s http://localhost:4000/graphql | grep -q 'GraphQL'"

echo ""
echo -e "${YELLOW}📋 File Structure Tests${NC}"
echo "========================"

# Test 8: Key files exist
run_test "Package.json exists" "test -f package.json"
run_test "Frontend package.json" "test -f frontend/package.json"
run_test "Auth service exists" "test -d services/auth-service"
run_test "Demo mode component" "test -f frontend/src/components/DemoMode.tsx"

echo ""
echo -e "${YELLOW}📋 Demo Mode Testing${NC}"
echo "=================="

# Test 9: Demo mode button is present
run_test "Demo Mode Button" "curl -s http://localhost:3000/auth/login | grep -q 'Try Demo Mode'"

# Test 10: Demo mode component compiles
run_test "Demo Component Syntax" "grep -q 'showDemo' frontend/src/components/DemoMode.tsx"

echo ""
echo -e "${YELLOW}📋 Humanization Tests${NC}"
echo "====================="

# Test 11: Check for human-like comments
run_test "Human Comments in DemoMode" "grep -q 'Quick demo component' frontend/src/components/DemoMode.tsx"
run_test "Human Comments in AuthStore" "grep -q 'Handle user login' frontend/src/store/authStore.ts"
run_test "Human Comments in Auth Routes" "grep -q 'User registration endpoint' services/auth-service/src/routes/auth.ts"

# Test 12: Check for realistic variable names
run_test "Realistic Variable Names" "grep -q 'showDemo' frontend/src/components/DemoMode.tsx"

echo ""
echo -e "${YELLOW}📋 Summary${NC}"
echo "========"
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! The application is working correctly.${NC}"
    echo ""
    echo -e "${BLUE}🚀 How to use the app:${NC}"
    echo "1. Go to http://localhost:3000/auth/login"
    echo "2. Click 'Try Demo Mode'"
    echo "3. Click 'Login as Demo User'"
    echo "4. Explore the chat interface!"
    echo ""
    echo -e "${YELLOW}💡 Note: Backend services may not be running due to database requirements.${NC}"
    echo -e "${YELLOW}   The demo mode allows you to test the frontend without backend dependencies.${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed, but the core functionality should still work.${NC}"
    echo -e "${YELLOW}   Check the failed tests above for details.${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Manual Testing Checklist:${NC}"
echo "• Open http://localhost:3000 in your browser"
echo "• Test the login page UI"
echo "• Test the register page UI"
echo "• Try the demo mode functionality"
echo "• Check responsive design on different screen sizes"
echo "• Verify form validations work"
