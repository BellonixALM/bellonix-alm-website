#!/usr/bin/env python3
"""generate_article.py

Щоденний скрипт, який:
1. Читає список тем із `topics.txt`.
2. Випадковим чином обирає тему.
3. Використовує Gemini API для генерації статті у форматі JSON (title, summary, content_html).
4. Записує результат у повноцінний HTML-документ `articles/YYYY-MM-DD-N.html`.
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
        "КАТЕГОРИЧНО ЗАБОРОНЕНО використовувати абревіатуру чи слово '1С' або '1C'. Замість цього використовуй 'BAS'.\n"
        "Поверни результат виключно у форматі JSON з наступною структурою. Зверни особливу увагу на те, щоб усі лапки всередині значень JSON були екрановані (наприклад, \\\" для атрибутів HTML):\n"
        "{\n"
        "  \"title\": \"Привабливий заголовок\",\n"
        "  \"summary\": \"Короткий опис на 2-3 речення\",\n"
        "  \"content_html\": \"<h1>Заголовок</h1><p>Абзац тексту з інтегрованими HTML-тегами для форматування...</p>\"\n"
        "}"
    )
    headers = {"Content-Type": "application/json"}
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={api_key}"
    data = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    resp = requests.post(url, headers=headers, json=data)
    if resp.status_code != 200:
        if resp.status_code == 404:
            try:
                models_resp = requests.get(f"https://generativelanguage.googleapis.com/v1/models?key={api_key}")
                if models_resp.status_code == 200:
                    models_list = [m["name"] for m in models_resp.json().get("models", [])]
                    print(f"[debug] Available models for this key: {models_list}", file=sys.stderr)
                else:
                    print(f"[debug] Could not list models: {models_resp.status_code} {models_resp.text}", file=sys.stderr)
            except Exception as ex:
                print(f"[debug] Error listing models: {ex}", file=sys.stderr)
        raise RuntimeError(f"Gemini API error: {resp.status_code} {resp.text}")
    result = resp.json()
    try:
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        text_clean = text.strip()
        # Очистимо можливе markdown-обгортання JSON про всяк випадок
        text_clean = re.sub(r"^```json\s*", "", text_clean)
        text_clean = re.sub(r"\s*```$", "", text_clean)
        # Видаляємо випадкові згадки 1C
        text_clean = text_clean.replace("1С", "BAS").replace("1C", "BAS")
        return json.loads(text_clean)
    except Exception as e:
        raise RuntimeError(f"Unexpected Gemini response format: {e}\nRaw output: {text}")

def get_next_index():
    today = datetime.date.today().isoformat()
    existing_indices = []
    for f in ARTICLES_DIR.glob(f"{today}-*.html"):
        match = re.search(rf"{today}-(\d+)\.html$", f.name)
        if match:
            existing_indices.append(int(match.group(1)))
    if not existing_indices:
        if (ARTICLES_DIR / f"{today}.html").exists():
            return 2
        return 1
    return max(existing_indices) + 1

def save_article(article_data):
    today = datetime.date.today().isoformat()
    index = get_next_index()
    file_path = ARTICLES_DIR / f"{today}-{index}.html"
    
    title = article_data.get("title", "Без назви").replace("1С", "BAS").replace("1C", "BAS")
    summary = article_data.get("summary", "").replace("1С", "BAS").replace("1C", "BAS")
    content_html = article_data.get("content_html", "").replace("1С", "BAS").replace("1C", "BAS")
    
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
        "image": "bas_efficiency.png",
        "file": file_path.name
    }
    if MANIFEST_PATH.exists():
        try:
            manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        except Exception:
            manifest = []
    else:
        manifest = []
        
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
        print(f"[error] Failed to generate article (topic: {topic}): {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
