import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './electron/db/schema.ts',
  out: './electron/db/drizzle-migrations',
});
