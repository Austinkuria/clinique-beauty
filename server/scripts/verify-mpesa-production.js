import axios from 'axios';
import chalk from 'chalk';

// Configuration
const VERCEL_URL = 'https://clinique-beauty.vercel.app';
const TEST_PHONE = '254708374149'; // Use Safaricom's test number
const TEST_AMOUNT = 1; // Small amount for testing

async function testVercelMpesaEndpoint() {
  console.log(chalk.blue('📱 Testing M-Pesa integration in production...\n'));
  
  try {
    // Step 1: Test the direct endpoint
    console.log(chalk.yellow('Step 1: Testing direct M-Pesa endpoint on Vercel'));
    
    const testData = {
      phoneNumber: TEST_PHONE,
      amount: TEST_AMOUNT,
      orderId: 'TEST-' + Date.now(),
      description: 'Test payment from verification script',
      environment: 'production',
      timestamp: new Date().toISOString()
    };
    
    console.log(chalk.gray('Request payload:'));
    console.log(testData);
    
    console.log(chalk.gray(`Sending request to: ${VERCEL_URL}/api/mpesa/stkpush`));
    
    const response = await axios.post(
      `${VERCEL_URL}/api/mpesa/stkpush`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 second timeout
      }
    );
    
    console.log(chalk.green('\n✅ Success! Response received:'));
    console.log(response.data);
    
    // Step 2: Test the status query if we have a checkout request ID
    if (response.data && response.data.checkoutRequestId) {
      console.log(chalk.yellow('\nStep 2: Testing status query endpoint'));
      
      const checkoutRequestId = response.data.checkoutRequestId;
      console.log(chalk.gray(`Using checkout request ID: ${checkoutRequestId}`));
      
      // Wait a bit for the payment to process
      console.log(chalk.gray('Waiting 5 seconds before checking status...'));
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const statusResponse = await axios.post(
        `${VERCEL_URL}/api/mpesa/query`,
        {
          checkoutRequestId,
          environment: 'production',
          timestamp: new Date().toISOString()
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      console.log(chalk.green('\n✅ Status query successful:'));
      console.log(statusResponse.data);
    }
    
    console.log(chalk.green('\n🎉 All tests passed! The M-Pesa integration is working in production.'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Test failed:'));
    
    if (error.response) {
      console.error(chalk.red(`Status: ${error.response.status}`));
      console.error(chalk.red('Response data:'));
      console.error(error.response.data);
      console.error(chalk.red('Response headers:'));
      console.error(error.response.headers);
    } else if (error.request) {
      console.error(chalk.red('No response received. The request was made but no response was received.'));
      console.error(chalk.red('This could indicate a network issue or that the server is not responding.'));
    } else {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    
    console.log(chalk.yellow('\nTroubleshooting suggestions:'));
    console.log('1. Verify that your Vercel deployment has the correct rewrites in vercel.json');
    console.log('2. Check that your backend server (ngrok tunnel) is running and accessible');
    console.log('3. Verify your M-Pesa API credentials are correctly set in the backend');
    console.log('4. Check the CORS configuration allows requests from your Vercel domain');
    console.log('5. Look at the server logs for more detailed error information');
    
    process.exit(1);
  }
}

// Run the test
testVercelMpesaEndpoint();
