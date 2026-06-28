// articles.js – Dynamically load generated markdown articles and render as glass‑card widgets
// Assumes each article is a Markdown file placed in the /articles/ directory of the site.
// The script builds a simple manifest by scanning the directory via a generated JSON file.
// For a static site without server‑side directory listing, the GitHub Actions workflow should generate
// `articles/manifest.json` containing an array of objects: [{"filename":"article‑2023‑09‑01.md","title":"..."}, ...]

(async function () {
    const container = document.getElementById('articlesContainer');
    if (!container) return; // safety

    // Helper to fetch and parse a markdown file
    async function loadArticle(meta) {
        try {
            const resp = await fetch(`articles/${meta.filename}`);
            if (!resp.ok) return null;
            const text = await resp.text();
            // Very naive front‑matter parser – first line as title, second as date, rest as snippet
            const lines = text.split('\n');
            const title = lines[0].replace(/^#\s*/, '').trim();
            const date = lines[1] ? lines[1].trim() : '';
            const snippet = lines.slice(2, 7).join(' ').trim(); // first few sentences
            return {title, date, snippet, filename: meta.filename};
        } catch (e) { console.error('Failed to load article', meta.filename, e); return null; }
    }

    // Load manifest – fallback to empty array if not present
    let manifest = [];
    try {
        const manifestResp = await fetch('articles/manifest.json');
        if (manifestResp.ok) manifest = await manifestResp.json();
    } catch (_) { /* ignore */ }

    // If manifest is empty (development mode), create a demo entry
    if (manifest.length === 0) {
        manifest = [{filename: 'demo-article.md'}];
    }

    const promises = manifest.map(loadArticle);
    const articles = (await Promise.all(promises)).filter(Boolean);

    // Render cards
    articles.forEach(a => {
        const card = document.createElement('div');
        card.className = 'article-card';
        const html = `
            <h3>${a.title}</h3>
            <div class="meta">${a.date}</div>
            <div class="snippet">${a.snippet}</div>
            <a class="read-more" href="articles/${a.filename}" target="_blank">Читати далі <i class="fa-solid fa-arrow-right"></i></a>
        `;
        card.innerHTML = html;
        container.appendChild(card);
    });
})();
