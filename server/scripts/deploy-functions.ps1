# Supabase Function Deployment Script
# This script deploys the updated API function with seller application routes

Write-Host "🚀 Deploying Supabase Functions..." -ForegroundColor Green

# Check if we're in the server directory
if (-not (Test-Path "supabase")) {
    Write-Host "Please run this script from the server directory" -ForegroundColor Red
    exit 1
}

# Check if Supabase CLI is installed
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Deploy the functions
Write-Host "📦 Deploying API function with seller application routes..." -ForegroundColor Yellow
try {
    supabase functions deploy api --no-verify-jwt
    Write-Host "✅ API function deployed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to deploy API function" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run the database migration in Supabase SQL Editor:"
Write-Host "   Copy contents of supabase/migrations/update_sellers_table.sql"
Write-Host "2. Test the endpoints:"
Write-Host "   - POST https://your-project.supabase.co/functions/v1/api/seller/apply"
Write-Host "   - GET https://your-project.supabase.co/functions/v1/api/seller/status"
Write-Host "3. Test the frontend application form at /seller/apply"
