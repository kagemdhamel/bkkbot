from PIL import Image, ImageDraw, ImageFont
from datetime import datetime
from io import BytesIO
import requests
import os

from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/api/generate_bkk", methods=["POST"])
def generate_bkk():
    data = request.json
    chat_id = data.get("chat_id")

    tanggal = data.get("tanggal", "")
    kepada = data.get("dibayarkan_kepada", "")
    uang = data.get("uang_sejumlah", "")
    rincian = data.get("rincian", [])
    disetujui = data.get("disetujui", "")

    # Load gambar & font
    img = Image.open("BKK Kosong.png")
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype("PlaypenSans-Regular.ttf", 19)
    font_bold = font

    # Tanggal dan bagian atas
    draw.text((160, 230), tanggal, font=font, fill="black")
    draw.text((310, 260), kepada, font=font, fill="black")
    draw.text((310, 290), uang, font=font, fill="black")
    draw.text((310, 320), tanggal, font=font, fill="black")

    # Rincian
    y_start = 380
    for i, item in enumerate(rincian):
        y = y_start + i * 40
        draw.text((75, y), str(i+1), font=font, fill="black")
        draw.text((280, y), item, font=font, fill="black")

    # Total Jumlah (hanya di bagian bawah saja)
    draw.text((750, 520), uang, font=font, fill="black")
    draw.text((700, 550), uang, font=font, fill="black")

    # Disetujui oleh
    draw.text((120, 670), disetujui, font=font, fill="black")

    # Simpan ke buffer
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    # Buat caption dengan format BKK-yymmdd-HHmm
    time_str = datetime.now().strftime("%y%m%d-%H%M")
    caption = f"BKK-{time_str}"

    # Kirim gambar ke Telegram
    bot_token = os.environ.get("BOT_TOKEN")
    telegram_url = f"https://api.telegram.org/bot{bot_token}/sendPhoto"
    files = {
        'photo': ("bkk.png", buffer, "image/png")
    }
    data = {
        'chat_id': chat_id,
        'caption': caption
    }
    response = requests.post(telegram_url, data=data, files=files)
    return jsonify({"status": "sent", "telegram_status": response.status_code})

