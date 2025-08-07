// This is a modified version of storage.ts with improved error handling and connection options
import "dotenv/config";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, desc, and, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import { 
  // Import your schema types here
} from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Add more connection options for better reliability
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // This might be needed for Supabase connections
  },
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  connectionTimeoutMillis: 10000,
});

// Add better error handling for the connection
async function connectWithRetry(maxRetries = 5, delay = 2000) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      console.log(`Attempting to connect to database (attempt ${retries + 1}/${maxRetries})...`);
      await client.connect();
      console.log("Database connection established successfully!");
      return;
    } catch (error) {
      retries++;
      console.error(`Connection attempt ${retries} failed:`, error);
      
      if (retries >= maxRetries) {
        console.error("Max retries reached. Could not connect to the database.");
        throw error;
      }
      
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Call this function instead of client.connect() in your main code
// connectWithRetry().then(() => {
//   console.log("Database connected and ready to use");
// }).catch(err => {
//   console.error("Failed to establish database connection:", err);
//   process.exit(1);
// });

// The rest of your storage implementation...
