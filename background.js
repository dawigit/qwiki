browser.tabs.executeScript(null, {file: "/content_scripts/quickwiki.js"});
browser.runtime.onMessage.addListener(bg_handleMessage);

let gettingAllCommands = browser.commands.getAll();
gettingAllCommands.then((commands) => {
  for (let command of commands) {
    // Note that this logs to the Add-on Debugger's console: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Debugging
    // not the regular Web console.
    console.log(command);
  }
});

function onError(error) {
  console.error(`Error: ${error}`);
}

function sendMessageToTabs(tabs) {
  for (const tab of tabs) { browser.tabs.sendMessage(tab.id,{togglesearch: 1}).catch(onError); }
}

browser.commands.onCommand.addListener((command) => {
  if(command==='toggle-search'){
    browser.tabs.query({
      currentWindow: true,
      active: true,
    }).then(sendMessageToTabs).catch(onError);
  }
});


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
