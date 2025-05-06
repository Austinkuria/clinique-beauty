import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

// Convert exec to Promise-based
const execAsync = promisify(exec);

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const apiUrl = process.env.MPESA_API_URL || 'https://sandbox.safaricom.co.ke';

// Enhanced logging and diagnostics
console.log('====== M-Pesa Token Debugger ======');
console.log('Consumer Key:', consumerKey?.substring(0, 5) + '...' + consumerKey?.substring(consumerKey.length - 5));
console.log('Consumer Secret:', consumerSecret?.substring(0, 5) + '...' + consumerSecret?.substring(consumerSecret.length - 5));
console.log('API URL:', apiUrl);
console.log('Node Version:', process.version);
console.log('OS:', process.platform);

// Check for running ngrok instances
async function checkNgrokStatus() {
  console.log('\n====== Checking ngrok Status ======');
  try {
    // Stop any running ngrok instances
    if (process.platform === 'win32') {
      console.log('Checking for running ngrok processes...');
      const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq ngrok.exe" /FO CSV');
      if (stdout.includes('ngrok.exe')) {
        console.log('Found running ngrok instances. You may need to stop them.');
        console.log('Run these commands in a new terminal:');
        console.log('  taskkill /F /IM ngrok.exe');
        console.log('  OR visit http://localhost:4040/api/tunnels to manage your tunnels');
      } else {
        console.log('No running ngrok processes found.');
      }
    } else {
      console.log('Checking for running ngrok processes...');
      const { stdout } = await execAsync('ps aux | grep ngrok');
      if (stdout.includes('/ngrok') && !stdout.includes('grep ngrok')) {
        console.log('Found running ngrok instances. You may need to stop them.');
        console.log('Run this command in a new terminal:');
        console.log('  killall ngrok');
      } else {
        console.log('No running ngrok processes found.');
      }
    }
  } catch (error) {
    console.log('Could not check ngrok processes:', error.message);
  }
  
  // Try to connect to the ngrok web interface
  try {
    console.log('\nChecking ngrok web interface...');
    const response = await axios.get('http://localhost:4040/api/tunnels', { timeout: 2000 });
    console.log('Active ngrok tunnels found:');
    for (const tunnel of response.data.tunnels) {
      console.log(`- ${tunnel.public_url} -> ${tunnel.config.addr}`);
    }
    console.log('\nTo free up your ngrok session, visit: http://localhost:4040');
  } catch (error) {
    console.log('No ngrok web interface found at port 4040.');
  }
}

async function testDirectTokenFetch() {
  try {
    console.log('\nAttempting direct token fetch from Safaricom...');
    
    if (!consumerKey || !consumerSecret) {
      console.error('Error: Missing consumer key or secret. Check your .env file.');
      return;
    }
    
    // Create auth string and encode to base64
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    console.log('Authorization header:', `Basic ${auth.substring(0, 10)}...`);
    
    const tokenUrl = `${apiUrl}/oauth/v1/generate?grant_type=client_credentials`;
    console.log('Token URL:', tokenUrl);
    
    // Add timeout and retry logic
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`\nAttempt ${attempts} of ${maxAttempts}...`);
      
      try {
        const response = await axios.get(tokenUrl, {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 15000 // 15 second timeout
        });
        
        console.log('\n✅ SUCCESS! Token received:');
        console.log(response.data);
        
        return response.data.access_token;
      } catch (attemptError) {
        console.log(`Attempt ${attempts} failed:`, attemptError.message);
        
        if (attempts === maxAttempts) {
          throw attemptError; // Re-throw on final attempt
        }
        
        // Wait before retrying
        console.log('Waiting 2 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  } catch (error) {
    console.error('\n❌ ERROR fetching token directly:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    
    console.log('\nPossible solutions:');
    console.log('1. Check if your consumer key and secret are correct');
    console.log('2. Verify the API URL is correct (https://sandbox.safaricom.co.ke)');
    console.log('3. Check your internet connection');
    console.log('4. Try using a VPN if you\'re in a restricted network');
    console.log('5. Check if there are any firewall restrictions');
    
    return null;
  }
}

async function testLocalServerToken() {
  try {
    console.log('\nAttempting token fetch through local server...');
    
    const response = await axios.get('http://localhost:5000/api/mpesa/token');
    
    console.log('\n✅ SUCCESS! Token received from local server:');
    console.log(response.data);
    
    return response.data.token;
  } catch (error) {
    console.error('\n❌ ERROR fetching token from local server:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    
    return null;
  }
}

async function compareResults() {
  console.log('\n====== Testing Both Methods ======');
  
  // First check ngrok status to ensure no conflicts
  await checkNgrokStatus();
  
  const directToken = await testDirectTokenFetch();
  const serverToken = await testLocalServerToken();
  
  if (directToken && !serverToken) {
    console.log('\n⚠️ DIAGNOSIS: Direct token works but server token fails');
    console.log('This suggests an issue with your Express server implementation.');
    console.log('Verify your server routes and error handling.');
  } else if (!directToken && !serverToken) {
    console.log('\n⚠️ DIAGNOSIS: Both methods fail');
    console.log('This suggests an issue with your credentials or network access to Safaricom.');
  } else if (directToken && serverToken) {
    console.log('\n✅ DIAGNOSIS: Both methods work correctly');
    console.log('Your earlier error might be intermittent or resolved.');
  }
  
  console.log('\n====== Suggested Environment Updates ======');
  console.log(`MPESA_API_URL=https://sandbox.safaricom.co.ke`);
  console.log(`MPESA_DEBUG=true`);
  
  console.log('\n====== ngrok Troubleshooting ======');
  console.log('If you\'re having issues with "1 simultaneous ngrok agent session" error:');
  console.log('1. Make sure to kill existing ngrok processes before starting a new one:');
  console.log('   - Windows: taskkill /F /IM ngrok.exe');
  console.log('   - Mac/Linux: killall ngrok');
  console.log('2. Restart your computer to clear any zombie processes');
  console.log('3. Check your ngrok dashboard: https://dashboard.ngrok.com/tunnels');
  console.log('4. If you need multiple tunnels, use ngrok config file instead:');
  console.log('   https://ngrok.com/docs/secure-tunnels/ngrok-agent/reference/config');
}

compareResults();
