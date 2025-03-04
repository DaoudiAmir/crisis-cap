#!/usr/bin/env node

/**
 * Test Runner Script
 * 
 * This script runs Jest tests with various options and generates reports.
 * Usage:
 *   node scripts/run-tests.js [options]
 * 
 * Options:
 *   --unit       Run only unit tests
 *   --integration Run only integration tests
 *   --coverage   Generate coverage report
 *   --watch      Run tests in watch mode
 *   --verbose    Run with verbose output
 *   --ci         Run in CI mode
 */

const { spawn } = require('child_process');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  unit: args.includes('--unit'),
  integration: args.includes('--integration'),
  coverage: args.includes('--coverage'),
  watch: args.includes('--watch'),
  verbose: args.includes('--verbose'),
  ci: args.includes('--ci'),
};

// Build Jest command
let jestCommand = 'jest';
const jestArgs = [];

// Test pattern based on options
if (options.unit && !options.integration) {
  jestArgs.push('--testPathPattern=.*\\.test\\.ts$');
  jestArgs.push('--testPathIgnorePatterns=integration');
} else if (options.integration && !options.unit) {
  jestArgs.push('--testPathPattern=.*\\.integration\\.test\\.ts$');
} 

// Add other options
if (options.coverage) {
  jestArgs.push('--coverage');
}

if (options.watch) {
  jestArgs.push('--watch');
}

if (options.verbose) {
  jestArgs.push('--verbose');
}

if (options.ci) {
  jestArgs.push('--ci');
  jestArgs.push('--runInBand');
}

// Print command being executed
console.log(`Running: ${jestCommand} ${jestArgs.join(' ')}`);

// Execute Jest
const jest = spawn('npx', [jestCommand, ...jestArgs], {
  stdio: 'inherit',
  shell: true,
});

// Handle process exit
jest.on('close', (code) => {
  process.exit(code);
});
