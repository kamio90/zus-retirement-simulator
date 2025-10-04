#!/bin/bash
# Integration test for Benchmarks API
# Run this with the API server running on port 4000

set -e

API_URL="${API_URL:-http://localhost:4000}"
FAILED=0

echo "========================================="
echo "Benchmarks API Integration Tests"
echo "Testing endpoint: $API_URL/benchmarks"
echo "========================================="
echo ""

test_endpoint() {
  local name="$1"
  local url="$2"
  local expected_code="${3:-200}"
  
  echo "Test: $name"
  echo "  URL: $url"
  
  response=$(curl -s -w "\n%{http_code}" "$url")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" = "$expected_code" ]; then
    echo "  ✓ HTTP $http_code (expected $expected_code)"
    echo "  Response: $body" | head -c 200
    echo ""
  else
    echo "  ✗ HTTP $http_code (expected $expected_code)"
    echo "  Response: $body"
    FAILED=$((FAILED + 1))
  fi
  echo ""
}

# Test 1: National average (overall)
test_endpoint \
  "National average (overall)" \
  "$API_URL/benchmarks" \
  200

# Test 2: National average (male)
test_endpoint \
  "National average (male)" \
  "$API_URL/benchmarks?gender=M" \
  200

# Test 3: National average (female)
test_endpoint \
  "National average (female)" \
  "$API_URL/benchmarks?gender=F" \
  200

# Test 4: Powiat data
test_endpoint \
  "Powiat data (powiat aleksandrowski)" \
  "$API_URL/benchmarks?powiatTeryt=0401000" \
  200

# Test 5: Powiat + gender
test_endpoint \
  "Powiat data with gender filter" \
  "$API_URL/benchmarks?powiatTeryt=0401000&gender=M" \
  200

# Test 6: Invalid TERYT (too short)
test_endpoint \
  "Invalid TERYT (too short)" \
  "$API_URL/benchmarks?powiatTeryt=123" \
  400

# Test 7: Invalid gender
test_endpoint \
  "Invalid gender value" \
  "$API_URL/benchmarks?gender=X" \
  400

# Test 8: Non-existent powiat (valid format, not found)
test_endpoint \
  "Non-existent powiat (returns only national)" \
  "$API_URL/benchmarks?powiatTeryt=9999999" \
  200

echo "========================================="
if [ $FAILED -eq 0 ]; then
  echo "✓ All tests passed!"
  exit 0
else
  echo "✗ $FAILED test(s) failed"
  exit 1
fi
