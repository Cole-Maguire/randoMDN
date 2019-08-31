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

    const included = [/https:\/\/developer\.mozilla\.org\/en-US\/docs\/Web\/CSS.*/] //Example.
    //will later be replaced by a setting

    browser.storage.local.set({
        urls: urls.filter(url => included.some(pattern => pattern.test(url)))
    });

    return urls
}

async function goToRandom() {
    const urlObj = await browser.storage.local.get('urls');
    const urls = urlObj["urls"];
    const randomUrl = urls[Math.floor(Math.random() * urls.length)]
    browser.tabs.create({ url: randomUrl });
}

//On startup seems common enough for something not that likely to change
browser.runtime.onStartup.addListener(saveFilteredUrls);
//onInstalled makes debugging easier
browser.runtime.onInstalled.addListener(saveFilteredUrls);
browser.browserAction.onClicked.addListener(goToRandom);