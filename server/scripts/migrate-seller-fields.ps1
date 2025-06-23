# Database Migration Script for Seller Application Feature
# Run this script to update the sellers table with required fields

Write-Host "Running seller application database migration..." -ForegroundColor Green

# Check if we're in the server directory
if (-not (Test-Path "package.json")) {
    Write-Host "Please run this script from the server directory" -ForegroundColor Red
    exit 1
}

# Run the migration using pnpm
Write-Host "Applying migration: add_seller_application_fields.sql" -ForegroundColor Yellow
pnpm run db:migrate add_seller_application_fields.sql

Write-Host "Migration completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the server: pnpm start"
Write-Host "2. Test the seller application endpoint"
Write-Host "3. Verify the frontend can submit applications"
