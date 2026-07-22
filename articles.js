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

    // Determine current language from page HTML tag
    const currentLang = document.documentElement.lang === 'en' ? 'en' : 'ua';

    if (manifest.length === 0) return;

    // Filter articles based on active page language
    const filteredManifest = manifest.filter(a => {
        // Fallback for older articles without lang tag (default to ua)
        const artLang = a.lang || 'ua';
        return artLang === currentLang;
    });

    // Render cards directly from manifest metadata (no need to fetch each file)
    filteredManifest.slice().reverse().forEach(a => {
        const title = a.title || 'Untitled';
        const date = a.date || '';
        const summary = a.summary || '';
        const filename = a.file || a.filename;
        const artId = filename.replace('.html', '');

        const card = document.createElement('div');
        card.className = 'article-card';
        
        const readMoreText = currentLang === 'en' ? 'Read more' : 'Читати далі';

        card.innerHTML = `
            <h3>${title}</h3>
            <div class="meta">
                <span>${date}</span> &bull; 
                <span><i class="fa-regular fa-eye"></i> <span id="views-${artId}">...</span></span>
            </div>
            <div class="snippet">${summary}</div>
            <a class="read-more" href="articles/${filename}" target="_blank">${readMoreText} <i class="fa-solid fa-arrow-right"></i></a>
        `;
        container.appendChild(card);

        // Fetch view count for this article
        const apiKey = `article_${artId.replace(/-/g, '_')}`;
        fetch(`https://api.counterapi.dev/v1/bellonix-alm/${apiKey}`)
            .then(res => res.json())
            .then(data => {
                const el = document.getElementById(`views-${artId}`);
                if (el && data && typeof data.count !== 'undefined') {
                    el.textContent = data.count;
                }
            })
            .catch(() => {
                const el = document.getElementById(`views-${artId}`);
                if (el) el.textContent = '0';
            });
    });

    // Carousel logic
    const prevBtn = document.getElementById('articlesPrevBtn');
    const nextBtn = document.getElementById('articlesNextBtn');
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            const cardWidth = container.querySelector('.article-card').offsetWidth;
            // Scroll by width of one card + gap (approx 2rem = 32px)
            container.scrollBy({ left: -(cardWidth + 32), behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            const cardWidth = container.querySelector('.article-card').offsetWidth;
            container.scrollBy({ left: cardWidth + 32, behavior: 'smooth' });
        });
    }
})();
