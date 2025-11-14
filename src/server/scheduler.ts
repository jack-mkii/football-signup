import cron from 'node-cron';
import * as signUpRepository from './repository/signUpRepository';
import * as participationRepository from './repository/participationRepository';

async function runTuesdayResetJob() {
  console.log('--- [CRON JOB] Starting Tuesday reset job... ---');

  const signUps = await signUpRepository.getAll();

  const today = new Date();
  const gameWeekDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

  const participationRecords = signUps.map((signUp) => {
    return {
      id: crypto.randomUUID(),
      userId: signUp.userId,
      gameWeek: gameWeekDate,
    }
  });

  const participationsResult =
    await participationRepository.createMany(participationRecords);

  if (participationsResult.isErr()) {
    console.error(participationsResult.error.message)
  } else {
    console.log(`Successfully created ${participationsResult.value.length} participation records`);
  }

  const deleteSignUpsResult =
    await signUpRepository.deleteMany(signUps.map((signUp) => signUp.id));
  
  if (deleteSignUpsResult.isErr()) {
    console.error(deleteSignUpsResult.error.message)
  } else {
    console.log(`Successfully deleted ${deleteSignUpsResult.value.length} sign up records`);
  }
}

export const startCronJobs = () => {
  const cronSchedule = '0 21 * * 2';

  cron.schedule(cronSchedule, runTuesdayResetJob, {
    timezone: 'Europe/London', 
  });
  
  console.log('✅ Scheduled Tuesday reset job for 9pm UK Time.');
};