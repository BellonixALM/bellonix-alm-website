#!/usr/bin/env python3
"""generate_article.py

Щоденний скрипт, який:
1. Читає список тем із `topics.txt`.
2. Випадковим чином обирає тему.
3. Використовує Gemini API (модель gemini-1.5-flash) для генерації статті у форматі Markdown.
4. Записує результат у `articles/YYYY-MM-DD.md`.
5. Оновлює `articles/manifest.json` з метаданими статті (title, date, summary, image, file).
"""

import os, sys, random, datetime, json, re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
TOPICS_FILE = BASE_DIR / "topics.txt"
ARTICLES_DIR = BASE_DIR / "articles"
ARTICLES_DIR.mkdir(exist_ok=True)
MANIFEST_PATH = ARTICLES_DIR / "manifest.json"

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
        # простий шаблон, якщо ключ відсутній
        return f"---\ntitle: \"{topic}\"\ndate: \"{datetime.date.today()}\"\nsummary: \"Коротка анотація про {topic.lower()}.\"\nimage: \"placeholder.png\"\n---\n\n![]( {{image}} )\n\n## {topic}\n\nТут розгорнутий матеріал статті про {topic.lower()}…\n"
    import requests
    prompt = (
        f"Напиши професійну, розгорнуту та корисну статтю українською мовою на тему: '{topic}'.\n"
        "Стаття має бути орієнтована на бізнес-аудиторію (керівників, власників компаній, логістів).\n"
        "Обов'язково почни статтю з YAML Front Matter у наступному форматі:\n"
        "---\n"
        f"title: \"[Привабливий професійний заголовок про {topic}]\"\n"
        f"date: \"{datetime.date.today()}\"\n"
        f"summary: \"[Короткий професійний опис статті на 2-3 речення українською мовою]\"\n"
        "image: \"placeholder.png\"\n"
        "---\n\n"
        "Далі напиши структурований текст статті українською мовою з підзаголовками, практичними порадами, прикладами впровадження (наприклад, зв'язок 1С, GPS-трекерів чи Telegram-ботів) та висновком."
    )
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
    update_manifest(file_path, content)

def update_manifest(file_path, content):
    # Extract front‑matter between the first pair of ---
    fm_match = re.search(r"---\n(.*?)\n---", content, re.DOTALL)
    meta = {}
    if fm_match:
        for line in fm_match.group(1).splitlines():
            if ":" in line:
                key, val = line.split(":", 1)
                meta[key.strip()] = val.strip().strip('"')
    entry = {
        "title": meta.get("title", "Untitled"),
        "date": meta.get("date", datetime.date.today().isoformat()),
        "summary": meta.get("summary", ""),
        "image": meta.get("image", "placeholder.png"),
        "file": file_path.name
    }
    # Load existing manifest (create if missing)
    if MANIFEST_PATH.exists():
        try:
            manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        except Exception:
            manifest = []
    else:
        manifest = []
    manifest.append(entry)
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Manifest updated with {file_path.name}")

def main():
    topics = load_topics()
    topic = pick_topic(topics)
    api_key = os.getenv("GEMINI_API_KEY")
    content = generate_content(topic, api_key)
    save_article(content)

if __name__ == "__main__":
    main()
