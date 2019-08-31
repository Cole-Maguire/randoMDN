async function createButton() {
    const url = await getRandomUrl();

    const menu = document.querySelector("#main-nav>ul");
    const li = document.createElement("li");
    li.className = "nav-main-item";
    li.innerHTML = `<a href="${url}">Random!</a>`;
    menu.append(li);
}
createButton();
