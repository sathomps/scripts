import { execSync } from 'child_process';
import { loadConfig } from './config';
import {
  handleError,
  retryCommand,
  executeCommand,
  logger,
  confirmAction,
} from '../../common/common';

import { detectShellAndConfig } from '../../common/shell_detect';

const config = loadConfig();
detectShellAndConfig();

interface Arguments {
  commitMsg?: string;
  newBranch?: string;
  showDiffFlag?: boolean;
  squashFlag?: boolean;
  interactiveRebaseFlag?: boolean;
  tagName?: string;
  [key: string]: any;
}

// Git operations
function performGitAdd(): void {
  executeCommand('git add .', config.dryRun);
}

function performGitCommit(commitMsg: string): void {
  executeCommand(`git commit -m "${commitMsg}"`, config.dryRun);
}

function performGitPush(): boolean {
  return retryCommand('git push', config.retryAttempts, config.dryRun);
}

function createNewBranch(branchName: string): void {
  executeCommand(`git checkout -b ${branchName}`, config.dryRun);
}

function createTag(tagName: string): void {
  executeCommand(
    `git tag ${tagName} && git push origin ${tagName}`,
    config.dryRun,
  );
}

function performInteractiveRebase(): void {
  executeCommand('git rebase -i', config.dryRun);
}

function performSquash(): void {
  executeCommand('git rebase -i HEAD~2', config.dryRun);
}

function showDiff(): string {
  return execSync('git diff', { encoding: 'utf-8' });
}

async function handleShowDiffAndConfirm(): Promise<boolean> {
  logger.info(showDiff());
  return confirmAction('Do you want to continue with the commit?');
}

async function handlePushWithTag(tagName?: string): Promise<void> {
  if (await confirmAction('Do you want to push the changes?')) {
    const success = performGitPush();
    if (success && tagName) createTag(tagName);
  }
}

function performCommit(commitMsg: string): void {
  performGitAdd();
  performGitCommit(commitMsg);
}

function checkGitRepo() {
  throw new Error('Function not implemented.');
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
        config.dryRun = true;
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
}


// Main execution
async function main(args: string[]): Promise<void> {
  try {
    const parsedArgs = parseArguments(args);
    const commitMsg = parsedArgs.commitMsg || config.defaultCommitMsg;

    checkGitRepo();

    if (parsedArgs.showDiffFlag && !(await handleShowDiffAndConfirm()))
      process.exit(0);

    if (parsedArgs.newBranch) createNewBranch(parsedArgs.newBranch);

    performCommit(commitMsg);

    if (parsedArgs.squashFlag) performSquash();

    if (parsedArgs.interactiveRebaseFlag) performInteractiveRebase();

    await handlePushWithTag(parsedArgs.tagName);

    logger.info('Operation completed successfully.');
  } catch (error: unknown) {
    handleError(error);
    process.exit(1);
  }
}

main(process.argv.slice(2));

