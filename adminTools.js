// load the page list
async function getPageData(){
    const response = await fetch("pages.json",{cache:"no-cache"})
    return await response.json()
}
const pageData = getPageData()
async function init(){
    "use strict"
    const pageData = await getPageData()
    let newPageData = pageData;
    function addPage(fileName,title,alt,desc){
        let size = pageData.pages.length
        newPageData = pageData;
        newPageData.pages.push({
            "src":`${fileName}`,
            "title":(title ? title : `Page ${size + 1}`),
            "alt":alt,
            "desc":desc
        })
    }
    const previewUp = document.getElementById("pgUp");
    const previewLens = document.getElementById("previewLens");
    const previewImg = document.getElementById("page");
    const previewButton = document.getElementById("pgPrev");
    const previewAlt = document.getElementById("pgAlt");
    const previewDesc = document.getElementById("desc");
    const previewTitle = document.getElementById("pgTitle");
    function updatePreview() {
        previewImg.src = previewUp.value;
        previewImg.alt = previewAlt.value;
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
        let pageFileName = document.getElementById("pgFileName").value;
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

// wait till page load to execute
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}