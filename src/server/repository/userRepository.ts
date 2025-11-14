import { Err, Ok, type Result } from "ts-results-es";
import { db } from "../db";
import * as schema from '../db/schema';
import { eq } from "drizzle-orm";

export async function getAll(): Promise<schema.User[]> {
  return await db
    .select()
    .from(schema.users);
}

export async function update(user: schema.UpdateUser): Promise<Result<schema.User, Error>> {
  const [updatedUser] = await db
    .update(schema.users)
    .set(user)
    .where(eq(schema.users.id, user.id))
    .returning();
  
  if (!updatedUser) {
    return Err(new Error('Failed to update user'));
  }

  return Ok(updatedUser);
}
