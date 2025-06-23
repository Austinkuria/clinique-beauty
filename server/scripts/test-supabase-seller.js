import chalk from 'chalk';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zdbfjwienzjdjpawcnuc.supabase.co';
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1/api`;

async function testSupabaseSellerEndpoints() {
  console.log(chalk.blue('🧪 Testing Supabase Seller Application Endpoints\n'));
  console.log(chalk.cyan(`Base URL: ${FUNCTIONS_URL}\n`));

  try {
    // Test 1: Check if functions are deployed
    console.log(chalk.yellow('1. Testing function availability...'));
    try {
      const response = await fetch(`${FUNCTIONS_URL}/sellers`, {
        method: 'GET'
      });
      
      if (response.status === 401) {
        console.log(chalk.green('✅ Functions are deployed (401 = auth required, as expected)'));
      } else if (response.status === 200) {
        console.log(chalk.green('✅ Functions are deployed and accessible'));
      } else {
        console.log(chalk.orange(`⚠️ Unexpected status: ${response.status}`));
      }
    } catch (error) {
      if (error.message.includes('fetch')) {
        console.log(chalk.red('❌ Functions not accessible. Check deployment.'));
      } else {
        console.log(chalk.orange(`⚠️ Error: ${error.message}`));
      }
    }

    // Test 2: Test seller application endpoint (no auth - should fail)
    console.log(chalk.yellow('\n2. Testing seller application endpoint (no auth)...'));
    try {
      const response = await fetch(`${FUNCTIONS_URL}/seller/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessName: 'Test Business',
          businessType: 'LLC',
          contactName: 'John Doe',
          email: 'test@example.com'
        })
      });
      
      if (response.status === 401) {
        console.log(chalk.green('✅ Authentication required (expected)'));
      } else {
        const text = await response.text();
        console.log(chalk.orange(`⚠️ Unexpected response: ${response.status} - ${text}`));
      }
    } catch (error) {
      console.log(chalk.red(`❌ Error: ${error.message}`));
    }

    // Test 3: Test seller status endpoint (no auth - should fail)
    console.log(chalk.yellow('\n3. Testing seller status endpoint (no auth)...'));
    try {
      const response = await fetch(`${FUNCTIONS_URL}/seller/status`, {
        method: 'GET'
      });
      
      if (response.status === 401) {
        console.log(chalk.green('✅ Authentication required (expected)'));
      } else {
        const text = await response.text();
        console.log(chalk.orange(`⚠️ Unexpected response: ${response.status} - ${text}`));
      }
    } catch (error) {
      console.log(chalk.red(`❌ Error: ${error.message}`));
    }

    // Test 4: Test CORS headers
    console.log(chalk.yellow('\n4. Testing CORS headers...'));
    try {
      const response = await fetch(`${FUNCTIONS_URL}/seller/apply`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
      });
      
      const corsHeaders = {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers')
      };
      
      if (corsHeaders['access-control-allow-origin']) {
        console.log(chalk.green('✅ CORS headers present'));
        console.log(chalk.gray(`   Origin: ${corsHeaders['access-control-allow-origin']}`));
        console.log(chalk.gray(`   Methods: ${corsHeaders['access-control-allow-methods']}`));
        console.log(chalk.gray(`   Headers: ${corsHeaders['access-control-allow-headers']}`));
      } else {
        console.log(chalk.orange('⚠️ CORS headers not found'));
      }
    } catch (error) {
      console.log(chalk.red(`❌ CORS test failed: ${error.message}`));
    }

    console.log(chalk.blue('\n🎉 Endpoint tests completed!'));
    console.log(chalk.cyan('\nNext steps:'));
    console.log('1. Deploy functions: pnpm run deploy:functions');
    console.log('2. Run database migration in Supabase SQL Editor');
    console.log('3. Start client: cd ../client && pnpm dev');
    console.log('4. Test full flow at http://localhost:3000/seller/apply');

  } catch (error) {
    console.error(chalk.red(`❌ Test suite failed: ${error.message}`));
  }
}

testSupabaseSellerEndpoints();
