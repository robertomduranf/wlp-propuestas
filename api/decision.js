export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }

  const backend = String(process.env.APPS_SCRIPT_DEMO_URL || '').replace(/\/+$/, '');
  const bridgeSecret = String(process.env.WLP_BRIDGE_SECRET || '');
  if (!backend || !bridgeSecret) {
    return res.status(500).json({ ok: false, error: 'Puente de demos no configurado.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const payload = {
      api: 'decision',
      bridgeSecret,
      token: String(body.token || ''),
      action: String(body.action || ''),
      clientName: String(body.clientName || ''),
      comment: String(body.comment || '')
    };

    const upstream = await fetch(backend, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    const raw = await upstream.text();
    let data;
    try { data = JSON.parse(raw); }
    catch { throw new Error('El backend no devolvió JSON válido.'); }

    if (!data.ok) return res.status(400).json(data);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Error comunicando con el backend.' });
  }
}
