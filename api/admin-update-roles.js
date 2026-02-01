import { Client } from 'pg';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");

    const data = req.body;

    if (data.newRoles.length > 2) {
        return res.status(400).json({ error: "Maximálně 2 role!" });
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

    try {
        await client.connect();
        // 1. Ověření admina
        const checkAdmin = await client.query("SELECT roles FROM users WHERE username = $1 AND password = $2", [data.adminUsername, data.adminPassword]);

        if (checkAdmin.rows.length === 0) {
            await client.end();
            return res.status(403).json({ error: "Nemáš právo." });
        }

        const adminRoles = checkAdmin.rows[0].roles;
        const allowedRoles = ['founder', 'co-founder', 'head manager', 'manager', 'head dev', 'developer'];
        const hasPermission = adminRoles.some(r => allowedRoles.includes(r));

        if (!hasPermission) {
            await client.end();
            return res.status(403).json({ error: "Nízký rank." });
        }

        // 2. Update rolí
        await client.query("UPDATE users SET roles = $1 WHERE username = $2", [data.newRoles, data.targetUsername]);

        await client.end();
        return res.status(200).json({ message: "Role upraveny!" });
    } catch (error) {
        await client.end(); // Bezpečné ukončení
        return res.status(500).json({ error: error.message });
    }

}
