module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const vecinos = JSON.parse(process.env.VECINOS || '[]');
    const seguros = vecinos.map(v => ({ parcela: v.parcela, nombre: v.nombre }));
    return res.status(200).json({ ok: true, vecinos: seguros, total: seguros.length });
  } catch {
    return res.status(500).json({ error: 'Error al cargar vecinos' });
  }
};
