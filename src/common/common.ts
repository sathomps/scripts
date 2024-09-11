import * as readline from 'readline';
import * as fs from 'fs';
import { execSync } from 'child_process';

const winston = require('winston');

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.File({ filename: 'scripts.log' })],
});

export const colors = {
  red: '\u001b[0;31m',
  green: '\u001b[0;32m',
  yellow: '\u001b[1;33m',
  blue: '\u001b[0;34m',
  nc: '\u001b[0m',
};
export function createDirectoryIfNotExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
export function handleError(error: unknown): void {
  if (error instanceof Error) {
    logger.error(`An error occurred: ${error.message}`);
    logger.debug(error.stack);
  } else {
    logger.error(`An unknown error occurred: ${error}`);
  }
}

export function confirmAction(prompt: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${prompt} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

export function executeCommand(cmd: string, dryRun: boolean): void {
  if (dryRun) {
    logger.info(`Dry-run: ${cmd}`);
  } else {
    execSync(cmd, { stdio: 'inherit' });
  }
}

/**
 * Retries a command multiple times before giving up.
 * @param command - The shell command to execute.
 * @param retries - Number of retry attempts.
 * @returns True if the command was successful, false if all retries failed.
 */
export function retryCommand(
  command: string,
  retries: number,
  dryRun: boolean,
): boolean {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      executeCommand(command, dryRun);
      return true;
    } catch (error) {
      logger.error(`Command failed, retrying (${attempt}/${retries})...`);
      if (attempt === retries) {
        logger.error('Max retries reached. Command failed.');
        return false;
      }
    }
  }
  return false;
}
