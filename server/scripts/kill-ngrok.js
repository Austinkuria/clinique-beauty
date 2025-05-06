import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

async function killNgrokProcesses() {
  console.log(chalk.blue('🔍 Checking for running ngrok processes...'));
  
  try {
    if (process.platform === 'win32') {
      // Windows
      const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq ngrok.exe" /FO CSV');
      
      if (stdout.includes('ngrok.exe')) {
        console.log(chalk.yellow('Found running ngrok processes. Attempting to kill them...'));
        try {
          await execAsync('taskkill /F /IM ngrok.exe');
          console.log(chalk.green('✅ Successfully terminated all ngrok processes'));
        } catch (killError) {
          console.error(chalk.red('❌ Failed to kill ngrok processes:'), killError.message);
          return false;
        }
      } else {
        console.log(chalk.green('✅ No running ngrok processes found'));
      }
    } else {
      // Unix-like (Linux, macOS)
      const { stdout } = await execAsync('ps aux | grep ngrok | grep -v grep');
      
      if (stdout.trim()) {
        console.log(chalk.yellow('Found running ngrok processes. Attempting to kill them...'));
        try {
          await execAsync('killall ngrok');
          console.log(chalk.green('✅ Successfully terminated all ngrok processes'));
        } catch (killError) {
          console.error(chalk.red('❌ Failed to kill ngrok processes:'), killError.message);
          return false;
        }
      } else {
        console.log(chalk.green('✅ No running ngrok processes found'));
      }
    }
    
    // Also check if the ngrok web interface is responding
    try {
      const axios = (await import('axios')).default;
      await axios.get('http://localhost:4040/api/tunnels', { timeout: 1000 });
      console.log(chalk.yellow('⚠️ ngrok web interface is still running on port 4040.'));
      console.log(chalk.yellow('This might indicate ngrok is still running or the port is in use.'));
      console.log(chalk.yellow('You may need to restart your computer if problems persist.'));
    } catch (error) {
      // This is actually good - we want the connection to fail which means ngrok is not running
      console.log(chalk.green('✅ ngrok web interface is not running'));
    }
    
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Error checking ngrok processes:'), error.message);
    return false;
  }
}

// Run immediately if this script is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  killNgrokProcesses().then((success) => {
    if (success) {
      console.log(chalk.green('🎉 ngrok cleanup completed successfully'));
    } else {
      console.log(chalk.red('⚠️ ngrok cleanup had some issues'));
    }
  });
}

export default killNgrokProcesses;
