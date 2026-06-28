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
            const resp = await fetch(`articles/${meta.file || meta.filename}`);
            if (!resp.ok) return null;
            const text = await resp.text();
            
            let title = meta.title || "Без назви";
            let date = meta.date || "";
            let cleanText = text;

            // Simple front matter parser
            if (text.startsWith("---")) {
                const parts = text.split("---");
                if (parts.length >= 3) {
                    const frontMatter = parts[1];
                    cleanText = parts.slice(2).join("---");
                    
                    const titleMatch = frontMatter.match(/title:\s*["']?([^"'\n]+)["']?/i);
                    const dateMatch = frontMatter.match(/date:\s*["']?([^"'\n]+)["']?/i);
                    
                    if (titleMatch) title = titleMatch[1];
                    if (dateMatch) date = dateMatch[1];
                }
            }

            // Fallback for title/date if no front matter
            if (title === "Без назви" || !date) {
                const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
                if (lines[0] && lines[0].startsWith('#')) {
                    title = lines[0].replace(/^#\s*/, '');
                    if (lines[1] && /^\d{4}-\d{2}-\d{2}$/.test(lines[1])) {
                        date = lines[1];
                    }
                }
            }

            // Extract a clean snippet (remove markdown tags and images)
            let snippet = cleanText
                .replace(/!\[.*?\]\(.*?\)/g, "") // remove images
                .replace(/[#*`_\[\]()\-]/g, "")   // remove markdown formatting characters
                .replace(/\s+/g, " ")             // normalize spaces
                .trim();
            
            if (snippet.length > 160) {
                snippet = snippet.substring(0, 160) + "...";
            }

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
