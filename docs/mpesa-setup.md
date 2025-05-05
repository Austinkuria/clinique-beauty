# Setting Up M-Pesa Daraja API for Development and Production

## Understanding M-Pesa Integration Requirements

1. **Shortcode**: In the sandbox environment, use `174379` (Safaricom's test Paybill number). 
   In production, you'll use your actual business Paybill or Till number.

2. **Passkey**: For sandbox testing, use the default test passkey: 
   `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`
   
   For production, you'll receive a unique passkey when your organization's M-Pesa integration is approved.

3. **Callback URL**: This needs to be a publicly accessible URL that Safaricom servers can reach.

## Setting Up for Local Development

### Using Ngrok for Callback URL

Since your development server runs locally, you need a tool like ngrok to create a secure tunnel:

1. **Install ngrok**: Download from [ngrok.com](https://ngrok.com/download) and sign up for a free account.

2. **Start your server first**: Make sure your server is running on port 5000 (or your configured port).

3. **Launch ngrok**: Open a new terminal and run:
   ```
   ngrok http 5000
   ```

4. **Update environment variables**: Copy the HTTPS URL displayed by ngrok (something like `https://1234-abc-123.ngrok-free.app`) and set it as your callback URL:
   ```
   MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok-free.app/api/mpesa/callback
   ```

5. **Restart your server**: For the changes to take effect.

## Setting Up for Vercel Deployment

When deploying to Vercel, you need to configure environment variables in the Vercel dashboard:

1. **Go to your project** in the Vercel dashboard.

2. **Navigate to Settings > Environment Variables**

3. **Add the following environment variables**:
   - `MPESA_CONSUMER_KEY`: Your Daraja API Consumer Key
   - `MPESA_CONSUMER_SECRET`: Your Daraja API Consumer Secret
   - `MPESA_PASSKEY`: The passkey (use sandbox passkey for testing)
   - `MPESA_SHORTCODE`: The shortcode (use `174379` for sandbox)
   - `MPESA_CALLBACK_URL`: Your production callback URL (e.g., `https://your-vercel-app.vercel.app/api/mpesa/callback`)

4. **Choose Environment**: Make sure to set these variables for the appropriate environments (production, preview, development).

## Setting Up API Response URL in Daraja Dashboard

For both development and production:

1. **Log in** to your Daraja API developer account.

2. **Go to your app** settings.

3. **Update the Callback URL** for Lipa Na M-Pesa Online:
   - For development: use your ngrok URL
   - For production: use your Vercel app URL

## Automatic Environment Detection

Create a new file to automatically detect the environment and set the correct callback URL:

```js
// Inside server/src/config/mpesaConfig.js
const getMpesaCallbackUrl = () => {
  // Get the callback URL from environment variable
  const configuredUrl = process.env.MPESA_CALLBACK_URL;
  
  // If running on Vercel, use the deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/mpesa/callback`;
  }
  
  // Otherwise use the configured URL or fallback
  return configuredUrl || 'http://localhost:5000/api/mpesa/callback';
};

export { getMpesaCallbackUrl };
```

## Testing M-Pesa Payments

For sandbox testing, you can use these phone numbers:

- Phone numbers starting with: `254708374149` or any other number
- PIN for all test transactions: `12345678`

These test credentials will simulate a successful STK push transaction.

## Troubleshooting

- **Callback not received**: Check your ngrok console or Vercel logs to see if Safaricom is reaching your server.
- **Authentication errors**: Verify your Consumer Key and Secret are correctly set.
- **Payment failures**: Use the correct test phone number and PIN for sandbox testing.
