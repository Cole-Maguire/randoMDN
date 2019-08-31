//On startup seems common enough for something not that likely to change
browser.runtime.onStartup.addListener(saveFilteredUrls);
//onInstalled makes debugging easier
browser.runtime.onInstalled.addListener(saveFilteredUrls);
browser.browserAction.onClicked.addListener(async () => { browser.tabs.create({ url: await getRandomUrl() }) });