import { execSync } from 'child_process';
import * as readline from 'readline';
import { loadConfig } from './config/config';
import { logger } from '../../common/logging';
import { handleError } from '../../common/common';
import { detectShellAndConfig } from '../../common/shell_detect';


const config = loadConfig();
detectShellAndConfig();

// Git operations
function performGitAdd(): void {
  executeCommand('git add .');
}

function performGitCommit(commitMsg: string): void {
  executeCommand(`git commit -m "${commitMsg}"`);
}

function performGitPush(): boolean {
  for (let i = 1; i <= config.retry_attempts; i++) {
    try {
      executeCommand('git push');
      return true;
    } catch (error) {
      logger.error(`Push failed, retrying (${i}/${config.retry_attempts})...`);
      if (i === config.retry_attempts) return false;
    }
  }
  return false;
}

function createNewBranch(branchName: string): void {
  executeCommand(`git checkout -b ${branchName}`);
}

function createTag(tagName: string): void {
  executeCommand(`git tag ${tagName} && git push origin ${tagName}`);
}

function performInteractiveRebase(): void {
  executeCommand('git rebase -i');
}

function performSquash(): void {
  executeCommand('git rebase -i HEAD~2');
}

function showDiff(): string {
  return execSync('git diff', { encoding: 'utf-8' });
}

// Utilities
function executeCommand(cmd: string): void {
  if (config.dry_run) {
    logger.info(`Dry-run: ${cmd}`);
  } else {
    execSync(cmd, { stdio: 'inherit' });
  }
}

function confirmAction(prompt: string): Promise<boolean> {
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

// Main operations
function performCommit(commitMsg: string): void {
  performGitAdd();
  performGitCommit(commitMsg);
}

async function performPush(): Promise<void> {
  if (await confirmAction('Do you want to push the changes?')) {
    const success = performGitPush();
    if (!success)
      logger.error(`Failed to push after ${config.retry_attempts} attempts`);
  }
}

// Command line argument parsing
interface Arguments {
  commitMsg?: string;
  newBranch?: string;
  showDiffFlag?: boolean;
  squashFlag?: boolean;
  interactiveRebaseFlag?: boolean;
  tagName?: string;
}

function parseArguments(args: string[]): Arguments {
  const parsed: Arguments = {};
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-m':
      case '--message':
        parsed.commitMsg = args[++i];
        break;
      case '-b':
      case '--branch':
        parsed.newBranch = args[++i];
        break;
      case '-d':
      case '--diff':
        parsed.showDiffFlag = true;
        break;
      case '-s':
      case '--squash':
        parsed.squashFlag = true;
        break;
      case '-i':
      case '--interactive-rebase':
        parsed.interactiveRebaseFlag = true;
        break;
      case '-t':
      case '--tag':
        parsed.tagName = args[++i];
        break;
      case '-v':
      case '--verbose':
        config.verbose = true;
        break;
      case '-n':
      case '--dry-run':
        config.dry_run = true;
        break;
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
      default:
        logger.error(`Unknown option: ${args[i]}`);
        process.exit(1);
    }
  }
  return parsed;
}

function showHelp(): void {
  logger.info('Usage: ts-node run.ts [options]');
  // Add more help text here
}

// Main execution
async function main(args: string[]): Promise<void> {
  try {
    const parsedArgs = parseArguments(args);

    const commitMsg = parsedArgs.commitMsg || config.default_commit_msg;

    // Assuming check_git_repo is implemented elsewhere
    // checkGitRepo();

    if (parsedArgs.showDiffFlag) {
      logger.info(showDiff());
      if (!(await confirmAction('Do you want to continue with the commit?'))) {
        process.exit(0);
      }
    }

    if (parsedArgs.newBranch) {
      createNewBranch(parsedArgs.newBranch);
    }

    performCommit(commitMsg);

    if (parsedArgs.squashFlag) {
      performSquash();
    }

    if (parsedArgs.interactiveRebaseFlag) {
      performInteractiveRebase();
    }

    await performPush();

    if (parsedArgs.tagName) {
      createTag(parsedArgs.tagName);
    }

    logger.info('Operation completed successfully.');
  } catch (error: unknown) {
    handleError(error);
    process.exit(1);
  }
}

main(process.argv.slice(2));
