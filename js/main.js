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
    const slugs = wrapper.matchSlugs;
    const lang = wrapper.lang;

    if (slugs) {
        //If this is not undefined, then we have some saved rules, so only save urls that match them

        const rules = slugs.map(slug => {
            return new RegExp(`https://developer\.mozilla\.org/${lang}/docs${slug}/.*`.replace('/', '\/'))
        })
        browser.storage.local.set({
            urls: urls.filter(url => rules.some(pattern => pattern.test(url)))
        });
    } else {
        //If we have no rules then just save all the urls. Default case unless the user changes their settings
        browser.storage.local.set({ urls: urls })
    }
}
async function getRandomUrl() {
    const urlObj = await browser.storage.local.get('urls');
    const urls = urlObj["urls"];
    return urls[Math.floor(Math.random() * urls.length)]
}
