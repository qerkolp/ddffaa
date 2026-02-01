import { Client } from 'pg';

export default async function handler(req, res) {
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

    try {
        await client.connect();
        const result = await client.query("SELECT id, username, roles FROM users ORDER BY id ASC");
        await client.end();
        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
} const { Client } = require('pg');
exports.handler = async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    try {
        await client.connect();
        const result = await client.query("SELECT id, username, roles FROM users ORDER BY id ASC");
        await client.end();
        return { statusCode: 200, body: JSON.stringify(result.rows) };
    } catch (error) { return { statusCode: 500, body: JSON.stringify({ error: error.message }) }; }

};
