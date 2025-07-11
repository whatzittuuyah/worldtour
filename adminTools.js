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
    const lHtml = dummy.querySelector("#wrapper").innerHTML
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

    /* Returns the array position of the chapter the given page
    number would be found in */
    function whichChapter(index, pd){
        const chIndex = pd.chapters.findLastIndex((p)=> p.startIndex <= index)
        return chIndex
    }

    function autoTitle(index){
        return `Chapter ${whichChapter(index,newPageData)} Page ${(1+(index - newPageData.chapters[whichChapter(index,newPageData)].startIndex))}`
    }

    let viewerPage = 0
    function updateViewerPageIndex(index){
        viewerPage = index
        return index
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
    function setMode(){
        switch(getMode()){
            case "add":
                break;
            case "update":
                break;
            case "delete":
                break;
        }
    }
    function getMode(){
        return document.getElementById("selectBox").value
    }
    function dedupe(filename){
        let result = {}
        result.caught = false
        for(page of newPageData.pages){
            if(page.src === filename){
                result.caught = true
                result.index = [newPageData.pages.indexOf(page)]
                return result
            }
        }
        return result
    }
    function savePage(){
        let pageFileName = "";
        let append = 0
        let index = 0
        if(getMode() === "add"){
            let ddr = dedupe(extractFilename(previewUp.value))
            if(ddr.caught){
                index = viewerPage = ddr.index 
                document.getElementById("selectBox").value = "update"
                pageFileName = newPageData.pages[ddr.index].src
            } else {
                pageFileName = extractFilename(previewUp.value)
                append = 1
            }
        }
        pageFileName = (pageFileName ? pageFileName : newPageData.pages[viewerPage].src)
        index = viewerPage
        let pageTitle = document.getElementById("pgTitle").value;
        let pageAlt = document.getElementById("pgAlt").value;
        let pageDesc = document.getElementById("desc").value;
        addPage(pageFileName, pageTitle, pageAlt, pageDesc, append, index);
        document.getElementById("selectBox").value = "update"
    }
    function enactMode(...args){
        switch(getMode()){
            case "add":
                break;
            case "update":
                break;
            case "delete":
                break;
        }
    }
    function switchPreviewPage(index){
        if(document.getElementById("savebx").value){
            savePage();
        }
         updatePreview(1,index);
    }
    function clearInputs(){
        document.getElementById("pgTitle").value = ""
        document.getElementById("pgAlt").value = ""
        document.getElementById("desc").value = ""
        document.getElementById("desc").replaceChildren("")
    }
    const previewUp = document.getElementById("pgUp");
    const previewLens = document.getElementById("previewLens");
    const previewImg = document.getElementById("page");
    const previewButton = document.getElementById("previewButton");
    const previewAlt = document.getElementById("pgAlt");
    const previewDesc = document.getElementById("desc");
    const previewTitle = document.getElementById("pgTitle");
    const previewControls = document.getElementById("controls");
    const lowerPreviewControls = document.getElementById("bControls");
    const first = document.getElementById("first");
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");
    const latest = document.getElementById("latest");
    for(const child of document.getElementById("controls").children){
       child.removeAttribute("href");
    }
    function updateButtons(){
        let curr = viewerPage
        first.destination = 0
        prev.destination = (curr-1 < 0 ? curr-1 : 0)
        if(curr+1 >= newPageData.pages.size){
            next.onclick = document.getElementById("pgUp").click()
            next.destination = newPageData.pages.size -1
            next.noclickFlag = true
        } else {
            next.destination = curr +1
        }
        latest.destination = newPageData.pages.size-1
        for(const child of document.getElementById("controls").children){
            child.onclick = switchPreviewPage(child.destination)
        }
    }
    const cloneControls = previewControls.cloneNode(true);
    lowerPreviewControls.appendChild(cloneControls);
    previewDesc.replaceWith(tag("textarea", {id:"desc",class:"desc",rows:"3",placeholder:"Comment"}))
    previewImg.removeAttribute("hidden")
    function updatePreview(...args) {
        let pageExists = args[0]
        let index = args[1]
        if(pageExists){
            previewImg.src = newPageData.pages[index].src
            previewImg.alt = newPageData.pages[index].alt;
            previewImg.title = newPageData.pages[index].alt;
            descTitle.replaceChildren(newPageData.pages[index].title)
            viewerPage = index
            updateButtons();
        } else {
        previewImg.src = URL.createObjectURL(previewUp.files[0]);
        previewImg.alt = previewAlt.value;
        previewImg.title = previewAlt.value;
        const descTitle = document.getElementById("title");
        descTitle.replaceChildren(previewTitle.value)
        viewerPage = newPageData.pages.size
        updateButtons();}
    };
    previewUp.onclick = function(){
        if(document.getElementById("savebx") 
            && !previewLens.hasAttribute("hidden")){
            savePage();
        }
    }
    previewUp.onchange = function(){
        updatePreview();
        if(previewLens.hasAttribute("hidden")){
            previewLens.removeAttribute("hidden")
        };
        document.getElementById("selectBox").value = "add"
        clearInputs();
    };
    previewButton.onclick = function() {
        updatePreview();
    };
    const downloadButton = document.getElementById("download")
    downloadButton.onclick = function() {
        savePage();
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

document.addEventListener("gotLens", init);