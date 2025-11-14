import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { getAll } from "~/server/repository/userRepository";

export const userRouter = createTRPCRouter({
  getAll: publicProcedure
    .query(async () => {
      return await getAll();
    }),
});
