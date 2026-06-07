const twilio = require('twilio');

const ACCOUNT_SID    = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN     = process.env.TWILIO_AUTH_TOKEN;
const FROM_NUMBER    = process.env.TWILIO_PHONE_NUMBER;
const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID;
const VERCEL_TOKEN   = process.env.VERCEL_TOKEN;

async function getVecinos() {
  try {
    // Intentar desde Edge Config primero
    if (EDGE_CONFIG_ID && VERCEL_TOKEN) {
      const resp = await fetch(
        `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`,
        { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
      );
      const data = await resp.json();
      const item = (data.items || []).find(i => i.key === 'vecinos');
      if (item && item.value && item.value.length > 0) return item.value;
    }
  } catch {}
  // Fallback a variable de entorno
  try { return JSON.parse(process.env.VECINOS || '[]'); } catch { return []; }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { parcela, nombre, pin } = req.body || {};

  if (pin !== process.env.PANIC_PIN) {
    return res.status(401).json({ error: 'PIN incorrecto' });
  }

  if (!parcela) return res.status(400).json({ error: 'Falta número de parcela' });

  const vecinos = await getVecinos();
  if (vecinos.length === 0) return res.status(500).json({ error: 'No hay vecinos registrados' });

  const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

  const mensaje = `<Response>
    <Say language="es-MX" voice="Polly.Mia">
      Alerta de emergencia. Alerta de emergencia.
      El vecino de la Parcela ${parcela}${nombre ? `, ${nombre},` : ''}
      necesita ayuda urgente.
      Por favor acuda o comuníquese con sus vecinos inmediatamente.
      Repito. Parcela ${parcela} necesita ayuda urgente.
    </Say>
  </Response>`;

  const timestamp = new Date().toISOString();
  const resultados = [];

  await Promise.all(vecinos.map(async (vecino) => {
    try {
      const call = await client.calls.create({ twiml: mensaje, to: vecino.telefono, from: FROM_NUMBER });
      resultados.push({ parcela: vecino.parcela, nombre: vecino.nombre, status: 'llamando', sid: call.sid });
    } catch (err) {
      resultados.push({ parcela: vecino.parcela, nombre: vecino.nombre, status: 'error', error: err.message });
    }
  }));

  return res.status(200).json({ ok: true, parcela, timestamp, llamadas: resultados.length, detalle: resultados });
};
