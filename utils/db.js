import { Pool } from 'pg';

let pool;

if (!process.env.DATABASE_URL) {
  throw new Error('Please add your Neon DATABASE_URL to .env.local');
}

// Create a connection pool
const createPool = () => {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
};

export async function connectToDatabase() {
  try {
    if (!pool) {
      pool = createPool();
    }

    // Test the connection
    const client = await pool.connect();
    client.release();

    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export async function query(text, params) {
  try {
    if (!pool) {
      pool = createPool();
    }

    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default pool;