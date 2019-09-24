async function getUrls() {
    const wrapper = await browser.storage.sync.get('lang')
    let lang;
    if (Object.entries(wrapper).length === 0) {
        lang = 'en-US'
        browser.storage.sync.set({ 'lang': lang })
    } else {
        lang = wrapper.lang
    }

    let response = await fetch(`https://developer.mozilla.org/sitemaps/${lang}/sitemap.xml`);
    const text = await response.text();

    let parser = new DOMParser();
    const sitemap = parser.parseFromString(text, 'application/xml');

    let urls = Array.from(sitemap.querySelectorAll('loc'))
        .map(node => node.textContent);

    return urls;
}

async function saveFilteredUrls() {
    const urls = await getUrls();

    const wrapper = await browser.storage.sync.get(['matchSlugs', 'lang']);
    const saved = wrapper.matchSlugs;
    const lang = wrapper.lang;
    const rules = saved.map(s => {
        return new RegExp(`https://developer\.mozilla\.org/${lang}/docs${s}/.*`.replace('/', '\/'))
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
