const { Client } = require('pg');

export default async function handler(req, res) {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    const result = await client.query("SELECT * FROM homepage_content WHERE id = 1");
    await client.end();
    // Pokud nic nenajde, vrátí prázdný objekt nebo null, záleží na preferenci
    return res.status(200).json(result.rows[0] || {});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}