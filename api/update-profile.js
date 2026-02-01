const { Client } = require('pg');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");

    const data = req.body;
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

    try {
        await client.connect();

        // 1. Zkontrolujeme, zda sedí heslo
        const verify = await client.query("SELECT * FROM users WHERE username = $1 AND password = $2", [data.username, data.password]);
        if (verify.rows.length === 0) {
            await client.end();
            return res.status(403).json({ error: "Špatné heslo! Změny neuloženy." });
        }

        // 2. Provedeme update
        await client.query(
            "UPDATE users SET avatar_url = $1, bio = $2 WHERE username = $3",
            [data.newAvatar, data.newBio, data.username]
        );

        // 3. Vrátíme aktualizovaná data
        const updatedUser = await client.query("SELECT * FROM users WHERE username = $1", [data.username]);

        await client.end();
        return res.status(200).json({ message: "Uloženo!", user: updatedUser.rows[0] });

    } catch (error) {
        await client.end();
        return res.status(500).json({ error: error.message });
    }
}