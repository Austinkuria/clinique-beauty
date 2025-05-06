import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function testMpesaPayment() {
  try {
    console.log('Testing M-Pesa payment...');
    
    // Step 1: Get the M-Pesa token
    console.log('Step 1: Getting M-Pesa token...');
    const tokenResponse = await axios.get('http://localhost:5000/api/mpesa/token');
    const token = tokenResponse.data.token;
    console.log('Token received:', token);
    
    // Step 2: Send STK Push
    console.log('\nStep 2: Sending STK Push...');
    const paymentData = {
      phoneNumber: '254708374149', // Test phone number
      amount: 1, // Small amount for testing
      orderId: 'TEST-' + Date.now(),
      description: 'Test payment from test script'
    };
    
    console.log('Payment data:', paymentData);
    
    const stkResponse = await axios.post(
      'http://localhost:5000/api/mpesa/stkpush', 
      paymentData
    );
    
    console.log('\nSTK Push response:');
    console.log(JSON.stringify(stkResponse.data, null, 2));
    
    // Step 3: If successful, check status after a delay
    if (stkResponse.data.success || stkResponse.data.ResponseCode === '0') {
      const checkoutRequestId = stkResponse.data.checkoutRequestId || stkResponse.data.CheckoutRequestID;
      
      console.log('\nStep 3: Waiting 10 seconds before checking status...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      console.log(`Checking status for requestId: ${checkoutRequestId}`);
      const statusResponse = await axios.post(
        'http://localhost:5000/api/mpesa/query',
        { checkoutRequestId }
      );
      
      console.log('\nStatus response:');
      console.log(JSON.stringify(statusResponse.data, null, 2));
    }
    
    console.log('\nTest completed.');
  } catch (error) {
    console.error('Test failed:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test
testMpesaPayment();
