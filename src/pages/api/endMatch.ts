import type { NextApiRequest, NextApiResponse } from 'next'
import * as signUpRepository from '../../server/repository/signUpRepository';
import * as participationRepository from '../../server/repository/participationRepository';

type ResponseData = {
  message: string
}

type ResponseError = {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ResponseError>
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." })
    return
  }

  const key = req.headers['x-api-key']

  const validKey = process.env.INTERNAL_API_KEY

  if (key === undefined || key !== validKey) {
    res.status(403).json({ error: "unauthorized" })
    return
  }

  try {
    await resetSignup()
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
      res.status(500).json({ error: error.message })
      return
    }
  }

  res.status(200).json({ "message": "successfully reset matchday" })
  return
}

async function resetSignup() {
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
    throw new Error("error creating participation record", { cause: participationsResult.error })
  } else {
    console.log(`Successfully created ${participationsResult.value.length} participation records`);
  }

  const deleteSignUpsResult =
    await signUpRepository.deleteMany(signUps.map((signUp) => signUp.id));

  if (deleteSignUpsResult.isErr()) {
    throw new Error("error deleting current signups", { cause: deleteSignUpsResult.error })
  } else {
    console.log(`Successfully deleted ${deleteSignUpsResult.value.length} sign up records`);
  }
}
