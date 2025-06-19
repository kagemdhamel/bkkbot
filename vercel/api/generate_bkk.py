from PIL import Image, ImageDraw, ImageFont
from datetime import datetime
from io import BytesIO
import base64
import json
import os
import requests

def handler(request):
    try:
        if request["method"] != "POST":
            return {
                "statusCode": 405,
                "headers": {"Content-Type": "text/plain"},
                "body": "Method Not Allowed"
            }

        body = json.loads(request["body"])
        chat_id = body.get("chat_id")

        tanggal = body.get("tanggal", "")
        kepada = body.get("dibayarkan_kepada", "")
        uang = body.get("uang_sejumlah", "")
        rincian = body.get("rincian", [])
        disetujui = body.get("disetujui", "")

        img = Image.open("api/BKK Kosong.png")
        draw = ImageDraw.Draw(img)
        font = ImageFont.truetype("api/PlaypenSans-Regular.ttf", 19)

        draw.text((160, 230), tanggal, font=font, fill="black")
        draw.text((310, 260), kepada, font=font, fill="black")
        draw.text((310, 290), uang, font=font, fill="black")
        draw.text((310, 320), tanggal, font=font, fill="black")

        y_start = 380
        for i, item in enumerate(rincian):
            y = y_start + i * 40
            draw.text((75, y), str(i+1), font=font, fill="black")
            draw.text((280, y), item, font=font, fill="black")

        draw.text((750, 520), uang, font=font, fill="black")
        draw.text((700, 550), uang, font=font, fill="black")
        draw.text((120, 670), disetujui, font=font, fill="black")

        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)

        bot_token = os.environ.get("BOT_TOKEN")
        time_str = datetime.now().strftime("%y%m%d-%H%M")
        caption = f"BKK-{time_str}"

        telegram_url = f"https://api.telegram.org/bot{bot_token}/sendPhoto"
        files = {
            'photo': ("bkk.png", buffer, "image/png")
        }
        data = {
            'chat_id': chat_id,
            'caption': caption
        }
        r = requests.post(telegram_url, data=data, files=files)

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"status": "sent", "telegram_status": r.status_code})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "text/plain"},
            "body": "Error: " + str(e)
        }
