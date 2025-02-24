#!/bin/bash

echo "🔍 Verifying backend..."

# 1. Check TypeScript compilation
echo "📝 Checking TypeScript compilation..."
npx tsc --noEmit

# 2. Run ESLint
echo "🔍 Running ESLint..."
npx eslint . --ext .ts

# 3. Run tests
echo "🧪 Running tests..."
npm test

# 4. Check dependencies
echo "📦 Checking dependencies..."
npm audit

# 5. Check for circular dependencies
echo "🔄 Checking for circular dependencies..."
npx madge --circular --extensions ts ./src

# 6. Check API endpoints
echo "🌐 Checking API endpoints..."
npm run start &
SERVER_PID=$!
sleep 5

# Basic health check
curl -s http://localhost:5000/api/health

# Kill the server
kill $SERVER_PID

echo "✅ Backend verification complete!"
