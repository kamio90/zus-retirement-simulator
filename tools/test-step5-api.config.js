#!/usr/bin/env node
/**
 * Test Script - Verify No-Contribution Period Support
 * 
 * This script demonstrates the new "okres bez składki" (no-contribution period) feature.
 * It can be run against a live API server or used as documentation.
 */

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Test case matching the issue example
const testCase = {
  birthYear: 2000, // Born in 2000, age 25 in 2025
  gender: 'M',
  careerPeriods: [
    {
      contractType: 'uop',
      yearsOfWork: 5,
      monthlyIncome: 5000,
    },
  ],
  retirementAge: 65,
  claimMonth: 6, // June (Q2)
};

// Test case with no-contribution period
const testCaseWithNoContribution = {
  birthYear: 1990,
  gender: 'M',
  careerPeriods: [
    {
      contractType: 'uop',
      yearsOfWork: 10,
      monthlyIncome: 5000,
    },
    {
      contractType: 'no_contribution', // NEW FEATURE!
      yearsOfWork: 2,
      monthlyIncome: 0,
    },
    {
      contractType: 'jdg',
      yearsOfWork: 15,
      monthlyIncome: 8000,
    },
  ],
  retirementAge: 65,
  claimMonth: 6,
};

// Test case with early retirement
const testCaseEarlyRetirement = {
  birthYear: 1990,
  gender: 'M',
  careerPeriods: [
    {
      contractType: 'uop',
      yearsOfWork: 20,
      monthlyIncome: 6000,
    },
  ],
  retirementAge: 60, // Early retirement (-5 years)
  claimMonth: 6,
};

// Test case with delayed retirement
const testCaseDelayedRetirement = {
  birthYear: 1990,
  gender: 'M',
  careerPeriods: [
    {
      contractType: 'uop',
      yearsOfWork: 20,
      monthlyIncome: 6000,
    },
  ],
  retirementAge: 65,
  claimMonth: 18, // 12 months delay (June + 12 = June next year, capped at 12)
};

async function testScenario(name, request) {
  console.log(`\n📊 Testing: ${name}`);
  console.log('Request:', JSON.stringify(request, null, 2));

  try {
    const response = await fetch(`${API_URL}/scenarios/compose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error:', error);
      return null;
    }

    const result = await response.json();
    console.log('✅ Result:');
    console.log(`  - Monthly Pension (nominal): ${result.monthlyPensionNominal.toFixed(2)} PLN`);
    console.log(
      `  - Monthly Pension (real/today): ${result.monthlyPensionRealToday.toFixed(2)} PLN`
    );
    console.log(`  - Replacement Rate: ${(result.replacementRate * 100).toFixed(1)}%`);
    console.log(
      `  - Retirement: ${result.scenario.retirementYear} ${result.finalization.quarterUsed}`
    );
    console.log(`  - Total Work Years: ${result.scenario.totalWorkYears}`);
    console.log('  - Period Breakdown:');
    result.periodBreakdown.forEach((period, i) => {
      console.log(
        `    ${i + 1}. ${period.contractType}: ${period.years} years @ ${period.avgIncome} PLN/mo → ${period.totalContributions.toFixed(2)} PLN contributions`
      );
    });

    return result;
  } catch (error) {
    console.error('❌ Failed:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🧪 ZUS Retirement Simulator - No-Contribution Period Tests');
  console.log('='.repeat(60));

  // Test 1: Basic scenario (from issue)
  await testScenario('Basic Scenario (Issue Example)', testCase);

  // Test 2: With no-contribution period
  await testScenario('With No-Contribution Period (NEW!)', testCaseWithNoContribution);

  // Test 3: Early retirement
  await testScenario('Early Retirement (-5 years)', testCaseEarlyRetirement);

  // Test 4: Delayed retirement
  await testScenario('Delayed Retirement (+12 months)', testCaseDelayedRetirement);

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!');
  console.log('\nNote: To run this script against a live server:');
  console.log('  API_URL=http://localhost:3000/api node test-step5-fix.js');
}

// Run if executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

// Export for use as module
module.exports = { testScenario, testCase, testCaseWithNoContribution };
