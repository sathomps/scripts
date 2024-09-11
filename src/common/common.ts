import * as fs from 'fs';
import { logger } from './logging';

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
    logger.error('An error occurred:', error.message);
    if (error.stack) {
      logger.error('Stack trace:', error.stack);
    }
  } else {
    logger.error('An unknown error occurred: ', error);
  }
}
