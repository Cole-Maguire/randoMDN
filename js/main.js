async function getUrls() {
  const wrapper = await browser.storage.sync.get('lang');
  let lang;
  if (Object.entries(wrapper).length === 0) {
    lang = 'en-US';
    browser.storage.sync.set({ lang });
  } else {
    lang = wrapper.lang;
  }

  const response = await fetch(`https://developer.mozilla.org/sitemaps/${lang}/sitemap.xml`);
  const text = await response.text();

  const parser = new DOMParser();
  const sitemap = parser.parseFromString(text, 'application/xml');

  const urls = Array.from(sitemap.querySelectorAll('loc'))
    .map((node) => node.textContent);

  return urls;
}

// eslint-disable-next-line no-unused-vars
async function saveFilteredUrls() {
  const urls = await getUrls();

  const wrapper = await browser.storage.sync.get(['matchSlugs', 'lang']);
  const slugs = wrapper.matchSlugs;
  const { lang } = wrapper;

  if (slugs) {
    // If this is not undefined, then we have some saved rules, so only save urls that match them

    const rules = slugs.map((slug) => new RegExp(`https://developer.mozilla.org/${lang}/docs${slug}/.*`));
    browser.storage.local.set({
      urls: urls.filter((url) => rules.some((pattern) => pattern.test(url))),
    });
  } else {
    // If we have no rules then just save all the urls.
    // Default case unless the user changes their settings
    browser.storage.local.set({ urls });
  }
}
// eslint-disable-next-line no-unused-vars
async function getRandomUrl() {
  const urlObj = await browser.storage.local.get('urls');
  const { urls } = urlObj;
  return urls[Math.floor(Math.random() * urls.length)];
}
