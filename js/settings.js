function recurseSiteMap(obj, url) {
    const current = url[0];
    if (url.length === 1) {
        return {}
    } else if (!obj[current]) {
        obj[current] = { _include: true }
    }
    return recurseSiteMap(obj[current], url.slice(1))
}

async function createNestedSiteMap() {
    let urls = await getUrls();

    //equivalent of getting rid of https://developer.mozilla.org/en-US/docs/
    const splitUrl = urls.map(url => url.split('/').slice(5));
    let allPaths = {};
    splitUrl.forEach(url => {
        recurseSiteMap(allPaths, url)
    })
    return allPaths
}
function saveSettings() {

}
function createElementFromMap(obj, parentName) {
    //Possibly the worst function I've ever written
    let entries = Object.entries(obj);
    let divOuter = document.createElement('div');
    if (entries.length > 1) {
        entries.forEach(([key, child]) => {
            const next = `${parentName},${key}`;

            let div = document.createElement('div');

            let label = document.createElement('label');
            label.htmlFor = key
            label.textContent = key

            let checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.setAttribute('key', next);
            checkbox.id = key;

            div.append(label);
            div.append(checkbox);

            div.append(createElementFromMap(child, next));
            divOuter.append(div)
        });
        return divOuter;
    } else {
        return "";
    }

}

async function buildFromMap() {
    const sitemap = await createNestedSiteMap();
    const root = document.querySelector("div#root");

    root.innerHTML = '';
    root.append(createElementFromMap(sitemap, '_root'));
}

document.addEventListener('DOMContentLoaded', buildFromMap);
document.querySelector('form').addEventListener('submit', saveSettings);