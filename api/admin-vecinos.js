module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-pin');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const adminPin = req.headers['x-admin-pin'];
  if (adminPin !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: 'PIN incorrecto' });
  }

  const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID;
  const VERCEL_TOKEN   = process.env.VERCEL_TOKEN;

  if (req.method === 'GET') {
    try {
      const resp = await fetch(
        `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`,
        { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
      );
      const data = await resp.json();
      const item = (data.items || []).find(i => i.key === 'vecinos');
      return res.status(200).json({ ok: true, vecinos: item ? item.value : [] });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    const { vecinos } = req.body || {};
    if (!Array.isArray(vecinos)) {
      return res.status(400).json({ error: 'Se esperaba un array de vecinos' });
    }
    try {
      const resp = await fetch(
        `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: [{ operation: 'upsert', key: 'vecinos', value: vecinos }],
          }),
        }
      );
      if (!resp.ok) throw new Error(await resp.text());
      return res.status(200).json({ ok: true, total: vecinos.length });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
