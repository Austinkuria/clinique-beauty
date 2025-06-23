# Seller Application Feature Setup Guide

This guide will help you set up the complete seller application functionality.

## Prerequisites

- Node.js and pnpm installed
- Supabase project configured
- Clerk authentication set up

## Setup Steps

### 1. Database Migration

Run the database migration to add required fields to the sellers table:

```powershell
# From the server directory
cd server
pnpm run migrate:seller
```

Or manually run:
```powershell
pnpm run db:migrate add_seller_application_fields.sql
```

### 2. Start the Server

```powershell
# From the server directory
pnpm start
# or for development
pnpm dev
```

### 3. Test the API Endpoints

```powershell
# From the server directory
pnpm run test:seller
```

### 4. Start the Client

```powershell
# From the client directory
cd ../client
pnpm dev
```

## Feature Overview

### New Components Created

1. **`client/src/features/seller/pages/Apply.jsx`** - Multi-step seller application form
2. **`client/src/features/seller/pages/Status.jsx`** - Application status page
3. **`server/routes/sellerRoutes.js`** - Seller application API endpoints

### New Routes Added

- `/seller/apply` - Public route for seller applications
- `/seller/status` - Route to check application status
- **API Endpoints:**
  - `POST /api/seller/apply` - Submit seller application
  - `GET /api/seller/status` - Check application status

### Database Changes

The migration adds these fields to the `sellers` table:
- `business_type` - Type of business (Individual, LLC, etc.)
- `registration_number` - Business registration number
- `tax_id` - Tax identification number
- `bank_info` - JSON object with banking details
- `documents` - JSON array of uploaded document paths
- `clerk_id` - Clerk user ID for authentication

## Usage

### For Users (Becoming Sellers)

1. Navigate to `/seller/apply`
2. Complete the 3-step application form:
   - Business Information
   - Contact Details
   - Payment Information
3. Upload required documents
4. Submit application
5. Check status at `/seller/status`

### For Admins

Admins can review and manage seller applications through the existing admin dashboard.

## Testing

1. **API Testing**: Use `pnpm run test:seller` to verify endpoints
2. **Frontend Testing**: Navigate to `/seller/apply` in the browser
3. **Full Flow Testing**: Complete an application and check status

## Troubleshooting

### Common Issues

1. **Migration Fails**: Ensure Supabase credentials are correct in `.env`
2. **Authentication Errors**: Verify Clerk webhook secret is configured
3. **File Upload Issues**: Check file size limits and CORS settings

### Debug Commands

```powershell
# Check if database migration worked
pnpm run db:migrate --dry-run

# Test server connectivity
curl http://localhost:5000/api/health

# Check Clerk authentication
node scripts/debug-auth.js
```

## File Structure

```
client/src/features/seller/pages/
├── Apply.jsx          # Seller application form
├── Status.jsx         # Application status page
└── ...

server/
├── routes/sellerRoutes.js     # Seller API endpoints
├── migrations/                # Database migrations
└── scripts/                   # Setup and test scripts
```

## Next Steps

After setup, you may want to:

1. Customize the application form fields
2. Add email notifications for application status
3. Implement document verification workflows
4. Add seller dashboard features
5. Configure payment processing integration

## Support

If you encounter issues:

1. Check the server logs
2. Verify environment variables
3. Test API endpoints individually
4. Check browser console for frontend errors
