#!/usr/bin/env python3
"""post_to_telegram.py

This script takes the latest generated article from `articles/manifest.json` 
and publishes a formatted post to the @Bellonix_ALM Telegram Channel 
using the Telegram Bot API.
It runs as part of the daily GitHub Action.
"""

import os
import sys
import json
import requests
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MANIFEST_PATH = BASE_DIR / "articles" / "manifest.json"

def get_latest_article():
    if not MANIFEST_PATH.exists():
        print("[error] Manifest manifest.json not found.", file=sys.stderr)
        return None
    try:
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        if not manifest:
            print("[info] Manifest is empty.", file=sys.stderr)
            return None
        return manifest[-1]
    except Exception as e:
        print(f"[error] Failed to load manifest: {e}", file=sys.stderr)
        return None

def publish_to_telegram(article):
    # Channel target username (from your input)
    channel_id = "@Bellonix_ALM"
    
    # We use the existing bot token set in repository secrets
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    
    if not bot_token:
        print("[warning] TELEGRAM_BOT_TOKEN is not set. Skipping Telegram channel auto-posting.", file=sys.stderr)
        return False
        
    title = article.get("title", "New Article")
    summary = article.get("summary", "")
    filename = article.get("file", "")
    lang = article.get("lang", "ua")
    
    # Target URL on our live website
    base_url = "https://bellonixalm.github.io/bellonix-alm-website/articles/"
    article_url = f"{base_url}{filename}"
    
    # Message formatting with Markdown
    hashtag = "#automation #AI #logistics #FOP" if lang == "en" else "#автоматизація #ШІ #логістика #ФОП #бізнес"
    message = (
        f"📢 *{title}*\n\n"
        f"📝 {summary}\n\n"
        f"🔗 [Читати статтю на сайті]({article_url})\n\n"
        f"{hashtag} #BellonixALM"
    )
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": channel_id,
        "text": message,
        "parse_mode": "Markdown",
        "disable_web_page_preview": False
    }
    
    try:
        print(f"[info] Posting article to Telegram Channel {channel_id}: '{title}'...")
        response = requests.post(url, json=payload)
        res_data = response.json()
        
        if response.status_code == 200 and res_data.get("ok"):
            print(f"[success] Posted successfully to Telegram! Msg ID: {res_data['result']['message_id']}")
            return True
        else:
            print(f"[error] Telegram API error: {res_data}", file=sys.stderr)
            return False
            
    except Exception as e:
        print(f"[error] Failed to communicate with Telegram API: {e}", file=sys.stderr)
        return False

def main():
    article = get_latest_article()
    if not article:
        print("[error] No article found to publish.")
        sys.exit(1)
        
    success = publish_to_telegram(article)
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()
