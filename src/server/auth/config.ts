import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthOptions } from "next-auth";
import { type Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";

import { db } from "~/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "~/server/db/schema";
import * as userRepository from "~/server/repository/userRepository";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    isAdmin: boolean;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    }),
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.isAdmin = user.isAdmin; 
      }

      const userCount = (await userRepository.getAll()).length;
        
      if (userCount === 1 && !user.isAdmin) {
        console.log('Setting first user admin');
        await userRepository.update({
          id: user.id,
          isAdmin: true
        });

        session.user.isAdmin = true;
      }

      return session; 
    },
    async redirect({ url, baseUrl }) {
      const devtoolsPath = '/.well-known/appspecific/com.chrome.devtools.json';
      
      if (url.includes(devtoolsPath)) {
        console.log(`[AUTH-FIX] Blocking redirect to DevTools URL: ${url}. Forcing to ${baseUrl}`);
        return baseUrl;
      }
      
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      return baseUrl;
    },
  },
} satisfies NextAuthOptions;
