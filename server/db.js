import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool, Client } = pg;

pg.types.setTypeParser(1700, (value) => parseFloat(value));

const dir = path.dirname(fileURLToPath(import.meta.url));

const settings = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
};

const databaseName = process.env.DB_NAME || 'delizioso';

export const pool = new Pool({ ...settings, database: databaseName });

export async function createDatabase() {
    const client = new Client({ ...settings, database: 'postgres' });
    await client.connect();
    try {
        const found = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
        if (found.rowCount === 0) {
            await client.query(`CREATE DATABASE "${databaseName}"`);
            console.log(`Database ${databaseName} created`);
        }
    } finally {
        await client.end();
    }
}

export async function initDatabase() {
    const schema = fs.readFileSync(path.join(dir, 'db', 'schema.sql'), 'utf8');
    const seed = fs.readFileSync(path.join(dir, 'db', 'seed.sql'), 'utf8');
    await pool.query(schema);
    await pool.query(seed);
}

export async function transaction(work) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await work(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}
