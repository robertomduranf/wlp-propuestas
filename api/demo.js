export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Método no permitido.');
  }

  const backend = String(process.env.APPS_SCRIPT_DEMO_URL || '').replace(/\/+$/, '');
  const bridgeSecret = String(process.env.WLP_BRIDGE_SECRET || '');
  const lookup = String(req.query?.lookup || req.query?.token || '').trim();

  if (!backend || !bridgeSecret) {
    return sendError(res, 500, 'Puente de demos no configurado.');
  }
  if (!lookup) {
    return sendError(res, 400, 'Enlace de propuesta inválido.');
  }

  try {
    const upstream = await fetch(backend, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api: 'demoHtml',
        bridgeSecret,
        lookup
      }),
      redirect: 'follow'
    });

    const raw = await upstream.text();
    let data;
    try { data = JSON.parse(raw); }
    catch { throw new Error('El backend de demos no devolvió JSON válido.'); }

    if (!data.ok || !data.html) {
      return sendError(res, Number(data.code || 404), data.error || 'La propuesta no está disponible.');
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).send(String(data.html));
  } catch (error) {
    return sendError(res, 502, error?.message || 'No se pudo comunicar con el servidor de demos.');
  }
}

function sendError(res, status, message) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  const safe = escapeHtml(message);
  return res.status(status).send(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Propuesta no disponible</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#070a10;color:#fff;font:14px system-ui;padding:24px}.box{width:min(520px,100%);box-sizing:border-box;background:#111722;border:1px solid #293246;border-radius:18px;padding:24px}h1{margin:0 0 8px;font-size:22px}p{margin:0;color:#aeb9cc;line-height:1.6}</style></head><body><main class="box"><h1>Propuesta no disponible</h1><p>${safe}</p></main></body></html>`);
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
