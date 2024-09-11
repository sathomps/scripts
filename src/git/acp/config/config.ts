import * as fs from 'fs';

export interface Config {
  retry_attempts: number;
  default_commit_msg: string;
  default_branch: string;
  verbose: boolean;
  dry_run: boolean;
}

export function loadConfig(filePath: string = 'config.json'): Config {
  const configFile = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(configFile);
}