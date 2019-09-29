async function createButton() {
    const url = await getRandomUrl();

    const menu = document.querySelector("#main-nav>ul");
    const li = document.createElement("li");
    const a = document.createElement("a");
    li.className = "nav-main-item";
    a.href = url;
    a.textContent = "Random!";
    li.appendChild(a);
    menu.append(li);
}
createButton();
