async function getUrls() {
    let response = await fetch('https://developer.mozilla.org/sitemaps/en-US/sitemap.xml');
    const text = await response.text();

    let parser = new DOMParser();
    const sitemap = parser.parseFromString(text, 'application/xml');

    let urls = Array.from(sitemap.querySelectorAll('loc'))
        .map(node => node.textContent);

    return urls;
}

async function saveFilteredUrls() {
    const urls = await getUrls();

    const savedWrapper = await browser.storage.sync.get('matchSlugs');
    const saved = savedWrapper['matchSlugs'];
    const rules = saved.map(s => {
        return new RegExp(`https://developer\.mozilla\.org/en-US/docs${s}/.*`.replace('/', '\/'))
    })

    browser.storage.local.set({
        urls: urls.filter(url => {
            return rules.some(pattern => pattern.test(url))
        })
    });

    return urls
}
async function getRandomUrl() {
    const urlObj = await browser.storage.local.get('urls');
    const urls = urlObj["urls"];
    return urls[Math.floor(Math.random() * urls.length)]
}
