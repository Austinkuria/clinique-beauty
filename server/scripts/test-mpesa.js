import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Configuration
const SERVER_URL = 'http://localhost:5000';
const TEST_PHONE = '254708374149';
const TEST_AMOUNT = 1; // Use a small amount for testing

async function testMpesaIntegration() {
  try {
    console.log('📱 Testing M-Pesa integration...\n');
    
    // Step 1: Check server health
    console.log('Step 1: Checking server health...');
    
    try {
      const healthResponse = await axios.get(`${SERVER_URL}/api/health`);
      console.log('Server health status:', healthResponse.data.status);
    } catch (error) {
      console.error('❌ Server health check failed. Is your server running?');
      process.exit(1);
    }
    
    // Step 2: Check M-Pesa configuration
    console.log('\nStep 2: Checking M-Pesa configuration...');
    
    try {
      const mpesaHealthResponse = await axios.get(`${SERVER_URL}/api/mpesa/health`);
      console.log('M-Pesa configuration status:', mpesaHealthResponse.data);
      
      if (!mpesaHealthResponse.data.apiCredentialsConfigured) {
        console.error('❌ M-Pesa API credentials not configured properly');
        process.exit(1);
      }
      
      if (!mpesaHealthResponse.data.callbackConfigured) {
        console.error('❌ M-Pesa callback URL not configured');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ M-Pesa health check failed:', error.message);
    }
    
    // Step 3: Get M-Pesa token
    console.log('\nStep 3: Getting M-Pesa token...');
    
    let token;
    try {
      const tokenResponse = await axios.get(`${SERVER_URL}/api/mpesa/token`);
      token = tokenResponse.data.token;
      console.log('✅ Token received:', token.substring(0, 15) + '...');
    } catch (error) {
      console.error('❌ Failed to get M-Pesa token:', error.message);
      if (error.response) {
        console.error('Error details:', error.response.data);
      }
      process.exit(1);
    }
    
    // Step 4: Send STK Push
    console.log('\nStep 4: Sending STK Push...');
    
    const paymentData = {
      phoneNumber: TEST_PHONE,
      amount: TEST_AMOUNT,
      orderId: 'TEST-' + Date.now(),
      description: 'Test payment from script'
    };
    
    console.log('Payment request data:', paymentData);
    
    try {
      const stkResponse = await axios.post(
        `${SERVER_URL}/api/mpesa/stkpush`,
        paymentData
      );
      
      console.log('✅ STK Push response:', stkResponse.data);
      
      // Step 5: Check status after a delay
      if (stkResponse.data.checkoutRequestId) {
        const checkoutRequestId = stkResponse.data.checkoutRequestId;
        
        console.log('\nStep 5: Waiting 10 seconds before checking status...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        console.log(`Checking status for requestId: ${checkoutRequestId}`);
        
        try {
          const statusResponse = await axios.post(
            `${SERVER_URL}/api/mpesa/query`,
            { checkoutRequestId }
          );
          
          console.log('✅ Status response:', statusResponse.data);
        } catch (error) {
          console.error('❌ Status check failed:', error.message);
          if (error.response) {
            console.error('Error details:', error.response.data);
          }
        }
      }
    } catch (error) {
      console.error('❌ STK Push failed:', error.message);
      if (error.response) {
        console.error('Error details:', error.response.data);
      }
    }
    
    console.log('\n✅ Test completed.');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testMpesaIntegration();
