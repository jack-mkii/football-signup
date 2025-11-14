import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { create, deleteSignUp, getAll } from "~/server/repository/signUpRepository";
import * as userRepository from "~/server/repository/userRepository";

export const signUpRouter = createTRPCRouter({
  getAll: publicProcedure
    .query(async () => {
      return await getAll();
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      const deleteResult = await deleteSignUp(opts.input.id);

      if (deleteResult.isErr()) {
        throw new TRPCError({
          message: `Failed to delete sign up: ${deleteResult.error.message}`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      return deleteResult.value;
    }),
  create: publicProcedure
    .input(z.object({ userId: z.string(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No valid session"
        })
      }

      const updatedUser = await userRepository.update({ id: input.userId, name: input.name });

      if (updatedUser.isErr()) {
        throw new TRPCError({
          message: `Failed to update user's name: ${updatedUser.error.message}`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      const createResult = await create({
        id: crypto.randomUUID(),
        name: input.name,
        userId: input.userId,
      });

      if (createResult.isErr()) {
        throw new TRPCError({
          message: `Failed to create sign up: ${createResult.error.message}`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      return createResult.value;
    }),
});
