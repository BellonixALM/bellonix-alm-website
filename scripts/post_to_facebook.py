#!/usr/bin/env python3
"""post_to_facebook.py

This script takes the latest generated article from `articles/manifest.json` 
and publishes it to the official Bellonix ALM Facebook Page using the Facebook Graph API.
It is intended to be run as part of the daily GitHub Action after article generation.
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
        # Sort by date (descending) or grab last item
        # Since manifest appends items, last item is the newest
        return manifest[-1]
    except Exception as e:
        print(f"[error] Failed to load manifest: {e}", file=sys.stderr)
        return None

def publish_to_facebook(article):
    # FB configuration from GitHub Secrets / Env variables
    page_id = "61591386574434"
    access_token = os.getenv("FACEBOOK_PAGE_ACCESS_TOKEN")
    
    if not access_token:
        print("[warning] FACEBOOK_PAGE_ACCESS_TOKEN is not set. Skipping Facebook auto-posting.", file=sys.stderr)
        return False
        
    title = article.get("title", "New Article")
    summary = article.get("summary", "")
    filename = article.get("file", "")
    lang = article.get("lang", "ua")
    
    # Target URL on our live website
    base_url = "https://bellonixalm.github.io/bellonix-alm-website/articles/"
    article_url = f"{base_url}{filename}"
    
    # Message formatting
    hashtag = "#automation #AI #logistics #FOP" if lang == "en" else "#автоматизація #ШІ #логістика #ФОП #бізнес"
    message = (
        f"📢 {title}\n\n"
        f"📝 {summary}\n\n"
        f"🔗 {article_url}\n\n"
        f"{hashtag} #BellonixALM"
    )
    
    # Facebook Graph API endpoint for Page feed posts
    url = f"https://graph.facebook.com/v19.0/{page_id}/feed"
    payload = {
        "message": message,
        "link": article_url,
        "access_token": access_token
    }
    
    try:
        print(f"[info] Posting article to Facebook: '{title}'...")
        response = requests.post(url, data=payload)
        res_data = response.json()
        
        if response.status_code == 200 and "id" in res_data:
            print(f"[success] Posted successfully! Post ID: {res_data['id']}")
            return True
        else:
            print(f"[error] Facebook API error: {res_data}", file=sys.stderr)
            return False
            
    except Exception as e:
        print(f"[error] Failed to communicate with Facebook Graph API: {e}", file=sys.stderr)
        return False

def main():
    article = get_latest_article()
    if not article:
        print("[error] No article found to publish.")
        sys.exit(1)
        
    success = publish_to_facebook(article)
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()
