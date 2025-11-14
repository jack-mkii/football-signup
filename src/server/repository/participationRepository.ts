import { db } from "../db";
import * as schema from '../db/schema';
import { Err, Ok, type Result } from 'ts-results-es';

export async function getAll(): Promise<schema.SignUp[]> {
  return await db.select().from(schema.signUps);
}

export async function createMany(participations: schema.InsertParticipant[]): Promise<Result<schema.Participant[], Error>> {
  const createdParticipations = await db
    .insert(schema.participations)
    .values(participations)
    .returning();

  if (createdParticipations.length !== participations.length) {
    return Err(new Error('Failed to create participation records'));
  }

  return Ok(createdParticipations);
}
