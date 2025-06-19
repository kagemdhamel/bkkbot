# 🤖 BKKBot — Telegram Bot Generator Nota BKK (Serverless)

Bot Telegram yang membantu generate **Bukti Kas Keluar (BKK)** dari form teks, dan mengembalikannya dalam bentuk gambar nota, 100% serverless:

* 🔹 Cloudflare Worker → menerima perintah `/start`, `/bkk`, dan input form
* ⚫ Vercel Serverless Python → proses gambar BKK dan kirim kembali ke Telegram

---

## 🗂 Struktur Project

```
bkkbot-project/
├── cloudflare/
│   └── telegram_worker.js
├── vercel/
│   └── api/
│       ├── generate_bkk.py
│       ├── BKK Kosong.png
│       └── PlaypenSans-Regular.ttf
└── README.md
```

---

## ⚙️ Setup & Deploy

### 1. 🚀 Deploy `vercel/api/generate_bkk.py` ke Vercel

* Install [Vercel CLI](https://vercel.com/docs/cli) jika perlu
* Pastikan kamu punya akun Vercel dan sudah login

```bash
cd vercel
vercel
```

* Set Environment Variable:

  * `BOT_TOKEN` = Token dari @BotFather

Atau via CLI:

```bash
vercel env add BOT_TOKEN
```

---

### 2. 🌐 Deploy `cloudflare/telegram_worker.js`

* Masuk ke dashboard [Cloudflare Workers](https://dash.cloudflare.com/)
* Buat Worker baru dan paste isi `telegram_worker.js`
* Set **Environment Variables**:

| Nama              | Isi                                 |
| ----------------- | ----------------------------------- |
| `BOT_TOKEN`       | Token bot dari @BotFather           |
| `VERCEL_ENDPOINT` | Contoh: `https://bkkbot.vercel.app` |

---

### 3. 🤖 Set Webhook Telegram

Set webhook bot ke alamat worker kamu:

```bash
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-worker-name.workers.dev
```

Contoh:

```bash
https://api.telegram.org/bot123456:ABCDEF/setWebhook?url=https://bkkbot-worker.kamu.workers.dev
```

---

## 📥 Format Form yang Diketik User

Ketik `/bkk` lalu salin dan isi template berikut:

```
Tanggal : 19 Juni 2025
Dibayarkan Kepada : Ahmad Yusuf
Uang Sejumlah : Rp 1.250.000
Rincian :
- Pembelian bahan kemas
- Transport pengiriman
Disetujui oleh : Ust. Slamet
```

Bot akan otomatis membalas gambar nota BKK dengan caption:

```
BKK-250619-1630
```

---

## 🗈 Output Contoh

> Format gambar hasil akan sesuai template `BKK Kosong.png` dan font Playpen Sans.

---

## 🧑‍💻 Developer

Created by \[YourName] — Based on ChatGPT-powered integration with Python, Telegram API, Vercel, and Cloudflare Workers.
