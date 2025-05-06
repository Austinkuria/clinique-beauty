import { spawn } from 'child_process';
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
    
    // Use the global ngrok command via spawn
    const args = ['http', PORT.toString()];
    if (STATIC_DOMAIN) {
      console.log(chalk.yellow(`Using reserved domain: ${STATIC_DOMAIN}`));
      args.push(`--domain=${STATIC_DOMAIN}`);
    } else {
      console.log(chalk.yellow('Using free ngrok tunnel (random URL)'));
    }
    
    // Try to find ngrok in the PATH - this works with globally installed ngrok
    const ngrokProcess = spawn('ngrok', args);
    
    let url = '';
    
    // Handle stdout data
    ngrokProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(chalk.gray(output));
      
      // Try to extract the URL from the output
      const match = output.match(/(https:\/\/[a-zA-Z0-9-]+\.ngrok-free\.app)/);
      if (match && !url) {
        url = match[1];
        const callbackUrl = `${url}${CALLBACK_PATH}`;
        
        console.log(chalk.green('\n✅ ngrok tunnel established!'));
        console.log(chalk.cyan('Base URL:'), url);
        console.log(chalk.cyan('M-Pesa Callback URL:'), callbackUrl);
        
        // Update .env file
        updateEnvFile(callbackUrl);
        
        // Show additional information
        console.log(chalk.magenta('\n🔍 ngrok tunnel inspection'));
        console.log(chalk.magenta('Inspect tunnel traffic at:'), chalk.underline('http://localhost:4040'));
        
        console.log(chalk.yellow('\n📝 M-Pesa configuration'));
        console.log(chalk.yellow('Use this callback URL in your Safaricom Daraja portal:'));
        console.log(callbackUrl);
        
        console.log(chalk.blue('\n🧪 Testing M-Pesa Payments:'));
        console.log('- Test Phone: 254708374149');
        console.log('- Test PIN: 12345678');
        
        console.log(chalk.green('\n✨ Ready to receive M-Pesa callbacks!'));
        console.log(chalk.yellow('\nPress Ctrl+C to stop the tunnel'));
        
        // Check server health
        checkLocalServer();
      }
    });
    
    // Handle stderr data
    ngrokProcess.stderr.on('data', (data) => {
      console.error(chalk.red(`Error: ${data.toString()}`));
    });
    
    // Handle process exit
    ngrokProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(chalk.red(`ngrok process exited with code ${code}`));
        console.log(chalk.yellow('\nTips:'));
        console.log('1. Make sure ngrok is installed globally: npm install -g ngrok');
        console.log('2. Authenticate ngrok: ngrok authtoken YOUR_AUTH_TOKEN');
        console.log('3. Try again with: pnpm run mpesa:ngrok');
      }
      process.exit(code);
    });
    
    // Handle main process exit
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\nShutting down ngrok tunnel...'));
      ngrokProcess.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error(chalk.red('❌ Error starting ngrok:'), error);
    console.log(chalk.yellow('\nTips:'));
    console.log('1. Make sure ngrok is installed globally: npm install -g ngrok');
    console.log('2. Authenticate ngrok: ngrok authtoken YOUR_AUTH_TOKEN');
    console.log('3. Try again with: pnpm run mpesa:ngrok');
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
