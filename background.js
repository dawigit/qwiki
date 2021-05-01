browser.tabs.executeScript(null, {file: "/content_scripts/quickwiki.js"});
browser.runtime.onMessage.addListener(bg_handleMessage);

function bg_handleMessage(request, sender, sendResponse) {
  if(request.url){
    var xreq = new XMLHttpRequest();
    if(xreq){
        xreq.open('GET', request.url, true);
        xreq.onreadystatechange =  function() {
            if (xreq.readyState == 4) {
              sendResponse({
                data: xreq.responseText,
                method: request.method
              });
            }
        };
        xreq.send();
    }
  }
  return true;
}

function optionsUpdated(){
  var querying = browser.tabs.query({});
  querying.then(updateOptionsTabs, onError);
}

function updateOptionsTabs(tabs) {
  for (let tab of tabs) {
    browser.tabs.sendMessage(tab.id,{optionsupdate: 1});
  }
}

function onError(error) {
  console.log(`Error: ${error}`);
}
