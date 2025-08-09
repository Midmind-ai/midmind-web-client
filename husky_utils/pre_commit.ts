import { exec } from 'child_process';

import chalk from 'chalk';

import { logError, logSuccess } from './colorful_logs.ts';
import { emptyLine } from './empty_line.ts';
import { loader } from './loader.ts';

const parseTypescriptErrors = (output: string) => {
  const errorLines = output.split('\n');
  const errors: string[] = [];

  for (const line of errorLines) {
    const pattern = /(.+)\((\d+),(\d+)\): error (.+)/;
    const match = line.match(pattern);

    if (match) {
      const filePath = match[1];
      const lineNumber = match[2];
      const columnNumber = match[3];
      const errorMessage = match[4].replace(/TS\d+:\s*/g, '');

      const numbers = chalk.dim(`${chalk.dim(lineNumber)}:${chalk.dim(columnNumber)}`);
      const error = `${chalk.underline(filePath)}\n    ${numbers}  ${chalk.red('error')}  ${errorMessage}\n`;

      errors.push(error);
    }
  }
  return errors;
};

const validateTypes = async () => {
  return new Promise<void>((resolve, reject) => {
    const loaderInterval = loader('Running type checking');

    exec('yarn types:check', (error, stdout) => {
      clearInterval(loaderInterval);
      emptyLine();

      if (error) {
        console.log(chalk.red('✖ yarn types:check\n'));

        const errors = parseTypescriptErrors(stdout);

        if (errors.length > 0) {
          errors.forEach(err => console.log(err));
        }

        reject(new Error(`❌ You've got ${errors.length} TS errors\n`));
      } else {
        logSuccess('Type validation successful, no errors found 🚀');
        resolve();
      }
    });
  });
};

const validateCodeStyle = async () => {
  return new Promise<void>((resolve, reject) => {
    const loaderInterval = loader('Checking code style');

    exec('npx lint-staged', (error, _stdout, stderr) => {
      clearInterval(loaderInterval);
      emptyLine();

      if (error) {
        if (stderr) {
          console.log(stderr);
        }

        reject(new Error('Code style is out of order 😢\n'));
      } else {
        logSuccess('Code style is great 👍');
        resolve();
      }
    });
  });
};

// const runTests = async () => {
//   return new Promise<void>((resolve, reject) => {
//     const loaderInterval = loader('Running tests');

//     exec('yarn test', (error, ...args) => {
//       clearInterval(loaderInterval);
//       emptyLine();

//       if (error) {
//         const testsData = args[1];

//         console.log(`\n${testsData}`);

//         reject(new Error('🚨 You broke some logic\n'));
//       } else {
//         logSuccess('The logic is intact 🧠\n');
//         resolve();
//       }
//     });
//   });
// };

const buildProject = async () => {
  return new Promise<void>((resolve, reject) => {
    const loaderInterval = loader('Building project');

    exec('yarn build', (error, stdout, stderr) => {
      clearInterval(loaderInterval);
      emptyLine();

      if (error) {
        console.log(chalk.red('✖ yarn build\n'));

        if (stdout) {
          console.log(stdout);
        }
        if (stderr) {
          console.log(stderr);
        }

        console.log(chalk.red('Build Error Details:'));
        console.log(error.message);

        reject(new Error('❌ Project build failed\n'));
      } else {
        logSuccess('Project built successfully 🎉');
        resolve();
      }
    });
  });
};

const runPreCommitScripts = async () => {
  try {
    await validateTypes();
    await validateCodeStyle();
    // await runTests();
    await buildProject();
  } catch (error) {
    if (error instanceof Error) {
      logError(error.message);
    }
    process.exit(1);
  }
};

runPreCommitScripts();
