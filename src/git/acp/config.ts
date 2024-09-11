export interface Config {
  retryAttempts: number;
  defaultCommitMsg: string;
  defaultBranch: string;
  verbose: boolean;
  dryRun: boolean;
}

export function loadConfig(): Config {
  let config: Config = {
    retryAttempts: 3,
    defaultCommitMsg: 'Auto Commit',
    defaultBranch: 'main',
    verbose: false,
    dryRun: false,
  };
  return config;
}
