async function goToRandom() {
    let response = await fetch('https://developer.mozilla.org/sitemaps/en-US/sitemap.xml');
    const text = await response.text();

    let parser = new DOMParser();
    const sitemap = parser.parseFromString(text, 'application/xml');

    const included = [/https:\/\/developer\.mozilla\.org\/en-US\/docs\/Web\/CSS.*/] //Example.
    /* construct based on a static origin,  and language/sublevels on save? */

    //Not sure if array.from() is necessary, but probably
    let urls = Array.from(sitemap.querySelectorAll('loc')).filter(url =>
        //Where included is an array of patterns that are generated prior (based on slugs?)
        included.some(pattern => pattern.test(url.textContent))
    );

    const randomUrl = urls[Math.floor(Math.random() * urls.length)]
    console.log(randomUrl.textContent);
    browser.tabs.create({ url: randomUrl.textContent });
}

browser.browserAction.onClicked.addListener(e => goToRandom());