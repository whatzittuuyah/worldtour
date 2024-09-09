// load the page list
async function getPageData(){
    const response = await fetch("pages.json",{cache:"no-cache"})
    return await response.json()
}
const pageData = getPageData()
async function init(){
    "use strict"
    const pageData = await getPageData()
    function addPage(fileName,title,alt,desc){
        let size = pageData.pages.length
        pageData.pages.push({
            "src":`${fileName}`,
            "title":(title ? title : `Page ${size + 1}`),
            "alt":alt,
            "desc":desc
        })
    }
    const downloadButton = document.getElementById("download")
    downloadButton.onclick = function() {
        let pageFileName = document.getElementById("pgFileName").value;
        let pageTitle = document.getElementById("pgTitle").value;
        let pageAlt = document.getElementById("pgAlt").value;
        let pageDesc = document.getElementById("pgDesc").value;
        addPage(pageFileName, pageTitle, pageAlt, pageDesc);
      const content = JSON.stringify(pageData);
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