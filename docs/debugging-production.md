# Debugging M-Pesa Payment in Production

## Common Issues with M-Pesa Payments in Production

### 1. 405 Method Not Allowed Error

If you see a "405 Method Not Allowed" error when trying to make M-Pesa payments, it means the API endpoint is not properly configured.

**Solution:**
- Check your `vercel.json` file to ensure it has the proper rewrites for API endpoints
- Ensure the `/api/mpesa/stkpush` endpoint is properly forwarded to your backend server

Example correct configuration:
```json
{
  "rewrites": [
    {
      "source": "/api/mpesa/:path*",
      "destination": "https://your-backend-url.com/api/mpesa/:path*"
    },
    ...
  ]
}
```

### 2. CORS Issues

If the browser console shows CORS errors, the server isn't properly configured to accept requests from your frontend domain.

**Solution:**
- Update your server's CORS configuration to include your Vercel domain
- Ensure the proper headers are set in your `vercel.json` file
- Check the `corsMiddleware.js` to ensure it includes your production domain

### 3. Empty Response from M-Pesa API

If the M-Pesa API returns an empty response, it could mean:

**Solution:**
- Check that your backend server is running and accessible
- Verify your M-Pesa API credentials are correct
- Make sure the ngrok tunnel is active if you're using it for callbacks
- Check the server logs for more detailed error information

## Testing M-Pesa Integration in Production

1. Use the browser's developer tools Network tab to monitor the request
2. Check the request payload to ensure it has all required fields
3. Verify the response status and body
4. Look at the server logs for more detailed error information

## Server-Side Debugging

1. Add logging to your server code to track the request flow
2. Verify your environment variables are correctly set in production
3. Test the M-Pesa API directly using Postman or a similar tool
4. Check the callback URL is correctly configured

## Helpful Commands

Check the ngrok tunnel status:
```bash
npm run mpesa:check
```

Test the M-Pesa API directly:
```bash
npm run mpesa:test
```

Restart the ngrok tunnel:
```bash
npm run mpesa:ngrok:clean
```
