#!/bin/bash

# Test script to verify all pages load without errors
# This script starts the dev server and checks key routes

PORT=3000
BASE_URL="http://localhost:$PORT"

echo "Starting Next.js dev server..."
npm run dev > /dev/null 2>&1 &
DEV_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 5

# Function to test a route
test_route() {
  local route=$1
  local name=$2
  echo -n "Testing $name ($route)... "
  
  response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$route" 2>/dev/null)
  
  if [ "$response" = "200" ]; then
    echo "✓ PASS"
    return 0
  else
    echo "✗ FAIL (HTTP $response)"
    return 1
  fi
}

# Test all routes
echo ""
echo "=== Testing Routes ==="
echo ""

FAILED=0

# Auth pages
test_route "/login" "Login" || ((FAILED++))
test_route "/signup" "Signup" || ((FAILED++))

# Main app pages
test_route "/dashboard" "Dashboard" || ((FAILED++))
test_route "/leads" "Leads List" || ((FAILED++))
test_route "/leads/new" "New Lead" || ((FAILED++))
test_route "/leads/1" "Lead Detail" || ((FAILED++))
test_route "/quotations" "Quotations List" || ((FAILED++))
test_route "/quotations/new" "New Quotation" || ((FAILED++))
test_route "/quotations/1" "Quotation Detail" || ((FAILED++))
test_route "/quotations/templates" "Quotation Templates" || ((FAILED++))
test_route "/clients" "Clients List" || ((FAILED++))
test_route "/clients/c1" "Client Detail" || ((FAILED++))
test_route "/invoices" "Invoices List" || ((FAILED++))
test_route "/invoices/inv1" "Invoice Detail" || ((FAILED++))
test_route "/calendar" "Calendar" || ((FAILED++))
test_route "/follow-ups" "Follow-ups" || ((FAILED++))
test_route "/lead-discovery" "Lead Discovery" || ((FAILED++))
test_route "/reports" "Reports" || ((FAILED++))
test_route "/settings" "Settings Hub" || ((FAILED++))
test_route "/settings/general" "General Settings" || ((FAILED++))
test_route "/settings/company" "Company Settings" || ((FAILED++))
test_route "/settings/packages" "Packages Settings" || ((FAILED++))

echo ""
echo "=== Test Summary ==="
echo ""

if [ $FAILED -eq 0 ]; then
  echo "✓ All tests passed!"
else
  echo "✗ $FAILED test(s) failed"
fi

# Cleanup
echo ""
echo "Stopping dev server..."
kill $DEV_PID 2>/dev/null
wait $DEV_PID 2>/dev/null

exit $FAILED
