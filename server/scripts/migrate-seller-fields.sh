#!/bin/bash

# Database Migration Script for Seller Application Feature
# Run this script to update the sellers table with required fields

echo "Running seller application database migration..."

# Check if we're in the server directory
if [ ! -f "package.json" ]; then
    echo "Please run this script from the server directory"
    exit 1
fi

# Run the migration using pnpm
echo "Applying migration: add_seller_application_fields.sql"
pnpm run db:execute migrations/add_seller_application_fields.sql

echo "Migration completed!"
echo ""
echo "Next steps:"
echo "1. Start the server: pnpm start"
echo "2. Test the seller application endpoint"
echo "3. Verify the frontend can submit applications"
