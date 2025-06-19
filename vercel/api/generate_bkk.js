import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import { Blob } from 'buffer';
import FormData from 'form-data';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const {
      chat_id,
      tanggal,
      dibayarkan_kepada,
      uang_sejumlah,
      rincian = [],
      disetujui
    } = req.body;

    const fontPath = path.join(__dirname, 'PlaypenSans-Regular.ttf');
    GlobalFonts.registerFromPath(fontPath, 'Playpen');

    const image = await loadImage(path.join(__dirname, 'BKK Kosong.png'));
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0);
    ctx.font = '19px Playpen';
    ctx.fillStyle = 'black';

    ctx.fillText(tanggal, 160, 230);
    ctx.fillText(dibayarkan_kepada, 310, 260);
    ctx.fillText(uang_sejumlah, 310, 290);
    ctx.fillText(tanggal, 310, 320);

    let y = 380;
    rincian.forEach((item, i) => {
      ctx.fillText(String(i + 1), 75, y);
      ctx.fillText(item, 280, y);
      y += 40;
    });

    ctx.fillText(uang_sejumlah, 750, 520);
    ctx.fillText(uang_sejumlah, 700, 550);
    ctx.fillText(disetujui, 120, 670);

    const buffer = canvas.toBuffer('image/png');

    const botToken = process.env.BOT_TOKEN;
    const now = new Date();
    const time = `${String(now.getFullYear()).slice(2)}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    const caption = `BKK-${time}`;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
    const form = new FormData();
    form.append('chat_id', chat_id);
    form.append('caption', caption);
    form.append('photo', buffer, 'bkk.png');

    await fetch(telegramUrl, {
      method: 'POST',
      body: form
    });

    res.status(200).json({ status: 'sent' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error: ' + err.message);
  }
}
