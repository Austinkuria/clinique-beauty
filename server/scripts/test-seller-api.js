import axios from 'axios';
import chalk from 'chalk';

const SERVER_URL = 'http://localhost:5000';

async function testSellerApplication() {
  console.log(chalk.blue('🧪 Testing Seller Application API Endpoints\n'));

  try {
    // Test 1: Check if server is running
    console.log(chalk.yellow('1. Checking server status...'));
    try {
      const response = await axios.get(`${SERVER_URL}/api/health`);
      console.log(chalk.green('✅ Server is running'));
    } catch (error) {
      console.log(chalk.red('❌ Server is not running. Please start with: pnpm start'));
      return;
    }

    // Test 2: Test seller application endpoint (without auth - should fail)
    console.log(chalk.yellow('\n2. Testing seller application endpoint (no auth)...'));
    try {
      await axios.post(`${SERVER_URL}/api/seller/apply`, {
        businessName: 'Test Business',
        businessType: 'LLC',
        contactName: 'John Doe',
        email: 'test@example.com'
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(chalk.green('✅ Authentication required (expected)'));
      } else {
        console.log(chalk.orange(`⚠️ Unexpected error: ${error.message}`));
      }
    }

    // Test 3: Test seller status endpoint (without auth - should fail)
    console.log(chalk.yellow('\n3. Testing seller status endpoint (no auth)...'));
    try {
      await axios.get(`${SERVER_URL}/api/seller/status`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(chalk.green('✅ Authentication required (expected)'));
      } else {
        console.log(chalk.orange(`⚠️ Unexpected error: ${error.message}`));
      }
    }

    console.log(chalk.blue('\n🎉 API endpoint tests completed!'));
    console.log(chalk.cyan('\nNext steps:'));
    console.log('1. Run the migration: pnpm run migrate:seller');
    console.log('2. Start the client: cd ../client && pnpm dev');
    console.log('3. Test the full flow in the browser at /seller/apply');

  } catch (error) {
    console.error(chalk.red(`❌ Test failed: ${error.message}`));
  }
}

testSellerApplication();
