#!/usr/bin/env python3
"""generate_article.py

Щоденний скрипт, який:
1. Читає список тем із `topics.txt`.
2. Випадковим чином обирає тему.
3. Використовує Gemini API для генерації статті у форматі JSON українською та англійською мовами.
4. Записує результати у повноцінні HTML-документи (UA та EN).
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

def generate_content(topic, lang, api_key=None):
    if not api_key:
        if lang == "ua":
            return {
                "title": topic,
                "summary": f"Коротка анотація про {topic.lower()}.",
                "content_html": f"<h1>{topic}</h1>\n<p>Тут розгорнутий матеріал статті про {topic.lower()}…</p>"
            }
        else:
            return {
                "title": f"{topic} (EN)",
                "summary": f"Brief summary about {topic.lower()}.",
                "content_html": f"<h1>{topic}</h1>\n<p>Here is the detailed article content about {topic.lower()}…</p>"
            }
    
    import requests
    if lang == "ua":
        prompt = (
            f"Напиши професійну, розгорнуту та корисну статтю українською мовою на тему: '{topic}'.\n"
            "Стаття має бути орієнтована на бізнес-аудиторію (керівників, власників компаній, логістів).\n"
            "Обов'язково зроби акцент на ботах (Telegram/Viber), зручності їх використання, а також на функціональних дашбордах, які дозволяють оперативно приймати рішення.\n"
            "КАТЕГОРИЧНО ЗАБОРОНЕНО використовувати абревіатуру чи слово '1С' або '1C'. Замість цього використовуй 'BAS'.\n"
            "Поверни результат виключно у форматі JSON з наступною структурою. Зверни особливу увагу на те, щоб усі лапки всередині значень JSON були екрановані (наприклад, \\\" для атрибутів HTML):\n"
            "{\n"
            "  \"title\": \"Привабливий заголовок\",\n"
            "  \"summary\": \"Короткий опис на 2-3 речення\",\n"
            "  \"content_html\": \"<h1>Заголовок</h1><p>Абзац тексту з інтегрованими HTML-тегами для форматування...</p>\"\n"
            "}"
        )
    else:
        prompt = (
            f"Write a professional, detailed, and useful article in English on the topic: '{topic}'.\n"
            "The article must target a business audience (executives, company owners, logistics managers).\n"
            "Emphasize the role of messengers (Telegram/Viber) bots, their convenience, and interactive management dashboards that allow quick decision making.\n"
            "STRICTLY FORBIDDEN to use the word '1C' or '1С'. Instead, use 'BAS'.\n"
            "Return the result ONLY as a JSON string with the following structure. Pay close attention to escaping quotes inside values (e.g. \\\" for HTML attributes):\n"
            "{\n"
            "  \"title\": \"Catchy Headline\",\n"
            "  \"summary\": \"Brief summary of 2-3 sentences\",\n"
            "  \"content_html\": \"<h1>Headline</h1><p>Paragraph text with integrated HTML tags for formatting...</p>\"\n"
            "}"
        )

    headers = {"Content-Type": "application/json"}
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    data = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    resp = requests.post(url, headers=headers, json=data)
    if resp.status_code != 200:
        raise RuntimeError(f"Gemini API error: {resp.status_code} {resp.text}")
    
    result = resp.json()
    try:
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        text_clean = text.strip()
        text_clean = re.sub(r"^```json\s*", "", text_clean)
        text_clean = re.sub(r"\s*```$", "", text_clean)
        text_clean = text_clean.replace("1С", "BAS").replace("1C", "BAS")
        return json.loads(text_clean)
    except Exception as e:
        raise RuntimeError(f"Unexpected Gemini response format: {e}\nRaw output: {text}")

def get_next_index():
    today = datetime.date.today().isoformat()
    existing_indices = []
    for f in ARTICLES_DIR.glob(f"{today}-*-ua.html"):
        match = re.search(rf"{today}-(\d+)-ua\.html$", f.name)
        if match:
            existing_indices.append(int(match.group(1)))
    if not existing_indices:
        return 1
    return max(existing_indices) + 1

def save_article(article_data, lang, index):
    today = datetime.date.today().isoformat()
    file_path = ARTICLES_DIR / f"{today}-{index}-{lang}.html"
    
    title = article_data.get("title", "No Title").replace("1С", "BAS").replace("1C", "BAS")
    summary = article_data.get("summary", "").replace("1С", "BAS").replace("1C", "BAS")
    content_html = article_data.get("content_html", "").replace("1С", "BAS").replace("1C", "BAS")
    
    html_lang = "uk" if lang == "ua" else "en"
    back_text = "← Назад до головної сторінки" if lang == "ua" else "← Back to home page"
    back_url = "../index.html" if lang == "ua" else "../en.html"
    
    html_content = f"""<!DOCTYPE html>
<html lang="{html_lang}">
<head>
<meta charset="UTF-8">
<title>{title}</title>
<meta name="description" content="{summary}">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="../styles.css">
<link rel="icon" type="image/x-icon" href="../favicon.ico?v=10">
<link rel="icon" type="image/png" href="../favicon.png?v=10">
<link rel="apple-touch-icon" href="../favicon.png?v=10">
</head>
<body>
<article style="max-width: 800px; margin: 2rem auto; padding: 2rem; color: var(--color-text-white, #e0e0e0);">
<p style="opacity:0.7; margin-bottom:2rem;">{today}</p>
{content_html}
<a href="{back_url}" style="display:inline-block; margin-top:2rem; color:var(--color-accent); text-decoration:none; font-weight:bold;">{back_text}</a>
</article>

<script>
  // Theme sync
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {{
    document.body.classList.add('light-theme');
  }}

  // View count increment
  const artId = window.location.pathname.split('/').pop().replace('.html', '');
  if (artId) {{
    const apiKey = 'article_' + artId.replace(/-/g, '_');
    fetch(`https://api.counterapi.dev/v1/bellonix-alm/${{apiKey}}/up`).catch(() => {{}});
  }}
</script>
</body>
</html>
"""
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Article ({lang}) saved to {file_path}")
    update_manifest(file_path, title, summary, lang)

def update_manifest(file_path, title, summary, lang):
    entry = {
        "title": title,
        "date": datetime.date.today().isoformat(),
        "summary": summary,
        "image": "bas_efficiency.png",
        "file": file_path.name,
        "lang": lang
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
    today = datetime.date.today().isoformat()
    existing_count = len(list(ARTICLES_DIR.glob(f"{today}-*-ua.html")))

    if existing_count >= 2:
        print(f"[info] Already generated {existing_count} articles for today ({today}). Skipping generation.")
        sys.exit(0)

    topics = load_topics()
    topic = pick_topic(topics)
    api_key = os.getenv("GEMINI_API_KEY")
    
    index = get_next_index()
    
    try:
        # 1. Генерируємо українську версію
        article_ua = generate_content(topic, "ua", api_key)
        save_article(article_ua, "ua", index)
        
        # 2. Генерируємо англійську версію
        article_en = generate_content(topic, "en", api_key)
        save_article(article_en, "en", index)
        
    except Exception as e:
        import traceback
        print(f"[error] Failed to generate article (topic: {topic}): {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
