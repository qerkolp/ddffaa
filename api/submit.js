const { Client } = require('pg');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");

  const data = req.body;
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const WEBHOOK_URL = "https://discord.com/api/webhooks/1466608052429131877/kENrrrgopN_91XmNk6qyiOjagRnW3t7vz9qOTtQfxuh0hehH5XSEd-QP-36UFze_KuxM";

  try {
    await client.connect();

    // 1. Uložit do DB
    const query = `
      INSERT INTO applications 
      (discord, age_ooc, experience, why_us, rp_plans, def_mg, def_rp, def_failrp, def_ck, def_pk, pk_ticket) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;
    const values = [
      data.discord, data.age_ooc, data.experience,
      data.why_us, data.rp_plans, data.def_mg,
      data.def_rp, data.def_failrp, data.def_ck,
      data.def_pk, data.pk_ticket
    ];
    await client.query(query, values);
    await client.end();

    // 2. Poslat Webhook na Discord
    if (WEBHOOK_URL) {
      // Fetch je v Node.js 18+ (což Vercel používá) nativní, není třeba importovat
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "📝 Nová Žádost o Whitelist",
            color: 3066993,
            fields: [
              { name: "Uživatel", value: data.discord, inline: true },
              { name: "Věk", value: String(data.age_ooc), inline: true }, // Převod na string pro jistotu
              { name: "Zkušenosti", value: data.experience, inline: true },
              { name: "Motivace", value: data.why_us.substring(0, 1000) }
            ],
            footer: { text: "Odesláno z Webu City of Prague" },
            timestamp: new Date().toISOString()
          }]
        })
      }).catch(err => console.error("Webhook error:", err));
    }

    return res.status(200).json({ message: "Uloženo!" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}