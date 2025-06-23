# Seller Application Feature - Supabase Implementation Setup

This guide shows how to set up the seller application feature using Supabase Edge Functions.

## Prerequisites

- Supabase project configured
- Supabase CLI installed (`npm install -g supabase`)
- Clerk authentication configured
- pnpm installed

## Setup Steps

### 1. Database Migration

Run the database migration to add required fields to the sellers table:

1. Open Supabase SQL Editor
2. Copy the contents of `server/supabase/migrations/update_sellers_table.sql`
3. Execute the SQL

Or use the migration file directly in your Supabase dashboard.

### 2. Deploy Supabase Functions

Deploy the updated API function with seller application routes:

```powershell
# From the server directory
cd server
pnpm run deploy:functions
```

This will deploy the updated `api` function that now includes:
- `POST /api/seller/apply` - Submit seller application
- `GET /api/seller/status` - Check application status

### 3. Verify Environment Variables

Ensure your client has the correct Supabase URLs:

```env
# client/.env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_FUNCTIONS_URL=https://your-project-id.supabase.co
```

### 4. Start the Client

```powershell
# From the client directory
cd client
pnpm dev
```

## Testing the Implementation

### 1. Test the API Endpoints

You can test the endpoints directly:

```bash
# Test seller application (requires authentication)
curl -X POST https://your-project-id.supabase.co/functions/v1/api/seller/apply \
  -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Business",
    "businessType": "LLC",
    "contactName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "country": "USA"
  }'

# Test status check (requires authentication)
curl -X GET https://your-project-id.supabase.co/functions/v1/api/seller/status \
  -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN"
```

### 2. Test the Frontend

1. Navigate to `http://localhost:3000/seller/apply`
2. Sign in with Clerk
3. Complete the application form
4. Submit and check status at `/seller/status`

## Features Implemented

### Seller Application Form (`/seller/apply`)
- ✅ 3-step wizard (Business Info, Contact Details, Payment Info)
- ✅ Form validation with error handling
- ✅ File upload support for documents
- ✅ Integration with Clerk authentication
- ✅ Responsive Material-UI design

### Application Status Page (`/seller/status`)
- ✅ Check current application status
- ✅ View application details
- ✅ Show rejection reasons if applicable

### API Endpoints
- ✅ `POST /api/seller/apply` - Submit application with FormData support
- ✅ `GET /api/seller/status` - Get user's application status
- ✅ Authentication via Clerk JWT tokens
- ✅ Proper error handling and validation

### Database Integration
- ✅ Complete sellers table with all required fields
- ✅ Proper indexing for performance
- ✅ JSON storage for complex data (bank info, documents)
- ✅ Status tracking (pending, approved, rejected)

## Database Schema

The sellers table now includes:

```sql
-- Core fields
id UUID PRIMARY KEY
business_name TEXT NOT NULL
business_type TEXT  -- Individual, LLC, Corporation, Partnership
contact_name TEXT NOT NULL
email TEXT NOT NULL UNIQUE

-- Contact information
phone TEXT
address TEXT
city TEXT
state TEXT
zip TEXT
country TEXT

-- Business details
registration_number TEXT
tax_id TEXT

-- System fields
clerk_id TEXT UNIQUE  -- Links to Clerk user
status TEXT DEFAULT 'pending'  -- pending, approved, rejected
registration_date TIMESTAMPTZ DEFAULT NOW()
verification_date TIMESTAMPTZ
rejection_reason TEXT

-- JSON fields
bank_info JSONB  -- Banking details
documents JSONB  -- Uploaded documents metadata
product_categories JSONB  -- Intended product categories
```

## Admin Review Process

Admins can review applications through existing admin routes:

- `GET /api/sellers` - List all sellers (admins see all, public sees approved)
- `GET /api/sellers/:id` - Get specific seller details
- `PATCH /api/sellers/:id/verification` - Approve/reject applications

## Troubleshooting

### Common Issues

1. **Function Deployment Fails**
   ```powershell
   # Make sure you're logged in to Supabase
   supabase login
   
   # Link your project
   supabase link --project-ref your-project-id
   ```

2. **Authentication Errors**
   - Verify Clerk JWT secret is configured in Supabase
   - Check that user_profiles table has correct clerk_id mapping

3. **Database Errors**
   - Ensure the migration was run successfully
   - Check RLS policies allow the operations

### Debug Commands

```powershell
# Check function logs
supabase functions logs api

# Test function locally
supabase functions serve

# Check database
supabase db diff
```

## File Structure

```
server/
├── supabase/
│   ├── functions/
│   │   └── api/
│   │       └── index.ts          # Updated with seller routes
│   └── migrations/
│       └── update_sellers_table.sql
└── scripts/
    └── deploy-functions.ps1

client/src/
├── features/seller/pages/
│   ├── Apply.jsx                 # Application form
│   └── Status.jsx                # Status page
└── api/
    └── apiClient.js              # Updated with seller methods
```

## Next Steps

After setup, you may want to:

1. Add email notifications for status changes
2. Implement document upload to Supabase Storage
3. Add admin dashboard for reviewing applications
4. Set up automated approval workflows
5. Add seller onboarding process after approval

## Support

If you encounter issues:

1. Check Supabase function logs
2. Verify environment variables
3. Test API endpoints with curl
4. Check browser console for frontend errors
5. Review database permissions and RLS policies
