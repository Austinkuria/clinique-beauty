# Deploying Clinique Beauty to Vercel

This guide explains how to set up your environment variables for deploying the application to Vercel.

## Required Environment Variables

In the Vercel dashboard, add the following environment variables:

### Supabase Configuration
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Clerk Configuration
- `CLERK_PEM_PUBLIC_KEY` - Your Clerk public key (PEM format)

### M-Pesa API Configuration
- `MPESA_CONSUMER_KEY` - Your Daraja API Consumer Key
- `MPESA_CONSUMER_SECRET` - Your Daraja API Consumer Secret
- `MPESA_PASSKEY` - Your Daraja API Passkey (use the sandbox one for testing)
- `MPESA_SHORTCODE` - Your business shortcode (use `174379` for sandbox)

## Setting Environment Variables in Vercel

1. Go to the Vercel dashboard and select your project.
2. Click on the "Settings" tab.
3. Select "Environment Variables" from the left sidebar.
4. Add each variable with its respective value.
5. Choose which environments should use each variable (Production, Preview, Development).
6. Click "Save" to apply your changes.

## Verifying Your Deployment

After deploying, test your M-Pesa integration by:

1. Navigate to your deployed site
2. Add items to your cart and proceed to checkout
3. Select M-Pesa as your payment method
4. Enter a test phone number (e.g., 254708374149)
5. Complete the checkout process
6. You should receive a simulated STK push notification

## Troubleshooting

If the M-Pesa integration isn't working properly:

1. Check the Vercel logs for any errors
2. Verify that all environment variables are correctly set
3. Ensure your callback URL is correctly configured in the Daraja dashboard
4. For sandbox testing, remember to use the test credentials:
   - Phone number: Any number starting with 254
   - PIN: 12345678
