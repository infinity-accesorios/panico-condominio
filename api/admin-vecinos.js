module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-pin');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const adminPin = req.headers['x-admin-pin'];
  if (adminPin !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: 'PIN incorrecto' });
  }

  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  let EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID;

  // Extraer ID desde connection string si no está definido
  if (!EDGE_CONFIG_ID && process.env.EDGE_CONFIG) {
    const match = process.env.EDGE_CONFIG.match(/\/(ecfg_[^?]+)/);
    if (match) EDGE_CONFIG_ID = match[1];
  }

  if (req.method === 'GET') {
    try {
      // Leer item específico directamente
      const resp = await fetch(
        `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/item/vecinos`,
        { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
      );
      if (resp.status === 404) {
        return res.status(200).json({ ok: true, vecinos: [] });
      }
      const data = await resp.json();
      return res.status(200).json({ ok: true, vecinos: data.value || [] });
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
      const result = await resp.json();
      if (!resp.ok) throw new Error(JSON.stringify(result));
      return res.status(200).json({ ok: true, total: vecinos.length });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
