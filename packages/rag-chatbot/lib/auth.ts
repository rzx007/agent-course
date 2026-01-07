import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { openAPI } from "better-auth/plugins"; // /api/auth/reference
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as authSchema from "../auth-schema";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [username(), openAPI()],
});
