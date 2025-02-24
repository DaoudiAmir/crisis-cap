Write-Host "🔍 Verifying backend..." -ForegroundColor Cyan

# 1. Check TypeScript compilation
Write-Host "📝 Checking TypeScript compilation..." -ForegroundColor Yellow
npx tsc --noEmit

# 2. Run ESLint
Write-Host "🔍 Running ESLint..." -ForegroundColor Yellow
npx eslint . --ext .ts

# 3. Run tests
Write-Host "🧪 Running tests..." -ForegroundColor Yellow
npm test

# 4. Check dependencies
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
npm audit

# 5. Check for circular dependencies
Write-Host "🔄 Checking for circular dependencies..." -ForegroundColor Yellow
npx madge --circular --extensions ts ./src

# 6. Check API endpoints
Write-Host "🌐 Checking API endpoints..." -ForegroundColor Yellow
$job = Start-Job -ScriptBlock { npm run start }
Start-Sleep -Seconds 5

# Basic health check
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
    Write-Host "Health check successful!" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "Health check failed: $_" -ForegroundColor Red
}

# Stop the server
Stop-Job $job
Remove-Job $job

Write-Host "✅ Backend verification complete!" -ForegroundColor Green
