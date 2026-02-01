import { Client } from 'pg';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");

    const data = req.body;
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

    try {
        await client.connect();
        await client.query("INSERT INTO users (username, password) VALUES ($1, $2)", [data.username, data.password]);
        await client.end();
        return res.status(200).json({ message: "OK" });
    } catch (error) {
        await client.end(); // Ujistit se, že se spojení ukončí i při chybě
        return res.status(500).json({ error: "Jméno zabráno." });
    }

}
