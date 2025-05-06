import ngrok from 'ngrok';
import dotenv from 'dotenv';
import fs from 'fs';
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
const PORT = process.env.PORT || 5000;
const STATIC_DOMAIN = process.env.NGROK_STATIC_DOMAIN;
const SERVER_URL = `http://localhost:${PORT}`;
const CALLBACK_PATH = '/api/mpesa/callback';

// Main function to start ngrok tunnel
async function startNgrok() {
  try {
    console.log(chalk.blue('🚀 Starting M-Pesa ngrok tunnel...'));
    
    // Connect to ngrok
    let url;
    
    if (STATIC_DOMAIN) {
      // Use static/reserved domain if available
      console.log(chalk.yellow(`Using reserved domain: ${STATIC_DOMAIN}`));
      url = await ngrok.connect({
        addr: PORT,
        domain: STATIC_DOMAIN
      });
    } else {
      // Use random domain
      url = await ngrok.connect(PORT);
      console.log(chalk.yellow('Using free ngrok tunnel (random URL)'));
    }
    
    // Format URLs for display and configuration
    const callbackUrl = `${url}${CALLBACK_PATH}`;
    
    console.log(chalk.green('\n✅ ngrok tunnel established!'));
    console.log(chalk.cyan('Base URL:'), url);
    console.log(chalk.cyan('M-Pesa Callback URL:'), callbackUrl);
    
    // Update .env file with the ngrok URL
    updateEnvFile(callbackUrl);
    
    // Check local server health
    await checkLocalServer();
    
    console.log(chalk.magenta('\n🔍 ngrok tunnel inspection'));
    console.log(chalk.magenta('Inspect tunnel traffic at:'), chalk.underline('http://localhost:4040'));
    
    // Instructions for manual configuration in Safaricom portal if needed
    console.log(chalk.yellow('\n📝 M-Pesa configuration'));
    console.log(chalk.yellow('Use this callback URL in your Safaricom Daraja portal:'));
    console.log(callbackUrl);
    
    // Display test instructions
    console.log(chalk.blue('\n🧪 Testing M-Pesa Payments:'));
    console.log('- Test Phone: 254708374149');
    console.log('- Test PIN: 12345678');
    
    console.log(chalk.green('\n✨ Ready to receive M-Pesa callbacks!'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error starting ngrok:'), error);
    process.exit(1);
  }
}

// Helper function to update .env file with new callback URL
function updateEnvFile(callbackUrl) {
  try {
    const envPath = path.resolve(__dirname, '..', '.env');
    let envContent = '';
    
    // Read existing .env file if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Replace or add MPESA_CALLBACK_URL
    if (envContent.includes('MPESA_CALLBACK_URL=')) {
      envContent = envContent.replace(
        /MPESA_CALLBACK_URL=.*/g,
        `MPESA_CALLBACK_URL=${callbackUrl}`
      );
    } else {
      envContent += `\nMPESA_CALLBACK_URL=${callbackUrl}`;
    }
    
    // Save updated .env file
    fs.writeFileSync(envPath, envContent);
    console.log(chalk.green('\n✅ Updated .env file with M-Pesa callback URL'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error updating .env file:'), error);
  }
}

// Check if local server is running
async function checkLocalServer() {
  try {
    await axios.get(`${SERVER_URL}/api/health`);
    console.log(chalk.green('\n✅ Local server is running and healthy'));
  } catch (error) {
    console.warn(chalk.yellow('\n⚠️ Warning: Local server not responding or /api/health endpoint not implemented'));
    console.log(chalk.yellow('Make sure your server is running on port', PORT));
  }
}

// Start the tunnel
startNgrok();
