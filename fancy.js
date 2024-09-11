async function init(){
    "use strict"
    const first = document.getElementById("first");
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");
    const latest = document.getElementById("latest");
    const page = document.getElementById("page");
    const pgTitle = document.getElementById("title");
    const desc = document.getElementById("desc");
    const pageData = await getPageData();
    let recentPageIndex = pageData.pages.length - 1;
    const pageNum = currentPage() ?? recentPageIndex;
    page.src = `imgs/pages/${pageData.pages[pageNum].src}`;
    page.alt = page.title = pageData.pages[pageNum].alt
    page.removeAttribute("hidden");
    pgTitle.replaceChildren(pageData.pages[pageNum].title);
    desc.textContent(pageData.pages[pageNum].desc);
    prev.href = `?page=${+pageNum - 1}`
    next.href = `?page=${+pageNum + 1}`
    if(+pageNum === 0){
        prev.setAttribute("hidden", true)
    };
    if(+pageNum === recentPageIndex){
        next.setAttribute("hidden", true)
    };
}

//what page are we on?
function currentPage(){
    const params = new URLSearchParams(window.location.search)
    return params.get("page")
}

// load the page list
async function getPageData(){
    const response = await fetch("pages.json",{cache:"no-cache"})
    return await response.json()
}

// wait till page load to execute
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}