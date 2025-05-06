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

## Terminal Commands Reference

| Command | Description |
|---------|-------------|
| `npm run mpesa:dev` | Start server + ngrok for M-Pesa |
| `npm run mpesa:ngrok` | Start only the ngrok tunnel |
| `npm run mpesa:check` | Check your M-Pesa callback configuration |
