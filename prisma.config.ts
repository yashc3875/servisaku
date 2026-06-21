import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Honor DATABASE_URL from .env (Postgres) rather than hardcoding a datasource URL.
export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
