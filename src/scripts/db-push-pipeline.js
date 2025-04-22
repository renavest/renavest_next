#!/usr/bin/env node
// scripts/db-push-pipeline.js

const { execSync } = require('child_process');
const readline = require('readline');

// Function to run commands and display output
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    const output = execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error executing command: ${error.message}`);
    return false;
  }
}

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Main function to run the pipeline
async function runPipeline() {
  try {
    // Push schema to development using .env.local
    console.log('\n--- Pushing schema to development database ---');
    const devSuccess = runCommand('npm run db:push');

    if (!devSuccess) {
      console.error('Failed to push schema to development database');
      process.exit(1);
    }

    // Ask for confirmation before pushing to production
    rl.question('\nSchema pushed to dev successfully. Push to production? (y/n) ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        // Push schema to production using .env.production
        console.log('\n--- Pushing schema to production database ---');
        const prodSuccess = runCommand('DOTENV_CONFIG_PATH=.env.production npm run db:push');

        if (prodSuccess) {
          console.log('\n✅ Schema successfully pushed to both development and production!');
        } else {
          console.error('\n❌ Failed to push schema to production database');
        }
      } else {
        console.log('\n❌ Production update skipped');
      }

      rl.close();
    });
  } catch (error) {
    console.error(`Error in migration pipeline: ${error.message}`);
    rl.close();
    process.exit(1);
  }
}

// Run the pipeline
runPipeline();
