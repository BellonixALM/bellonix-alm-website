// articles.js – Dynamically load article cards from manifest.json
// Each article is an HTML file in the /articles/ directory.
// The manifest.json contains metadata: title, date, summary, file.

(async function () {
    const container = document.getElementById('articlesContainer');
    if (!container) return;

    // Load manifest
    let manifest = [];
    try {
        const manifestResp = await fetch('articles/manifest.json');
        if (manifestResp.ok) manifest = await manifestResp.json();
    } catch (_) { /* ignore */ }

    if (manifest.length === 0) return;

    // Render cards directly from manifest metadata (no need to fetch each file)
    manifest.forEach(a => {
        const title = a.title || 'Без назви';
        const date = a.date || '';
        const summary = a.summary || '';
        const filename = a.file || a.filename;

        const card = document.createElement('div');
        card.className = 'article-card';
        card.innerHTML = `
            <h3>${title}</h3>
            <div class="meta">${date}</div>
            <div class="snippet">${summary}</div>
            <a class="read-more" href="articles/${filename}" target="_blank">Читати далі <i class="fa-solid fa-arrow-right"></i></a>
        `;
        container.appendChild(card);
    });
})();
