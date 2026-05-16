import type { Config } from 'drizzle-kit';

export default {
  schema: './database/schema.ts',
  out: './database/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    databaseId: '6a6e5d92-167f-4abe-8443-17e7cf0df3ea',
  },
} satisfies Config;