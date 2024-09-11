import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logging';

interface ShellConfig {
  currentShell: string;
  configDir: string;
  rcFile: string;
  profileFile: string;
}

export function detectShellAndConfig(): ShellConfig {
  const homeDir = os.homedir();
  const shell = process.env.SHELL || '';

  let config: ShellConfig;

  switch (true) {
    case shell.endsWith('/bash'):
      config = {
        currentShell: 'bash',
        configDir: path.join(homeDir, '.config', 'bash'),
        rcFile: path.join(homeDir, '.bashrc'),
        profileFile: path.join(homeDir, '.bash_profile'),
      };
      break;
    case shell.endsWith('/zsh'):
      config = {
        currentShell: 'zsh',
        configDir: path.join(homeDir, '.config', 'zsh'),
        rcFile: path.join(homeDir, '.zshrc'),
        profileFile: path.join(homeDir, '.zprofile'),
      };
      break;
    case shell.endsWith('/fish'):
      config = {
        currentShell: 'fish',
        configDir: path.join(homeDir, '.config', 'fish'),
        rcFile: path.join(homeDir, '.config', 'fish', 'config.fish'),
        profileFile: path.join(homeDir, '.config', 'fish', 'config.fish'),
      };
      break;
    case shell.endsWith('/ksh'):
      config = {
        currentShell: 'ksh',
        configDir: path.join(homeDir, '.config', 'ksh'),
        rcFile: path.join(homeDir, '.kshrc'),
        profileFile: path.join(homeDir, '.profile'),
      };
      break;
    case shell.endsWith('/tcsh'):
      config = {
        currentShell: 'tcsh',
        configDir: path.join(homeDir, '.config', 'tcsh'),
        rcFile: path.join(homeDir, '.tcshrc'),
        profileFile: path.join(homeDir, '.login'),
      };
      break;
    case shell.endsWith('/csh'):
      config = {
        currentShell: 'csh',
        configDir: path.join(homeDir, '.config', 'csh'),
        rcFile: path.join(homeDir, '.cshrc'),
        profileFile: path.join(homeDir, '.login'),
      };
      break;
    case shell.endsWith('/ash'):
    case shell.endsWith('/dash'):
      config = {
        currentShell: shell.endsWith('/ash') ? 'ash' : 'dash',
        configDir: path.join(
          homeDir,
          '.config',
          shell.endsWith('/ash') ? 'ash' : 'dash',
        ),
        rcFile: path.join(homeDir, '.profile'),
        profileFile: path.join(homeDir, '.profile'),
      };
      break;
    default:
      throw new Error(`Unsupported or unknown shell: ${shell}`);
  }

  // Create the config directory if it doesn't exist
  fs.mkdirSync(config.configDir, { recursive: true });

  logger.info(`Detected shell: ${config.currentShell}`);
  logger.info(`Config directory: ${config.configDir}`);
  logger.info(`RC file: ${config.rcFile}`);
  logger.info(`Profile file: ${config.profileFile}`);

  return config;
}

// Call the function to detect the shell and set variables

// You can now use shellConfig.currentShell, shellConfig.configDir, shellConfig.rcFile, and shellConfig.profileFile in your script
