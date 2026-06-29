#!/usr/bin/env python3
"""generate_article.py

Щоденний скрипт, який:
1. Читає список тем із `topics.txt`.
2. Випадковим чином обирає тему.
3. Використовує Gemini API для генерації статті у форматі JSON (title, summary, content_html).
4. Записує результат у повноцінний HTML-документ `articles/YYYY-MM-DD.html`.
5. Оновлює `articles/manifest.json`.
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
        return {
            "title": topic,
            "summary": f"Коротка анотація про {topic.lower()}.",
            "content_html": f"<h1>{topic}</h1>\n<p>Тут розгорнутий матеріал статті про {topic.lower()}…</p>"
        }
    
    import requests
    prompt = (
        f"Напиши професійну, розгорнуту та корисну статтю українською мовою на тему: '{topic}'.\n"
        "Стаття має бути орієнтована на бізнес-аудиторію (керівників, власників компаній, логістів).\n"
        "Обов'язково зроби акцент на ботах (Telegram/Viber), зручності їх використання, а також на функціональних дашбордах, які дозволяють оперативно приймати управлінські рішення.\n"
        "Поверни результат виключно у форматі JSON з наступною структурою (без жодних markdown-тегів на кшталт ```json):\n"
        "{\n"
        "  \"title\": \"Привабливий заголовок\",\n"
        "  \"summary\": \"Короткий опис на 2-3 речення\",\n"
        "  \"content_html\": \"<h1>Заголовок</h1><p>Абзац тексту з інтегрованими HTML-тегами для форматування (h2, p, ul, li, strong тощо)...</p>\"\n"
        "}"
    )
    headers = {"Content-Type": "application/json"}
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    data = {"contents": [{"role": "user", "parts": [{"text": prompt}]}]}
    resp = requests.post(url, headers=headers, json=data)
    if resp.status_code != 200:
        raise RuntimeError(f"Gemini API error: {resp.status_code} {resp.text}")
    result = resp.json()
    try:
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        # Очистимо можливе markdown-обгортання JSON
        text_clean = re.sub(r"^```json\s*", "", text.strip())
        text_clean = re.sub(r"\s*```$", "", text_clean)
        return json.loads(text_clean)
    except Exception as e:
        raise RuntimeError(f"Unexpected Gemini response format: {e}\nRaw output: {text}")

def save_article(article_data):
    today = datetime.date.today().isoformat()
    file_path = ARTICLES_DIR / f"{today}.html"
    
    title = article_data.get("title", "Без назви")
    summary = article_data.get("summary", "")
    content_html = article_data.get("content_html", "")
    
    # Створюємо повний HTML шаблон
    html_content = f"""<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8">
<title>{title}</title>
<meta name="description" content="{summary}">
<link rel="stylesheet" href="../styles.css">
<link rel="icon" type="image/x-icon" href="../favicon.ico?v=3">
<link rel="icon" type="image/png" href="../favicon.png?v=3">
<link rel="apple-touch-icon" href="../favicon.png?v=3">
</head>
<body>
<article style="max-width: 800px; margin: 2rem auto; padding: 2rem; color: var(--color-text-white, #e0e0e0);">
<p style="opacity:0.7; margin-bottom:2rem;">{today}</p>
{content_html}
</article>
</body>
</html>
"""
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Article saved to {file_path}")
    update_manifest(file_path, title, summary)

def update_manifest(file_path, title, summary):
    entry = {
        "title": title,
        "date": datetime.date.today().isoformat(),
        "summary": summary,
        "image": "bas_efficiency.png", # За замовчуванням
        "file": file_path.name
    }
    if MANIFEST_PATH.exists():
        try:
            manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        except Exception:
            manifest = []
    else:
        manifest = []
        
    # Запобігаємо дублюванню на той самий день
    manifest = [item for item in manifest if item.get("file") != file_path.name]
    manifest.append(entry)
    
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Manifest updated with {file_path.name}")

def main():
    topics = load_topics()
    topic = pick_topic(topics)
    api_key = os.getenv("GEMINI_API_KEY")
    try:
        article_data = generate_content(topic, api_key)
        save_article(article_data)
    except Exception as e:
        import traceback
        print(f"[error] Failed to generate article: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
