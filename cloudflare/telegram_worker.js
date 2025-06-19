export default {
  async fetch(request, env, ctx) {
    const BOT_TOKEN = env.BOT_TOKEN;
    const VERCEL_ENDPOINT = env.VERCEL_ENDPOINT;

    if (request.method !== 'POST') {
      return new Response('Only POST allowed', { status: 405 });
    }

    const payload = await request.json();
    const message = payload.message || payload.edited_message;
    if (!message || !message.text) return new Response('No message', { status: 200 });

    const chat_id = message.chat.id;
    const text = message.text.trim();

    // /start
    if (text === '/start') {
      const welcome = `Selamat datang di BKK Generator Bot!\nSilahkan isi keperluan BKK yang kamu ingin generate.\nTekan /bkk untuk memulai generate baru.`;
      await sendMessage(BOT_TOKEN, chat_id, welcome);
      return new Response('ok');
    }

    // /bkk
    if (text === '/bkk') {
      const form = `Silakan salin dan isi data berikut:\n\nTanggal : \nDibayarkan Kepada : \nUang Sejumlah : \nRincian : \nDisetujui oleh :`;
      await sendMessage(BOT_TOKEN, chat_id, form);
      return new Response('ok');
    }

    // Parsing form manual
    if (text.includes('Tanggal') && text.includes('Dibayarkan Kepada')) {
      const parsed = parseBkkForm(text);
      if (!parsed) {
        await sendMessage(BOT_TOKEN, chat_id, '⚠️ Format tidak dikenali. Pastikan sesuai contoh!');
        return new Response('ok');
      }

      // Kirim ke Vercel
      const result = await fetch(`${VERCEL_ENDPOINT}/api/generate_bkk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsed, chat_id }),
      });

      if (result.ok) {
        return new Response('success');
      } else {
        await sendMessage(BOT_TOKEN, chat_id, '❌ Gagal membuat BKK. Coba lagi.');
        return new Response('error', { status: 500 });
      }
    }

    return new Response('ignored', { status: 200 });
  },
};

async function sendMessage(token, chat_id, text) {
  return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text }),
  });
}

function parseBkkForm(text) {
  const lines = text.split('\n');
  const data = {
    tanggal: '',
    dibayarkan_kepada: '',
    uang_sejumlah: '',
    rincian: [],
    disetujui: ''
  };

  let mode = 'init';

  for (let line of lines) {
    const clean = line.trim();
    if (clean.startsWith('Tanggal')) data.tanggal = clean.split(':')[1]?.trim();
    else if (clean.startsWith('Dibayarkan Kepada')) data.dibayarkan_kepada = clean.split(':')[1]?.trim();
    else if (clean.startsWith('Uang Sejumlah')) data.uang_sejumlah = clean.split(':')[1]?.trim();
    else if (clean.startsWith('Rincian')) mode = 'rincian';
    else if (clean.startsWith('Disetujui oleh')) {
      data.disetujui = clean.split(':')[1]?.trim();
      mode = 'done';
    }
    else if (mode === 'rincian' && clean.length > 2) {
      data.rincian.push(clean.replace(/^-/, '').trim());
    }
  }

  if (data.tanggal && data.dibayarkan_kepada && data.uang_sejumlah) {
    return data;
  }

  return null;
}
