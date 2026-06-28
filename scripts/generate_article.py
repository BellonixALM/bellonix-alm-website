#!/usr/bin/env python3
"""generate_article.py

Щоденний скрипт, який:
1. Читає список тем із `topics.txt`.
2. Випадковим чином обирає тему.
3. Використовує Gemini API (безкоштовний) для генерації статті у форматі Markdown.
4. Записує результат у `articles/YYYY-MM-DD.md`.

Якщо GEMINI_API_KEY не задано — генерує простий шаблон lorem ipsum.
"""

import os, sys, random, datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
TOPICS_FILE = BASE_DIR / "topics.txt"
ARTICLES_DIR = BASE_DIR / "articles"
ARTICLES_DIR.mkdir(exist_ok=True)

def load_topics():
    if not TOPICS_FILE.exists():
        print("[error] topics.txt not found", file=sys.stderr)
        sys.exit(1)
    with open(TOPICS_FILE, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip()]

def pick_topic(topics):
    return random.choice(topics)

def generate_content(topic, api_key=None):
    if not api_key:
        # простий шаблон
        return f"---\ntitle: \"{topic}\"\ndate: \"{datetime.date.today()}\"\nsummary: \"Коротка анотація про {topic.lower()}.\"\nimage: \"placeholder.png\"\n---\n\n![]( {{image}} )\n\n## {topic}\n\nТут розгорнутий матеріал статті про {topic.lower()}…\n"
    import requests, json
    prompt = f"Напиши статтю у форматі Markdown на тему '{topic}'. Включи коротку анотацію, заголовок, приклад коду, та просту діаграму Mermaid."
    headers = {"Content-Type": "application/json"}
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    data = {"contents": [{"role": "user", "parts": [{"text": prompt}]}]}
    resp = requests.post(url, headers=headers, json=data)
    if resp.status_code != 200:
        raise RuntimeError(f"Gemini API error: {resp.status_code} {resp.text}")
    result = resp.json()
    try:
        return result["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        raise RuntimeError(f"Unexpected Gemini response format: {e}")

def save_article(content):
    today = datetime.date.today().isoformat()
    file_path = ARTICLES_DIR / f"{today}.md"
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Article saved to {file_path}")

def main():
    topics = load_topics()
    topic = pick_topic(topics)
    api_key = os.getenv("GEMINI_API_KEY")
    content = generate_content(topic, api_key)
    save_article(content)

if __name__ == "__main__":
    main()
