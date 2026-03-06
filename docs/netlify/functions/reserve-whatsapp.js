exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const nombre = (body.nombre || '').trim();
    const fecha = (body.fecha || '').trim();
    const hora = (body.hora || '').trim();
    const cancha = (body.cancha || '').trim();
    const whatsappRaw = String(body.whatsapp || '');
    const digits = whatsappRaw.replace(/\D/g, '');

    if (!digits || digits.length < 10) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'WhatsApp inválido' }),
      };
    }

    const clientNumber = digits.length === 10 ? `+52${digits}` : `+${digits}`;

    // Twilio WhatsApp env vars
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886
    const notifyTo = process.env.CLUB_NOTIFY_WHATSAPP || 'whatsapp:+526122136456';

    if (!accountSid || !authToken || !fromWhatsApp) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: false,
          error: 'Faltan credenciales TWILIO_* en Netlify env vars',
          pendingContact: clientNumber,
        }),
      };
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const sendTwilio = async ({ to, message }) => {
      const params = new URLSearchParams();
      params.append('From', fromWhatsApp);
      params.append('To', to.startsWith('whatsapp:') ? to : `whatsapp:${to}`);
      params.append('Body', message);

      const res = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(`Twilio ${res.status}: ${text}`);
      return text;
    };

    const msgCliente = `Hola ${nombre || 'jugador/a'}, recibimos tu información de reserva en Viper Pádel Club ✅ Te esperamos en el club 🎾`;
    const msgClub = [
      'Nueva reserva web ✅',
      `Nombre: ${nombre || 'N/D'}`,
      `Fecha: ${fecha || 'N/D'}`,
      `Hora: ${hora || 'N/D'}`,
      `Cancha: ${cancha || 'N/D'}`,
      `WhatsApp cliente: ${clientNumber}`,
    ].join('\n');

    await sendTwilio({ to: clientNumber, message: msgCliente });
    await sendTwilio({ to: notifyTo, message: msgClub });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, clientNumber }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: err.message || 'Error interno' }),
    };
  }
};
