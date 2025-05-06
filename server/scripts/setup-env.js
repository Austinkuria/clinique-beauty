import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import chalk from 'chalk';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '..', '.env');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask a question and get the answer
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEnv() {
  console.log(chalk.blue('\n┌──────────────────────────────────────────────────────┐'));
  console.log(chalk.blue('│   ENVIRONMENT SETUP WIZARD                            │'));
  console.log(chalk.blue('│   This will help you set up your .env file            │'));
  console.log(chalk.blue('└──────────────────────────────────────────────────────┘\n'));

  // Check if .env file exists
  let existingEnv = '';
  if (fs.existsSync(envPath)) {
    existingEnv = fs.readFileSync(envPath, 'utf8');
    console.log(chalk.green('✅ Found existing .env file'));
  } else {
    console.log(chalk.yellow('⚠️ No existing .env file found. Creating a new one.'));
  }

  // Extract existing values from .env file
  const getExistingValue = (key) => {
    const regex = new RegExp(`${key}=(.+)`, 'i');
    const match = existingEnv.match(regex);
    return match ? match[1] : '';
  };

  // Server configuration
  const port = await question(`Port (default: 5000): [${getExistingValue('PORT') || '5000'}] `);
  
  // Supabase configuration
  const supabaseUrl = await question(`Supabase URL: [${getExistingValue('SUPABASE_URL') || ''}] `);
  const supabaseAnonKey = await question(`Supabase Anon Key: [${getExistingValue('SUPABASE_ANON_KEY') || ''}] `);
  const supabaseServiceKey = await question(`Supabase Service Role Key: [${getExistingValue('SUPABASE_SERVICE_ROLE_KEY') || ''}] `);
  
  // ngrok configuration
  const ngrokDomain = await question(`ngrok Static Domain: [${getExistingValue('NGROK_STATIC_DOMAIN') || 'deer-equal-blowfish.ngrok-free.app'}] `);
  
  // M-Pesa configuration
  const mpesaConsumerKey = await question(`M-Pesa Consumer Key: [${getExistingValue('MPESA_CONSUMER_KEY') || ''}] `);
  const mpesaConsumerSecret = await question(`M-Pesa Consumer Secret: [${getExistingValue('MPESA_CONSUMER_SECRET') || ''}] `);
  const mpesaPasskey = await question(`M-Pesa Passkey (default: sandbox passkey): [${getExistingValue('MPESA_PASSKEY') || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'}] `);
  const mpesaShortcode = await question(`M-Pesa Shortcode (default: 174379): [${getExistingValue('MPESA_SHORTCODE') || '174379'}] `);
  
  // Create .env content
  const envContent = `# Server Configuration
PORT=${port || getExistingValue('PORT') || '5000'}

# Supabase Configuration
SUPABASE_URL=${supabaseUrl || getExistingValue('SUPABASE_URL') || ''}
SUPABASE_ANON_KEY=${supabaseAnonKey || getExistingValue('SUPABASE_ANON_KEY') || ''}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey || getExistingValue('SUPABASE_SERVICE_ROLE_KEY') || ''}

# ngrok Configuration
NGROK_STATIC_DOMAIN=${ngrokDomain || getExistingValue('NGROK_STATIC_DOMAIN') || 'deer-equal-blowfish.ngrok-free.app'}

# M-Pesa Configuration
MPESA_CONSUMER_KEY=${mpesaConsumerKey || getExistingValue('MPESA_CONSUMER_KEY') || ''}
MPESA_CONSUMER_SECRET=${mpesaConsumerSecret || getExistingValue('MPESA_CONSUMER_SECRET') || ''}
MPESA_PASSKEY=${mpesaPasskey || getExistingValue('MPESA_PASSKEY') || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'}
MPESA_SHORTCODE=${mpesaShortcode || getExistingValue('MPESA_SHORTCODE') || '174379'}
MPESA_CALLBACK_URL=${getExistingValue('MPESA_CALLBACK_URL') || `https://${ngrokDomain || getExistingValue('NGROK_STATIC_DOMAIN') || 'deer-equal-blowfish.ngrok-free.app'}/api/mpesa/callback`}
`;

  // Write to .env file
  fs.writeFileSync(envPath, envContent);
  console.log(chalk.green('\n✅ .env file created successfully!'));
  
  // Instructions
  console.log(chalk.blue('\nNext steps:'));
  console.log('1. Start your server: pnpm run dev');
  console.log('2. Start ngrok tunnel: pnpm run mpesa:ngrok');
  console.log('3. Test M-Pesa integration with the sandbox credentials');

  rl.close();
}

setupEnv().catch(err => {
  console.error(chalk.red('Error setting up environment:'), err);
  rl.close();
});
