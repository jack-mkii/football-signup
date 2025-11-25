import { spawn } from 'child_process';
import * as dotenv from 'dotenv'; 
import { startCronJobs } from '~/server/scheduler';

dotenv.config(); 

const startup = async () => {
  console.log(process.env.NODE_ENV);
  const isDev = process.env.NODE_ENV === 'development';
  const lifecycleEvent = process.env.npm_lifecycle_event;
  
  const nextCommand = isDev && lifecycleEvent !== 'start' ? 'dev' : 'start';
  const nextArgs = [
      'next', 
      nextCommand, 
      // ...(nextCommand === 'dev' ? ['--turbo'] : []) // Only add --turbo for dev
  ];

  console.log(`--- Starting application (Mode: ${nextCommand.toUpperCase()}) ---`);
  
  if (isDev) {
    console.log('✅ Running in Development');
  } else {
    console.log('✅ Running in Production');
  }
  
  startCronJobs();

  const command = 'npx';
  
  const nextDev = spawn(command, nextArgs, {
    stdio: 'inherit',
    shell: true,
  });

  nextDev.on('error', (err: Error) => {
    console.error(`\n🚨 Failed to start Next.js process.`);
    console.error(`Error details: ${err.message}`);
    process.exit(1);
  });

  nextDev.on('close', (code: number) => {
    if (code !== 0) {
      console.log(`\n⚠️ Next.js server exited with code ${code}.`);
      process.exit(code);
    } else {
      console.log('\n👋 Next.js server stopped normally.');
    }
  });
};

startup();
