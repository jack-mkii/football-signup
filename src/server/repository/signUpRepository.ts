import { Err, Ok, type Result } from "ts-results-es";
import { db } from "../db";
import * as schema from '../db/schema';
import { asc, eq, inArray } from "drizzle-orm";

export async function getAll(): Promise<schema.SignUp[]> {
  return await db
    .select()
    .from(schema.signUps)
    .orderBy(asc(schema.signUps.createdAt));
}

export async function create(signUp: schema.InsertSignUp): Promise<Result<schema.SignUp, Error>> {
  const [createdSignUp] = await db
    .insert(schema.signUps)
    .values(signUp)
    .returning();
  
  if (!createdSignUp) {
    return Err(new Error('Failed to create sign up'));
  }

  return Ok(createdSignUp);
}

export async function deleteSignUp(id: string): Promise<Result<schema.SignUp, Error>> {
  const [deletedSignUp] = await db
    .delete(schema.signUps)
    .where(eq(schema.signUps.id, id))
    .returning();

  if (!deletedSignUp) {
    return Err(new Error('Failed to delete sign up'));
  }

  return Ok(deletedSignUp);
}

export async function deleteMany(ids: string[]): Promise<Result<schema.SignUp[], Error>> {
  const deleteResult = await db
    .delete(schema.signUps)
    .where(inArray(schema.signUps.id, ids))
    .returning();
  
  if (deleteResult.length !== ids.length) {
    return Err(new Error('Failed to delete sign up records'));
  }

  return Ok(deleteResult);
}
