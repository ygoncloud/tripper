
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id?: string;
  }
}
