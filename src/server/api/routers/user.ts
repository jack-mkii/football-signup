import z from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { getAll, update } from "~/server/repository/userRepository";

export const userRouter = createTRPCRouter({
  getAll: publicProcedure
    .query(async () => {
      return await getAll();
    }),
  
  setAdmin: publicProcedure
    .input(z.object({ userId: z.string(), isAdmin: z.boolean() }))
    .mutation(async (opts) => {
      return await update({ id: opts.input.userId, isAdmin: opts.input.isAdmin });
    })
});
