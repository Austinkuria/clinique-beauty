# Production Deployment Troubleshooting Guide

This guide helps you troubleshoot common issues with the production deployment of Clinique Beauty, especially related to M-Pesa integration.

## M-Pesa Payment Not Showing in Production

If the M-Pesa payment dialog doesn't appear in production (Vercel) but works locally, follow these steps:

### 1. Check Browser Console for Errors

Open the browser's developer tools (F12) and look for any errors or warnings in the console that might explain why the payment flow is being skipped.

### 2. Verify API Endpoints

Ensure the M-Pesa API endpoints are correctly configured and accessible from the production environment:

1. Check the Vercel logs for any API request errors
2. Verify that the `vercel.json` file contains the correct API rewrites to forward requests to your API server
3. Test the endpoints directly using cURL or Postman:
   ```bash
   curl -X GET https://clinique-beauty.vercel.app/api/mpesa/health
   ```

### 3. Check Environment Variables

Verify that all required environment variables are set in Vercel's dashboard:

1. Go to your Vercel project settings
2. Check the Environment Variables section
3. Ensure `VITE_MPESA_ENABLED` is set to `true`

### 4. Test with Known Working Number

Use the test phone number for the Safaricom sandbox:
- Phone: 254708374149
- PIN: 12345678

### 5. Verify Cross-Origin Requests

If the frontend is making cross-origin requests to your API, ensure CORS is properly configured:

1. Check that your API server is correctly handling CORS headers
2. Verify that the `Access-Control-Allow-Origin` header is set to include your Vercel domain
3. Test a simple request with browser dev tools to confirm CORS is working

### 6. Check Ngrok Tunnel Status

The M-Pesa callback requires a public URL. Ensure your ngrok tunnel is running:

1. Run `npm run mpesa:check` to verify the ngrok tunnel status
2. Check that the callback URL in the Safaricom Daraja portal matches your current ngrok URL

## Fixing Bypassed Payment Process

If the checkout is bypassing the payment process and going straight to confirmation:

1. Add a debug console log immediately before payment initialization in the checkout component
2. Ensure the payment method state is correctly set to 'mpesa'
3. Verify that the payment dialog is being triggered:
   ```javascript
   // Add this in the submit handler:
   console.log('Payment method:', selectedPayment);
   console.log('Triggering payment dialog:', selectedPayment === 'mpesa');
   ```

4. Force the payment dialog to show by adding a direct call to the payment handler:
   ```javascript
   if (selectedPayment === 'mpesa') {
     setLoading(false);
     handleMpesaPayment(orderData);
     return; // Important: stop execution here to prevent skipping to confirmation
   }
   ```

## Testing API Connectivity from Production

Create a simple test endpoint and verify it can be accessed from production:

1. Add a test endpoint to your server:
   ```javascript
   app.get('/api/test', (req, res) => {
     res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
   });
   ```

2. Access it from your production domain:
   ```
   https://clinique-beauty.vercel.app/api/test
   ```

3. If this works but M-Pesa doesn't, the issue is specifically with the M-Pesa integration, not general API connectivity.

## Contact Support

If you've tried all the above steps and still encounter issues, gather the following information and contact support:

1. Browser console logs showing the error
2. Network tab requests/responses for any failed API calls
3. Server logs from both your Express server and Vercel deployment
4. Screenshots of the checkout process showing where it fails
