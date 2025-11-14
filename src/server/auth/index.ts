import NextAuth from "next-auth";
import { getServerSession } from "next-auth";

import { authConfig } from "./config";
import type { GetServerSidePropsContext } from "next";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };

export const auth = (context: { req: GetServerSidePropsContext["req"]; res: GetServerSidePropsContext["res"] }) => {
  return getServerSession(context.req, context.res, authConfig);
};
