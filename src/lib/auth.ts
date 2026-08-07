import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
import * as schema from "@/db/schema"; // your drizzle schema

// Comma-separated list of extra origins to trust (e.g. an ngrok tunnel or an
// alternate local port during dev). Set via env instead of committing
// personal/ephemeral URLs to source.
const additionalTrustedOrigins =
  process.env.TRUSTED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

export const auth = betterAuth({
    trustedOrigins: [
      process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
      ...additionalTrustedOrigins,
    ],
    socialProviders: {
        github: { 
            clientId: process.env.GITHUB_CLIENT_ID as string, 
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        }, 
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 

    },
    emailAndPassword: { 
    enabled: true, 
  }, 
   database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema:{
            ...schema
        },

    }),
});
