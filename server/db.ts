import dotenv from 'dotenv';
dotenv.config();


import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { log } from './vite';

// Initialize postgres client with environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// For query execution
export const client = postgres(connectionString);
log('Database connection initialized', 'postgres');

// Initialize drizzle with the client
export const db = drizzle(client);
