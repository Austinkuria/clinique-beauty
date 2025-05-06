import dotenv from 'dotenv';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import axios from 'axios';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const PORT = process.env.PORT || 5000;
const STATIC_DOMAIN = process.env.NGROK_STATIC_DOMAIN || 'deer-equal-blowfish.ngrok-free.app';
const SERVER_URL = `http://localhost:${PORT}`;
const CALLBACK_PATH = '/api/mpesa/callback';

async function startNgrok() {
  try {
    console.log(chalk.blue('\n┌──────────────────────────────────────────────────────┐'));
    console.log(chalk.blue('│   M-PESA NGROK TUNNEL STARTER                        │'));
    console.log(chalk.blue('│   This tool will:                                    │'));
    console.log(chalk.blue('│   - Start an ngrok tunnel to expose your server      │'));
    console.log(chalk.blue('│   - Configure the M-Pesa callback URL                │'));
    console.log(chalk.blue('│   - Make your callbacks available to Safaricom       │'));
    console.log(chalk.blue('└──────────────────────────────────────────────────────┘\n'));

    console.log(chalk.yellow(`Domain: ${STATIC_DOMAIN}`));
    console.log(chalk.yellow('Port: 5000\n'));

    // Check for existing tunnel
    try {
      const response = await axios.get('http://localhost:4040/api/tunnels', { timeout: 1000 });
      if (response.data.tunnels.length > 0) {
        const url = response.data.tunnels[0].public_url;
        console.log(chalk.green(`✅ Existing tunnel found: ${url}`));
        const callbackUrl = `${url}${CALLBACK_PATH}`;
        updateEnvFile(callbackUrl);
        await checkLocalServer();
        console.log(chalk.cyan('M-Pesa Callback URL:'), callbackUrl);
        console.log(chalk.magenta('Inspect tunnel traffic at:'), chalk.underline('http://localhost:4040'));
        console.log(chalk.yellow('\n📝 M-Pesa configuration'));
        console.log(chalk.yellow('Use this callback URL in your Safaricom Daraja portal:'));
        console.log(callbackUrl);
        console.log(chalk.blue('\n🧪 Testing M-Pesa Payments:'));
        console.log('- Test Phone: 254708374149');
        console.log('- Test PIN: 12345678');
        console.log(chalk.green('\n✨ Ready to receive M-Pesa callbacks!'));
        return url;
      }
    } catch (error) {
      console.log(chalk.yellow('No existing tunnel found, starting new one...'));
    }

    const args = ['http', PORT.toString()];
    if (STATIC_DOMAIN) {
      console.log(chalk.yellow(`Using reserved domain: ${STATIC_DOMAIN}`));
      args.push(`--domain=${STATIC_DOMAIN}`);
    } else {
      console.log(chalk.yellow('Using free ngrok tunnel (random URL)'));
    }

    const ngrok = spawn('C:\\Users\\kuria\\bin\\ngrok.exe', args);

    let url = '';
    ngrok.stdout.on('data', (data) => {
      console.log(`ngrok: ${data}`);
      const match = data.toString().match(/https:\/\/[a-zA-Z0-9-]+\.ngrok-free\.app/);
      if (match) {
        url = match[0];
        const callbackUrl = `${url}${CALLBACK_PATH}`;
        updateEnvFile(callbackUrl);
        console.log(chalk.green('\n✅ ngrok tunnel established!'));
        console.log(chalk.cyan('Base URL:'), url);
        console.log(chalk.cyan('M-Pesa Callback URL:'), callbackUrl);
        console.log(chalk.magenta('Inspect tunnel traffic at:'), chalk.underline('http://localhost:4040'));
        console.log(chalk.yellow('\n📝 M-Pesa configuration'));
        console.log(chalk.yellow('Use this callback URL in your Safaricom Daraja portal:'));
        console.log(callbackUrl);
        console.log(chalk.blue('\n🧪 Testing M-Pesa Payments:'));
        console.log('- Test Phone: 254708374149');
        console.log('- Test PIN: 12345678');
        console.log(chalk.green('\n✨ Ready to receive M-Pesa callbacks!'));
      }
    });

    ngrok.stderr.on('data', (data) => {
      console.error(chalk.red(`ngrok error: ${data}`));
    });

    ngrok.on('close', (code) => {
      console.log(chalk.red(`Ngrok process exited with code ${code}`));
      process.exit(code);
    });

    // Wait for tunnel to establish
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await checkLocalServer();
    return url;
  } catch (error) {
    console.error(chalk.red('❌ Error starting ngrok:'), error);
    process.exit(1);
  }
}

function updateEnvFile(callbackUrl) {
  try {
    const envPath = path.resolve(__dirname, '..', '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

    if (envContent.includes('MPESA_CALLBACK_URL=')) {
      envContent = envContent.replace(
        /MPESA_CALLBACK_URL=.*/g,
        `MPESA_CALLBACK_URL=${callbackUrl}`
      );
    } else {
      envContent += `\nMPESA_CALLBACK_URL=${callbackUrl}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(chalk.green('\n✅ Updated .env file with M-Pesa callback URL'));
  } catch (error) {
    console.error(chalk.red('❌ Error updating .env file:'), error);
  }
}

async function checkLocalServer() {
  try {
    await axios.get(`${SERVER_URL}/api/health`);
    console.log(chalk.green('\n✅ Local server is running and healthy'));
  } catch (error) {
    console.warn(chalk.yellow('\n⚠️ Warning: Local server not responding or /api/health endpoint not implemented'));
    console.log(chalk.yellow('Make sure your server is running on port', PORT));
  }
}

startNgrok();