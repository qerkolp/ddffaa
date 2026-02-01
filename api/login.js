import { Client } from 'pg';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");

    // Vercel parsuje body automaticky, pokud je Content-Type application/json
    const data = req.body;
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

    try {
        await client.connect();
        const result = await client.query("SELECT username, roles, avatar_url, bio FROM users WHERE username = $1 AND password = $2", [data.username, data.password]);
        await client.end();

        if (result.rows.length > 0) {
            return res.status(200).json({ user: result.rows[0] });
        }
        return res.status(401).json({ error: "Chyba přihlášení" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

}
