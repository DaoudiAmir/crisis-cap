# Crisis-Cap Backend Testing Guide

This guide provides comprehensive instructions for testing the Crisis-Cap backend API. It covers unit testing, integration testing, and manual API testing using tools like Postman.

## Table of Contents

1. [Testing Setup](#testing-setup)
2. [Running Tests](#running-tests)
3. [Writing New Tests](#writing-new-tests)
4. [Test Coverage](#test-coverage)
5. [Manual API Testing](#manual-api-testing)
6. [Common Testing Scenarios](#common-testing-scenarios)
7. [Troubleshooting](#troubleshooting)

## Testing Setup

The Crisis-Cap backend uses Jest and Supertest for automated testing. The testing environment is configured to use an in-memory MongoDB instance to avoid affecting your development or production databases.

### Prerequisites

- Node.js v18+
- npm or yarn package manager
- MongoDB (for local development)

### Environment Setup

Tests automatically use a testing environment configuration. You don't need to modify your `.env` file for testing, as the test setup creates an isolated environment.

## Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch

# Run tests in CI mode
npm run test:ci
```

### Using the Test Runner Script

We've created a custom test runner script that provides more options:

```bash
# Run all tests
node scripts/run-tests.js

# Run only unit tests
node scripts/run-tests.js --unit

# Run only integration tests
node scripts/run-tests.js --integration

# Run tests with coverage
node scripts/run-tests.js --coverage

# Run tests in watch mode
node scripts/run-tests.js --watch

# Run tests with verbose output
node scripts/run-tests.js --verbose

# Combine options
node scripts/run-tests.js --unit --coverage --verbose
```

## Writing New Tests

### Test File Structure

Tests are organized in the `src/__tests__` directory, mirroring the structure of the source code:

```
src/
├── __tests__/
│   ├── controllers/      # Controller tests
│   ├── services/         # Service tests
│   ├── models/           # Model tests
│   └── middleware/       # Middleware tests
```

### Test Naming Conventions

- **Unit tests**: `*.test.ts`
- **Integration tests**: `*.integration.test.ts`

### Test Template

Here's a basic template for a controller test:

```typescript
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import YourModel from '../../models/YourModel';

describe('Your Controller', () => {
  let token: string;
  
  beforeEach(async () => {
    // Setup: Create test user and get authentication token
    const { token: userToken } = await global.createTestUser('role');
    token = userToken;
  });

  describe('GET /api/your-endpoint', () => {
    it('should return expected data', async () => {
      // Setup test data
      await YourModel.create({
        // Test data properties
      });

      // Execute request
      const response = await request(app)
        .get('/api/your-endpoint')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Assert response
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
      // Add more specific assertions
    });
  });
});
```

### Test Helpers

The test environment provides several global helpers:

- `global.signToken(userId, role)`: Generate a JWT token for testing
- `global.createTestUser(role)`: Create a test user and return the user object and token

## Test Coverage

We aim for at least 80% test coverage across the codebase. Coverage reports are generated when running:

```bash
npm run test:coverage
```

The coverage report is generated in the `coverage` directory and can be viewed in a browser by opening `coverage/lcov-report/index.html`.

## Manual API Testing

### Postman Collection

A Postman collection is available for manual API testing. Import the collection from:

```
documentation/postman/Crisis-Cap-API.postman_collection.json
```

### Environment Setup for Postman

1. Create a new environment in Postman
2. Add the following variables:
   - `baseUrl`: Your API base URL (e.g., `http://localhost:3000/api`)
   - `token`: Leave empty initially (will be set after login)

### Authentication Flow

1. Use the "Login" request to authenticate
2. The response includes a token
3. Copy the token value to your Postman environment's `token` variable
4. All other requests will automatically use this token

## Common Testing Scenarios

### User Authentication

Test the authentication flow:
1. Register a new user (if applicable)
2. Login with credentials
3. Access protected endpoints
4. Test token refresh
5. Test invalid credentials

### Intervention Management

Test the complete intervention lifecycle:
1. Create a new intervention
2. Assign resources to the intervention
3. Update intervention status
4. Add timeline events
5. Complete and close the intervention

### Team Management

Test team operations:
1. Create a new team
2. Add members to the team
3. Assign the team to an intervention
4. Update team status
5. Remove members from the team

### Role-Based Access Control

Test permissions across different user roles:
1. Test with Firefighter role (limited permissions)
2. Test with Team Leader role (moderate permissions)
3. Test with Officer role (extensive permissions)
4. Test with Regional Coordinator role (administrative permissions)

## Troubleshooting

### Common Test Issues

1. **Connection errors**: Ensure MongoDB is running if not using the in-memory database
2. **Authentication failures**: Check that the JWT secret is properly set in the test environment
3. **Timeout errors**: Increase the test timeout in Jest configuration if needed

### Debugging Tests

Add the `--verbose` flag to see more detailed output:

```bash
npm test -- --verbose
```

For deeper debugging, you can add `console.log` statements or use the Node.js debugger:

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then connect to the debugger using Chrome DevTools or your IDE.

## Continuous Integration

Tests are automatically run in the CI pipeline. The configuration ensures:

1. All tests pass
2. Code coverage meets minimum thresholds
3. Linting passes
4. TypeScript compilation succeeds

Failed tests will block the deployment process, ensuring code quality.
