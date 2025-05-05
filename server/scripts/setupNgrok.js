const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dotenv = require('dotenv');

// Path to .env file
const envPath = path.join(__dirname, '..', '.env');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Instructions for the user
console.log('\n====== M-Pesa Ngrok Callback URL Configuration ======\n');
console.log('This script will update your .env file with a new ngrok URL for M-Pesa callbacks.');
console.log('Please make sure ngrok is running before proceeding.\n');

// Ask for the ngrok URL
rl.question('Enter your ngrok HTTPS URL (e.g., https://1234-abc-123.ngrok-free.app): ', (ngrokUrl) => {
  if (!ngrokUrl.startsWith('https://') || !ngrokUrl.includes('ngrok')) {
    console.error('\nInvalid ngrok URL. It should be an HTTPS URL from ngrok.');
    rl.close();
    return;
  }

  try {
    // Load current .env file
    const env = fs.readFileSync(envPath, 'utf8');
    
    // Prepare new callback URL (append the path)
    const callbackUrl = `${ngrokUrl}/api/mpesa/callback`;
    
    // Check if MPESA_CALLBACK_URL already exists
    const updatedEnv = env.includes('MPESA_CALLBACK_URL=') 
      ? env.replace(/MPESA_CALLBACK_URL=.*/g, `MPESA_CALLBACK_URL=${callbackUrl}`)
      : `${env}\nMPESA_CALLBACK_URL=${callbackUrl}`;
    
    // Save updated .env file
    fs.writeFileSync(envPath, updatedEnv);
    
    console.log('\n✅ Successfully updated M-Pesa callback URL to:');
    console.log(callbackUrl);
    console.log('\nRestart your server for the changes to take effect.');
  } catch (error) {
    console.error('\n❌ Error updating .env file:', error.message);
  } finally {
    rl.close();
  }
});
