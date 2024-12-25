// load the page list
async function getPageData(){
    const response = await fetch("pages.json",{cache:"no-cache"})
    return await response.json()
}

const gotLens = new CustomEvent("gotLens")

//fetch comic viewer html
async function getLens() {
    const inHtml = await fetch("index.html")
    const dummy = document.createElement("div")
    dummy.innerHTML = await inHtml.text()
    const lHtml = dummy.getElementById("wrapper").innerHTML
    document.getElementById("previewLens").innerHTML = lHtml
    document.dispatchEvent(gotLens)
}

function tag(name, attr = {}){
    const newTag = document.createElement(name);
    for (const [key, value] of Object.entries(attr)){
        newTag.setAttribute(key, value);
    }
    return newTag;
}

const pageData = getPageData()
function extractFilename(path) {
    if (path.substr(0, 12) == "C:\\fakepath\\")
      return path.substr(12); // modern browser
    var x;
    x = path.lastIndexOf('/');
    if (x >= 0) // Unix-based path
      return path.substr(x+1);
    x = path.lastIndexOf('\\');
    if (x >= 0) // Windows-based path
      return path.substr(x+1);
    return path; // just the filename
  }
async function init(){
    "use strict"
    const pageData = await getPageData()
    let newPageData = pageData;
    function addPage(fileName,title,alt,desc,append = true, index = 0){
        let size = pageData.pages.length
        newPageData = pageData;
        newPageData.pages.splice((append ? size : index), 0, {
            "src":`${fileName}`,
            "title":(title ? title : `Page ${size + 1}`),
            "alt":alt,
            "desc":desc
        })
    }
    function whichChapter(index, pd){
        const chIndex = pd.chapters.findLastIndex((p)=> p.startIndex <= index)
        return chIndex
    }
    function deletePage(pageIndex){
        let chapterCount = newPageData.chapters.length
        /* Identify the chapter the page is in by finding the last object
        in the chapters array whose starting index is less than or equal to
        the given page index*/
        let inChapter = whichChapter(pageIndex, newPageData)
        newPageData.splice(pageIndex, 1) // Removes selected page
        for(let i = (inChapter + 1); i < chapterCount; i++){
            newPageData.chapters[i].startIndex --

        } /*starting from the chapter after the removed page's chapter, decrement
        all following chapters' starting indeces. Automatically skips itself if
        starting on the latest chapter*/
    }
    function injectPage(pageIndex,fileName,title,alt,desc){
        let chapterCount = newPageData.chapters.length
        /* Identify the chapter the page is in by finding the last object
        in the chapters array whose starting index is less than or equal to
        the given page index*/
        let inChapter = whichChapter(pageIndex, newPageData)
        addPage(fileName,title,alt,desc,false, pageIndex)
        for(let i = (inChapter + 1); i < chapterCount; i++){
            newPageData.chapters[i].startIndex ++

        } /*starting from the chapter after the injected page's chapter, increment
        all following chapters' starting indeces. Automatically skips itself if
        starting on the latest chapter*/
    }
    function batchDelete(pArray){
        for(const item of pArray){
            deletePage(item)
        }
    }
    function addChapter(name, index){
        let newChIndex = whichChapter(index, newPageData) + 1
        newPageData.splice(newChIndex,0,{
            "title": name,
            "startIndex": index
        })
    }
    const previewUp = document.getElementById("pgUp");
    const previewLens = document.getElementById("previewLens");
    const previewImg = document.getElementById("page");
    const previewButton = document.getElementById("pgPrev");
    const previewAlt = document.getElementById("pgAlt");
    const previewDesc = document.getElementById("desc");
    const previewTitle = document.getElementById("pgTitle");
    previewDesc.replaceWith(tag("textarea", {id:"desc",class:"desc",rows:"3",placeholder:"Comment"}))
    function updatePreview() {
        previewImg.src = URL.createObjectURL(previewUp.files[0]);
        previewImg.alt = previewAlt.value;
        previewImg.title = previewAlt.value;
        const descTitle = document.getElementById("title");
        descTitle.replaceChildren(previewTitle.value)
    };
    previewUp.onchange = function(){
        updatePreview();
        if(previewLens.hasAttribute("hidden")){
            previewLens.removeAttribute("hidden")
        };
    };
    previewButton.onclick = function() {
        updatePreview();
    };
    const downloadButton = document.getElementById("download")
    downloadButton.onclick = function() {
        let pageFileName = extractFilename(previewUp.value);
        let pageTitle = document.getElementById("pgTitle").value;
        let pageAlt = document.getElementById("pgAlt").value;
        let pageDesc = document.getElementById("desc").value;
        addPage(pageFileName, pageTitle, pageAlt, pageDesc);
      const content = JSON.stringify(newPageData);
       const mimeType = 'attachment/plain;';
       const filename = `pages.json`;

       const a = document.createElement('a');
      const blob = new Blob([content], {type: mimeType});
      const url = URL.createObjectURL(blob);
      a.setAttribute('href', url);
      a.setAttribute('download', filename);
      a.click();
    };
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", getLens);
} else {
    getLens();
}

// wait till page load to execute
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}