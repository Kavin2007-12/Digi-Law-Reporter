import pkg from 'pg';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const { Pool } = pkg;

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 300 }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'digi_law_reporter',
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 300
    };

export const pool = new Pool(poolConfig);

export let isDbOnline = false;

pool.connect()
  .then(client => {
    isDbOnline = true;
    client.release();
    logger.info('PostgreSQL Database Connected Successfully.');
  })
  .catch(err => {
    isDbOnline = false;
    logger.warn('PostgreSQL Offline: Instant localStore fallback activated.');
  });

pool.on('connect', () => {
  logger.debug('New connection established with PostgreSQL database.');
});

pool.on('error', (err) => {
  logger.error('PostgreSQL Connection Warning:', err.message);
});

// Helper for single queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    logger.error(`Error executing query: ${text}`, err);
    throw err;
  }
};

// Helper for transactions
export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Monkey patch the query method to keep track of the last query executed
  const timeout = setTimeout(() => {
    logger.error('A client has been checked out for more than 5 seconds!');
    logger.error(`The last executed query on this client was: ${client.lastQuery}`);
  }, 5000);

  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };

  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
};

export default pool;
