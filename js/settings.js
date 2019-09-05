function recurseSiteMap(obj, url) {
    const current = url[0];
    if (url.length === 1) {
        return {}
    } else if (!obj[current]) {
        obj[current] = {}
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
function recurseSave(nodes) {
    let check = Array.from(nodes).filter(i => i.tagName === "INPUT")[0];

    if (check.indeterminate) {
        return Array.from(nodes).filter(node => node.tagName === 'DIV')
            .flatMap(node => recurseSave(node.children))
            // I'm willing to bet anyone who installs an extension like this runs a recent enough browser for this to not matter.
            .filter(result => result.length > 0) // remove undefineds
    } else if (check.checked) {
        return check.getAttribute('key');
    } else {
        return []
    }
}
function saveSettings() {
    console.log('a');
    const c = Array.from(document.querySelector('div#root').children)
    const results = c.map(r => recurseSave(r.children)).flat();

    browser.storage.sync.set({
        matchSlugs: results
    });

    //Force the browser to refetch all matching urls
    saveFilteredUrls();

}
function createElementFromMap(obj, parentName, depth) {
    //Possibly the worst function I've ever written
    let entries = Object.entries(obj).sort((a, b) => {
        //Alphabetical order based on the keys
        if (a[0] > b[0]) {
            return 1
        } else if (a[0] < b[0]) {
            return -1;
        } else {
            return 0
        }
    });

    if (entries.length > 1 && depth < 3) {
        let mapOut = entries.map(([key, child]) => {
            const next = `${parentName}/${key}`;

            const div = document.createElement('div');

            const label = document.createElement('label');
            label.htmlFor = key
            label.innerHTML = key;
            div.append(label);

            const checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.setAttribute('key', next);
            checkbox.id = key;
            checkbox.checked = false;
            div.append(checkbox);

            const childChecks = createElementFromMap(child, next, depth + 1)
            if (childChecks.length > 0) {
                //Start with children collapsed by default
                div.classList.add('hide-child-boxes')
                //Add a button to toggle this
                const button = document.createElement('button');
                button.textContent = 'Show/Hide';
                button.className = 'hide-button'
                button.type = 'button';
                div.append(button);

                childChecks.forEach(e => div.append(e));
            }
            return div
        });
        return mapOut
    } else {
        return "";
    }

}

async function buildFromMap() {
    const sitemap = await createNestedSiteMap();
    const root = document.querySelector("div#root");

    root.innerHTML = '';
    const elements = createElementFromMap(sitemap, '', 1);
    elements.forEach(element => root.append(element));

    const allChecks = Array.from(document.querySelectorAll('div#root input[type="checkbox"]'));
    const matchSlugsWrapper = await browser.storage.sync.get('matchSlugs');

    if (Object.entries(matchSlugsWrapper).length !== 0) {
        const matchSlugs = matchSlugsWrapper.matchSlugs;

        allChecks.forEach(checkbox => {
            if (matchSlugs.includes(checkbox.getAttribute('key'))) {
                //We wrap this in an if to prevent overwriting subscetions
                checkbox.checked = true
                indeterminateChecks(checkbox)
            }
        })
    }
    else {
        allChecks.forEach(element => element.checked = true)
    }
}

function hideButton(e) {
    if (e.target.className === 'hide-button') {
        e.target.parentNode.classList.toggle('hide-child-boxes')
        e.preventDefault();
    }
}
function indeterminateChecks(initalCheckbox) {
    //This is a lot more generic than it needs to be, but if we need more levels of nesting,
    // it *ought* to handle it

    //Alter children
    const childNodes = initalCheckbox.parentNode.querySelectorAll('input[type="checkbox"]');
    childNodes.forEach(node => node.checked = initalCheckbox.checked);

    //Propogate an indeterminate state up the tree until we hit the root of the checkboxes
    let parent = initalCheckbox.parentNode.parentNode;
    while (parent.id !== 'root') {
        //Should only ever be one of these
        const parentCheck = Array.from(parent.children).filter(i => i.tagName === "INPUT")[0];
        const childNodes = Array.from(parent.querySelectorAll('input[type="checkbox"]'));

        if (childNodes.every(i => i.checked)) {
            parentCheck.checked = true;
            parentCheck.indeterminate = false
        } else if (childNodes.some(i => i.checked)) {
            parentCheck.indeterminate = true
        } else {
            parentCheck.checked = false;
            parentCheck.indeterminate = false
        }

        parent = parent.parentNode;
    }

}

document.querySelector("div#root").addEventListener('click', hideButton)
document.querySelector("div#root").addEventListener('change', (e) => indeterminateChecks(e.target))
document.addEventListener('DOMContentLoaded', buildFromMap);
document.querySelector('button#save').addEventListener('click', saveSettings);