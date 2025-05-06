import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import axios from 'axios';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Configuration
const callbackUrl = process.env.MPESA_CALLBACK_URL;
const apiUrl = process.env.MPESA_API_URL || 'https://sandbox.safaricom.co.ke';
const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

async function checkMpesaCallback() {
  console.log(chalk.blue('🔍 Checking M-Pesa callback configuration...'));

  // Check if callback URL is set
  if (!callbackUrl) {
    console.error(chalk.red('❌ MPESA_CALLBACK_URL not set in .env file'));
    console.log(chalk.yellow('Try running: npm run mpesa:ngrok to set up a callback URL'));
    return;
  }

  // Display current configuration
  console.log(chalk.cyan('Current M-Pesa callback URL:'), callbackUrl);
  console.log(chalk.cyan('M-Pesa API URL:'), apiUrl);
  
  // Check if credentials are set
  if (!consumerKey || !consumerSecret) {
    console.error(chalk.red('❌ M-Pesa API credentials not set in .env file'));
    console.log(chalk.yellow('Make sure MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET are set'));
  } else {
    console.log(chalk.green('✅ M-Pesa API credentials found in .env'));
  }

  // Test callback URL accessibility
  try {
    const url = new URL(callbackUrl);
    console.log(chalk.blue('\nTesting callback URL accessibility...'));
    
    try {
      await axios.get(url.origin + '/api/health', { timeout: 5000 });
      console.log(chalk.green('✅ Server endpoint is accessible'));
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.error(chalk.red('❌ Server is not running or not accessible'));
      } else if (error.response) {
        console.log(chalk.yellow('⚠️ Server responded with status:'), error.response.status);
      } else {
        console.error(chalk.red('❌ Error checking server:'), error.message);
      }
    }
    
    // Explain how to test the callback
    console.log(chalk.magenta('\n📋 Callback URL Testing Information:'));
    console.log('1. Make sure this URL is registered in the Safaricom Daraja portal');
    console.log('2. Use the Safaricom test credentials to trigger a payment');
    console.log('3. Check your server logs to verify callbacks are being received');
    
    // Display test credentials reminder
    console.log(chalk.blue('\n🧪 Testing M-Pesa Payments:'));
    console.log('- Test Phone: 254708374149');
    console.log('- Test PIN: 12345678');
    
  } catch (error) {
    console.error(chalk.red('❌ Invalid callback URL format:'), error.message);
  }
}

// Run the check
checkMpesaCallback();
