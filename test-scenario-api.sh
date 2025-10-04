#!/bin/bash

# Scenario Engine v2 API Test Script
# Tests all three scenario endpoints with sample data

echo "========================================="
echo "Scenario Engine v2 API Test"
echo "========================================="
echo ""

API_BASE="http://localhost:4000/scenarios"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: JDG Quick Calculation
echo -e "${BLUE}Test 1: JDG Quick Calculation${NC}"
echo "Testing POST /scenarios/jdg-quick"
echo ""

curl -s -X POST "$API_BASE/jdg-quick" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-Id: test-jdg-quick-001" \
  -d '{
    "birthYear": 1990,
    "gender": "F",
    "age": 35,
    "monthlyIncome": 6000,
    "isRyczalt": true
  }' | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"✓ Retirement Age: {data['scenario']['retirementAge']}\")
print(f\"✓ Retirement Year: {data['scenario']['retirementYear']}\")
print(f\"✓ Contribution Base: {data['assumptions']['contributionBase']} PLN\")
print(f\"✓ Trajectory Years: {len(data['capitalTrajectory'])}\")
print(f\"✓ Start Work Year: {data['assumptions']['startWorkYear']}\")
"

echo ""
echo "----------------------------------------"
echo ""

# Test 2: Compose Career
echo -e "${BLUE}Test 2: Compose Career (Multi-period)${NC}"
echo "Testing POST /scenarios/compose"
echo ""

curl -s -X POST "$API_BASE/compose" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-Id: test-compose-001" \
  -d '{
    "birthYear": 1988,
    "gender": "M",
    "careerPeriods": [
      {
        "contractType": "jdg",
        "yearsOfWork": 8,
        "monthlyIncome": 5500
      },
      {
        "contractType": "uop",
        "yearsOfWork": 12,
        "monthlyIncome": 7500
      },
      {
        "contractType": "jdg_ryczalt",
        "yearsOfWork": 5,
        "monthlyIncome": 6000
      }
    ],
    "retirementAge": 65
  }' | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"✓ Total Work Years: {data['scenario']['totalWorkYears']}\")
print(f\"✓ Retirement Year: {data['scenario']['retirementYear']}\")
print(f\"✓ Number of Periods: {len(data['periodBreakdown'])}\")
print(f\"✓ Quarter Used: {data['finalization']['quarterUsed']}\")
print('')
print('Period Breakdown:')
for i, period in enumerate(data['periodBreakdown'], 1):
    print(f\"  {i}. {period['contractType']}: {period['years']} years, {period['avgIncome']} PLN/month\")
"

echo ""
echo "----------------------------------------"
echo ""

# Test 3: UoP vs JDG Comparison
echo -e "${BLUE}Test 3: Scenario Comparison (UoP vs JDG)${NC}"
echo "Testing POST /scenarios/compare"
echo ""

curl -s -X POST "$API_BASE/compare" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-Id: test-compare-001" \
  -d '{
    "baseScenario": {
      "birthYear": 1987,
      "gender": "M",
      "age": 38,
      "monthlyIncome": 7000,
      "isRyczalt": false
    },
    "comparisonType": "uop_vs_jdg"
  }' | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"✓ Base Label: {data['base']['label']}\")
print(f\"✓ Comparison Label: {data['comparison']['label']}\")
print(f\"✓ Difference: {data['difference']['percentage']:.1f}%\")
print(f\"✓ Recommendation: {data['recommendation']}\")
"

echo ""
echo "----------------------------------------"
echo ""

# Test 4: Higher ZUS Comparison
echo -e "${BLUE}Test 4: Higher ZUS Comparison${NC}"
echo "Testing POST /scenarios/compare (higher_zus)"
echo ""

curl -s -X POST "$API_BASE/compare" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-Id: test-compare-002" \
  -d '{
    "baseScenario": {
      "birthYear": 1985,
      "gender": "F",
      "age": 40,
      "monthlyIncome": 8000,
      "isRyczalt": false
    },
    "comparisonType": "higher_zus",
    "comparisonParams": {
      "zusMultiplier": 1.5
    }
  }' | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"✓ Base Label: {data['base']['label']}\")
print(f\"✓ Comparison Label: {data['comparison']['label']}\")
print(f\"✓ Difference: {data['difference']['percentage']:.1f}%\")
print(f\"✓ Recommendation: {data['recommendation']}\")
"

echo ""
echo "----------------------------------------"
echo ""

# Test 5: Validation Error
echo -e "${BLUE}Test 5: Validation Error Handling${NC}"
echo "Testing with invalid data"
echo ""

curl -s -X POST "$API_BASE/jdg-quick" \
  -H "Content-Type: application/json" \
  -d '{
    "birthYear": 1800,
    "gender": "X",
    "age": 200,
    "monthlyIncome": -1000,
    "isRyczalt": "maybe"
  }' | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"✓ Error Code: {data['code']}\")
print(f\"✓ Message: {data['message']}\")
print(f\"✓ Number of Issues: {len(data['details']['issues'])}\")
print(f\"✓ Hint: {data.get('hint', 'N/A')}\")
"

echo ""
echo "========================================="
echo -e "${GREEN}All Tests Completed!${NC}"
echo "========================================="
