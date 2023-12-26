var dcomb = [
  ["oinputcomplete",[1,0,0,2,""]],
  ["oinputshort",[0,1,0,2,""]],
  ["oinputtable",[0,1,1,2,""]],
  ["oinputquick",[1,0,0,-1,"w"]]
];
var comb = [];


function handleError(error) {
  console.log(`Error: ${error}`);
}

const wikipedia = "wikipedia.org";
const wiktionary = "wiktionary.org"
const wiki = "/wiki/";
const flags = ["ar","bg","ca","cs","da","de","en","eo","es","et","eu","fa","fi","fr","he","hi","hr","hu","id","it","ja","kk","ko","lt","ms","nl","no","pl","pt","ro","ru","sk","sl","sr","sv","tr","uk","vi","war","zh"];

var wwhat = wikipedia;
var language = "en";
var method = 1;
var wikisource = `href="https://${language}.${wwhat}${wiki}`;
var bm,bl,bw;
var html,content,short,multi;
var qwikibox,qwikiboxsearch,qwikisearch;
var qwikibox_scroll_x = 0;
var qwikibox_scroll_y = 0;
window.addEventListener("keydown", keyaway, true);
window.addEventListener("click", click, true);
addGlobalStyle(".qwikiinfo { border-style: solid;border-width: 2px;border-radius: 6px;padding: 8px;position: fixed; display: none; width: "+window.innerWidth/1.5+"px; height:"+window.innerHeight/1.5+"px; background-color:rgba(230, 230, 230, 1); z-index:9999999; overflow-y:scroll;}");
addGlobalStyle(".qwikiboxsearch { position: fixed; display: none; width: auto; height: auto; z-index:9999999;}");
addGlobalStyle(".qwikisearch { display: inherit; border-style: solid;border-width: 2px;border-radius: 6px;padding: 8px;width: auto; height: auto;}");
qwikibox = document.createElement("div");
qwikibox.classList.add("qwikiinfo");
document.body.appendChild(qwikibox);
qwikiboxsearch = document.createElement("div");
qwikiboxsearch.classList.add("qwikiboxsearch");
qwikiboxsearch.style.width="168px";
qwikiboxsearch.style.height="32px";
search = document.createElement("input");
search.id="search";
search.classList.add("qwikisearch");
qwikiboxsearch.appendChild(search);
document.body.appendChild(qwikiboxsearch);
readOptions();
browser.runtime.onMessage.addListener(request => {
  if(request.optionsupdate){
    readOptions();
  }
  if(request.togglesearch){
    if(qwikiboxsearch.style.display=="block"){
      qwikiboxsearch.style.display="none";
      return;
    } 
    qwikiboxsearch.style.left = window.innerWidth/2-parseInt(qwikiboxsearch.style.width)/2+"px";
    qwikiboxsearch.style.top = window.innerHeight/2-parseInt(qwikiboxsearch.style.height)/2+"px";
    search.addEventListener("keyup",wikisearch,true);
    qwikiboxsearch.style.display="block";
    search.focus();
  }
  //console.log(request);
});










const commandName = 'toggle-search';

/**
 * Update the UI: set the value of the shortcut textbox.
 */
async function updateUI() {
  let commands = await browser.commands.getAll();
  for (let command of commands) {
    if (command.name === commandName) {
      if(qwikiboxsearch.style.display=="block"){
        qwikiboxsearch.style.display="none";
        return;
      } 
      qwikiboxsearch.style.left = window.innerWidth/2-parseInt(qwikiboxsearch.style.width)/2+"px";
      qwikiboxsearch.style.top = window.innerHeight/2-parseInt(qwikiboxsearch.style.height)/2+"px";
      search.addEventListener("keyup",wikisearch,true);
      qwikiboxsearch.style.display="block";
      search.focus();
    }
  }
}
//browser.commands.onCommand.addListener((command) => {



function getContent(word){
  let l,m,w;
  if(!word)return;
  for(let i=1;i<arguments.length;i++){
    if(!arguments[i])continue;
    if(typeof(arguments[i]) == "string" && flags.includes(arguments[i])){l=arguments[i];continue;}
    if(!isNaN(arguments[i]) && parseInt(arguments[i]) > 0 && parseInt(arguments[i]) < 4){m=parseInt(arguments[i]);continue;}
    if(typeof(arguments[i]) == "string" && arguments[i].match(/[\W]/)){w=arguments[i];continue;}
  }
  l = l || language;
  m = m || 1;
  w = w || "";
  //console.log(word);
  var wurl,p;
  switch(w){
    case "?":
      p = wiktionary;
      break;
    default:
      p = wikipedia;
      break;
  }
  wikisource = `href="https://${l}.${p}`;
  wurl = `https://${l}.${p}${wiki}${word}`;
  //console.log(wurl);
  var sending = browser.runtime.sendMessage({
    url: wurl,
    method: m
  });
  sending.then(handleResponse, handleError);
  bm = m;
  bl = l;
  bw = w;
  return;
}

function checkCombis(e){
  let nc = [e.altKey?1:0,e.ctrlKey?1:0,e.shiftKey?1:0,e.button,e.key?e.key:""];
  let ncj = JSON.stringify(nc);
  for(let i=0;i<comb.length;i++){
    if(JSON.stringify(comb[i][1]) == ncj)return i+1;
  }
  return 0;
}

function eventStop(e){
  e.preventDefault();
  e.stopPropagation();
}


function click(e){
  method = checkCombis(e);
  //console.log(method);
  var word;
  if(e && e.rangeParent){
    let s = e.rangeParent.textContent;
    let slen = s.length;
    let beg=e.rangeOffset;
    let end=e.rangeOffset;
    while(beg>0 && (s[beg-1]!=" "&&s[beg-1]!="\n") ){--beg;}
    while(end<slen && (s[end]!=" "&&s[end]!="\n") ){++end;}
    word = s.substring(beg,end);
    //console.log(`word=${word}`);
  }
  
  let st,et;
  et = e.target;
  while(1){
    if(et.parentElement){et = et.parentElement;}else{break;}
    if(et == qwikibox)break;
  }
  if(et == qwikibox){
    if(!method && e.button)return;
    if(e.target.tagName.toLowerCase() === 'audio')return true;
    if(e.target.tagName.toLowerCase() === 'a' && e.target.href.match(/(#.+)$/))st=e.target;
    if(e.target.parentElement.tagName.toLowerCase() === 'a' && e.target.parentElement.href.match(/(#.+)$/))st=e.target.parentElement;
    if(st){
      document.getElementById(st.href.match(/#(.+)$/)[1]).scrollIntoView();
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    if(e.target.tagName.toLowerCase() === 'a' && e.target.href.match(wwhat))st = e.target.href.match(/.+\/(.+)$/)[1];
    if(e.target.parentElement.tagName.toLowerCase() === 'a' && e.target.parentElement.href.match(wwhat))st=e.target.parentElement.href.match(/.+\/(.+)$/)[1];
    if(st){
      e.preventDefault();
      e.stopPropagation();
      getContent(st,bl,method?method:bm,bw);
      return false;
    }
  }
  
  if(!word){ word = window.getSelection().toString(); }
  
  if(method){
    e.preventDefault();
    e.stopPropagation();
    console.log(`word=${word}`);
    getContent(word,"",method);
  }else{
    if(e.button == 2 && e.shiftKey){
      e.preventDefault();
      e.stopPropagation();
    }
  }
  if(qwikibox.style.display=="block" && e.button === 0){
        qwikibox.style.display="none";
      return false;
  }
  return 0;
}

function wikisearch(e){
  if(!e){return;}
  if(e.key === "Enter" && e.target.value){
      qwikiboxsearch.style.display="none";
      let q = e.target.value.split(":").reverse();
      getContent(...q);
      //getContent(q[0],q[1]?q[1]:"",q[2]?q[2]:1,q[3]?q[3]:"");
      search.removeEventListener("input",wikisearch,false);
  }
}

function keyaway(e){
    if(!e){return;}
    if(qwikibox.style.display == "block" && e.key === "Escape"){
        qwikibox.style.display = "none";
    }
    if(qwikiboxsearch.style.display=="block" && e.key === "Escape"){
        qwikiboxsearch.style.display="none";
    }
    let ee = e;
    ee.button = -1;
    if(qwikibox.style.display!="none"){
      //console.log(`ee.key = ${ee.key}`);
      if(ee.key == "ArrowDown"){
        //console.log("Down");
        if(qwikibox.scrollTop < qwikibox.scrollHeight){        
          qwikibox_scroll_y+=100;      
          qwikibox.scroll({
            top: qwikibox_scroll_y,
            left: qwikibox_scroll_x,
            behavior: "smooth"
          });
          ee.preventDefault();
          ee.stopPropagation();
        }
      }
      if(ee.key == "ArrowUp"){
        //console.log("Up");
        if(qwikibox.scrollTop > 0){        
          qwikibox_scroll_y-=100; 
          qwikibox.scroll({
            top: qwikibox_scroll_y,
            left: qwikibox_scroll_x,
            behavior: "smooth"
          });
          ee.preventDefault();
          ee.stopPropagation();
        }
      }

      if(ee.key == "ArrowLeft"){
        //console.log("Left");
        if(qwikibox.scrollLeft > 0){        
          qwikibox_scroll_x-=100;      
          qwikibox.scroll({
            top: qwikibox_scroll_y,
            left: qwikibox_scroll_x,
            behavior: "smooth"
          });
          ee.preventDefault();
          ee.stopPropagation();
        }
      }
      if(ee.key == "ArrowRight"){
        //console.log("Right");
        if(qwikibox.scrollLeft < qwikibox.scrollWidth){        
          qwikibox_scroll_x+=100; 
          qwikibox.scroll({
            top: qwikibox_scroll_y,
            left: qwikibox_scroll_x,
            behavior: "smooth"
          });
          ee.preventDefault();
          ee.stopPropagation();
        }
      }
    }
    
    if(checkCombis(ee) == 4){
        if(qwikiboxsearch.style.display=="block"){
            qwikiboxsearch.style.display="none";
            return;
        }
        qwikiboxsearch.style.left = window.innerWidth/2-parseInt(qwikiboxsearch.style.width)/2+"px";
        qwikiboxsearch.style.top = window.innerHeight/2-parseInt(qwikiboxsearch.style.height)/2+"px";
        search.addEventListener("keyup",wikisearch,true);
        qwikiboxsearch.style.display="block";
        search.focus();
    }
}

function mouse_monitor(e){
  var word = getFullWord(e);
  if(word !== ""){
	//console.log(word);
  }
}

function handleResponse(response) {
  var parser = new DOMParser();
  response.data = response.data.replace(/href="(?!.+:\/\/|\/\/)/g,wikisource);
  var html = parser.parseFromString(response.data, "text/html");
  var method = response.method;
  if(html.getElementById("mw-content-text")){
    var content = html.getElementById("mw-content-text");
    if(qwikibox.hasChildNodes()){
        qwikibox.removeChild(qwikibox.firstChild);
    }
    var i=0;
    if(method == 1){
        qwikibox.appendChild(content);
        qwikibox.style.width=window.innerWidth/1.5+"px";
        qwikibox.style.height=window.innerHeight/1.5+"px";
    }
    if(method == 2){
        var p;
        p = content.getElementsByClassName("infobox");
        if(!p.length)p = content.getElementsByClassName("infobox_v3");
        if(p.length){
          p=p[0].nextSibling;
          if(p.nodeType == 3)p=p.nextSibling;
        }else{
          while(content.children[i].tagName.toLowerCase()!="p"){
            i++;
          }
          p = content.children[i];
        }
        qwikibox.appendChild(p);
        qwikibox.style.width=window.innerWidth/3+"px";
        qwikibox.style.height=window.innerHeight/2+"px";
    }
    if(method == 3){
        var t;
        t = content.getElementsByClassName("infobox");
        if(!t.length)t = content.getElementsByClassName("infobox_v3");
        if(!t.length)t = content.getElementsByClassName("wikitable");
        if(!t.length)t = content.getElementsByClassName("thumb tright");
        t.length?t=t[0]:t=0;
        if(!t){
          while(content.children[i].id && content.children[i].id.match(/Infobox/i)===null){
              i++;
          }
          if(i==content.children.length){
              return;
          }
          t = content.children[i];
        }
        qwikibox.appendChild(t);
        qwikibox.style.width=window.innerWidth/3+"px";
        qwikibox.style.height=window.innerHeight/1.5+"px";
    }
    qwikibox.style.left = window.innerWidth/2-parseInt(qwikibox.style.width)/2+"px";
    qwikibox.style.top = window.innerHeight/2-parseInt(qwikibox.style.height)/2+"px";
    qwikibox.style.display = "block";
    qwikibox.scrollTop = 0;
  }
}

function readOptions() {
  function read(result) {
    if(result.language){
      language = result.language;
    }else{
      language  = browser.i18n.getUILanguage();
    }
    wikisource = `href="https://${language}.wikipedia.org`;
  }

  function gotCombis(result){
    if(result.combis){
      comb=result.combis;
    }else{
      comb=dcomb.slice();
    }
  }
  function onError(error) {console.log(`Error: ${error}`);}

  var getting = browser.storage.local.get("language");
  getting.then(read, onError);

  var getting_combis = browser.storage.local.get("combis");
  getting_combis.then(gotCombis, onError);

}


function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    if (style.styleSheet) style.styleSheet.cssText = css;
    else style.appendChild(document.createTextNode(css));
    head.appendChild(style);
}

function hasClass( target, className ) {
    return new RegExp('(\\s|^)' + className + '(\\s|$)').test(target.className);
}
