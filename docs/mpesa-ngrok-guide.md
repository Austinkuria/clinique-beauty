# Using ngrok for M-Pesa Integration

This guide explains how to set up and use ngrok to receive M-Pesa callbacks during local development.

## What is ngrok and Why Do We Need It?

ngrok creates a secure tunnel to your localhost, allowing external services like M-Pesa to reach your local development server. This is necessary because M-Pesa needs to send payment notifications to a publicly accessible URL, which your local development server isn't by default.

## Prerequisites

1. Make sure you have ngrok installed. If not, run:
   ```
   npm run install-ngrok
   ```
   
2. When prompted, enter your ngrok auth token. You can get this token by signing up at [ngrok.com](https://ngrok.com).

3. Ensure your .env file has the correct M-Pesa API configuration:
   ```
   # M-Pesa Configuration
   MPESA_CONSUMER_KEY=your_consumer_key
   MPESA_CONSUMER_SECRET=your_consumer_secret
   MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
   MPESA_SHORTCODE=174379
   MPESA_CALLBACK_URL=https://your-ngrok-domain.ngrok-free.app/api/mpesa/callback
   MPESA_API_URL=https://sandbox.safaricom.co.ke
   MPESA_DEBUG=true
   ```

## Setting Up ngrok for M-Pesa

We've created a few scripts to simplify using ngrok with M-Pesa:

### 1. Start Your Server with M-Pesa ngrok Tunnel

```bash
npm run mpesa:dev
```

This command:
- Starts your development server
- Creates an ngrok tunnel
- Automatically updates your `.env` file with the correct callback URL

### 2. Start Only the M-Pesa ngrok Tunnel

If your server is already running in another terminal:

```bash
npm run mpesa:ngrok
```

### 3. Check M-Pesa Callback Configuration

To verify your M-Pesa callback setup:

```bash
npm run mpesa:check
```

This will:
- Display your current callback URL
- Check if your server is accessible
- Verify your M-Pesa API credentials

## Integrating with Supabase

To make M-Pesa callbacks work with both your Express server and Supabase:

### 1. Configure M-Pesa to use the Express Server

For local development, your M-Pesa callbacks should go to your Express server through ngrok. The server will handle payment processing and then update Supabase as needed.

### 2. Set Up Supabase RLS Policies

Create appropriate Row Level Security policies in Supabase to allow your server to update order statuses:

```sql
-- Example RLS policy to allow authenticated server to update orders
CREATE POLICY "Server can update order status" 
ON orders
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (status_field = 'processing' OR status_field = 'completed');
```

### 3. Use Supabase Admin Key for Server Operations

In your M-Pesa callback handler, use the Supabase service role key to update data:

```javascript
// Example callback handler with Supabase integration
app.post('/api/mpesa/callback', async (req, res) => {
  // Get M-Pesa callback data
  const { Body } = req.body;
  
  // Connect to Supabase with service role key
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // Update order in Supabase
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'paid' })
    .eq('transaction_id', Body.transactionId);
  
  // Respond to Safaricom
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});
```

### 4. Test the Integration Chain

To test the complete integration chain:
1. Start your server with ngrok (`npm run mpesa:dev`)
2. Make a test payment
3. Check your Express server logs for the M-Pesa callback
4. Verify that Supabase data was updated correctly

## Using a Reserved Domain (Recommended)

For more consistent development, consider upgrading to an ngrok paid plan to get a reserved domain.

1. Set your reserved domain in your `.env` file:

```
NGROK_STATIC_DOMAIN=your-reserved-domain.ngrok-free.app
```

2. Start the ngrok tunnel using the same commands above.

## Troubleshooting

### Callback URL Not Working

1. Check if your server is running
2. Verify that the ngrok tunnel is active
3. Make sure your Safaricom Daraja portal has the correct callback URL

### M-Pesa Payment Not Processing

1. Use the test credentials:
   - Phone: 254708374149
   - PIN: 12345678
2. Check your server logs for errors
3. Run `npm run mpesa:check` to verify your setup

### Token Request Error

1. Ensure your .env file has the correct M-Pesa API configuration as mentioned in the prerequisites.
2. Verify your M-Pesa API credentials.
3. Check your server logs for token request errors.

## Terminal Commands Reference

| Command | Description |
|---------|-------------|
| `npm run mpesa:dev` | Start server + ngrok for M-Pesa |
| `npm run mpesa:ngrok` | Start only the ngrok tunnel |
| `npm run mpesa:check` | Check your M-Pesa callback configuration |
