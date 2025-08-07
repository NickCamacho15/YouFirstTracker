// Simple script to test database connection
import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;

console.log('DATABASE_URL from env:', process.env.DATABASE_URL);

// Try with direct connection string
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');
    
    const result = await client.query('SELECT current_timestamp');
    console.log('Database time:', result.rows[0].current_timestamp);
    
    await client.end();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

testConnection();