import { exec } from 'child_process';
import readline from 'readline';
import chalk from 'chalk';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(chalk.cyan(`Running: ${command}`));
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        return reject(error);
      }
      
      if (stderr) {
        console.error(chalk.yellow(`Warning: ${stderr}`));
      }
      
      console.log(chalk.green(stdout));
      resolve(stdout);
    });
  });
}

async function setupNgrok() {
  console.log(chalk.blue('\n┌──────────────────────────────────────────────────┐'));
  console.log(chalk.blue('│   NGROK SETUP WIZARD                             │'));
  console.log(chalk.blue('│   This will install ngrok globally               │'));
  console.log(chalk.blue('└──────────────────────────────────────────────────┘\n'));
  
  try {
    // Check if ngrok is already installed
    try {
      await executeCommand('ngrok --version');
      console.log(chalk.green('✅ ngrok is already installed!'));
    } catch (error) {
      console.log(chalk.yellow('⚠️ ngrok is not installed. Installing now...'));
      
      // Install ngrok globally
      await executeCommand('npm install -g ngrok');
      console.log(chalk.green('✅ ngrok installed successfully!'));
    }
    
    // Set up ngrok authentication
    console.log(chalk.blue('\nTo use ngrok, you need to authenticate with your authtoken.'));
    console.log(chalk.blue('You can get your authtoken at https://dashboard.ngrok.com/get-started/your-authtoken'));
    
    const authtoken = await new Promise((resolve) => {
      rl.question(chalk.yellow('Enter your ngrok authtoken (or press Enter to skip): '), (answer) => {
        resolve(answer.trim());
      });
    });
    
    if (authtoken) {
      await executeCommand(`ngrok authtoken ${authtoken}`);
      console.log(chalk.green('✅ ngrok authentication configured!'));
    } else {
      console.log(chalk.yellow('⚠️ Authentication skipped. You will need to run "ngrok authtoken YOUR_TOKEN" manually.'));
    }
    
    console.log(chalk.blue('\nNgrok setup completed. You can now run:'));
    console.log('- pnpm run mpesa:ngrok - Start ngrok tunnel for M-Pesa callbacks');
    console.log('- pnpm run dev - Start your server');
    
  } catch (error) {
    console.error(chalk.red('❌ Error setting up ngrok:'), error);
  } finally {
    rl.close();
  }
}

setupNgrok();
