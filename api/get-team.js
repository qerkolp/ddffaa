import { Client } from 'pg';

export default async function handler(req, res) {
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

    try {
        await client.connect();
        const result = await client.query("SELECT username, roles, avatar_url, bio FROM users WHERE roles != ARRAY['user']");
        await client.end();
        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

}
