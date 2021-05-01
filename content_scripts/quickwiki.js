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
var box,boxsearch,search;
window.addEventListener("keydown", keyaway, true);
window.addEventListener("click", click, true);
addGlobalStyle(".qwikiinfo { border-style: solid;border-width: 2px;border-radius: 6px;padding: 8px;position: fixed; display: none; width: "+window.innerWidth/1.5+"px; height:"+window.innerHeight/1.5+"px; background-color:rgba(230, 230, 230, 1); z-index:9999999; overflow-y:scroll;}");
addGlobalStyle(".boxsearch { position: fixed; display: none; width: auto; height: auto; z-index:9999999;}");
addGlobalStyle(".qwikisearch { display: inherit; border-style: solid;border-width: 2px;border-radius: 6px;padding: 8px;width: auto; height: auto;}");
box = document.createElement("div");
box.classList.add("qwikiinfo");
document.body.appendChild(box);
boxsearch = document.createElement("div");
boxsearch.classList.add("boxsearch");
boxsearch.style.width="168px";
boxsearch.style.height="32px";
search = document.createElement("input");
search.id="search";
search.classList.add("qwikisearch");
boxsearch.appendChild(search);
document.body.appendChild(boxsearch);
readOptions();
browser.runtime.onMessage.addListener(request => {
  if(request.optionsupdate){
    readOptions();
  }
});


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

  //console.log('click');
  method = checkCombis(e);
	let st,et;
  et = e.target;
  while(1){
    if(et.parentElement){et = et.parentElement;}else{break;}
    if(et == box)break;
  }
  if(et == box){
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
  var word;
	word = window.getSelection().toString()
	console.log(`word=${word}`);
	if(word && e.altKey==true){
		getContent(word,"",method);
		return false;
	}

  if(method){
    e.preventDefault();
    e.stopPropagation();
      //word = getFullWord(e);
			word = window.getSelection().toString()
      console.log(`word=${word}`);
      if(word.substr(-1).match(/(\W)/)){
        word=word.substr(0,word.length-1);
      }
  }else{
    if(e.button == 2 && e.shiftKey){
      e.preventDefault();
      e.stopPropagation();
    }
  }
  if(box.style.display=="block" && e.button === 0){
        box.style.display="none";
      return false;
  }
  if(e.altKey == true){
    getContent(word,"",method);
    return false;
  }
  return 0;
}

function wikisearch(e){
  if(!e){e=window.event;}
  if(e.key === "Enter" && e.target.value){
      boxsearch.style.display="none";
      let q = e.target.value.split(":").reverse();
      getContent(...q);
      //getContent(q[0],q[1]?q[1]:"",q[2]?q[2]:1,q[3]?q[3]:"");
      search.removeEventListener("input",wikisearch,false);
  }
}

function keyaway(e){
    if(!e){e=window.event;}
    if(box.style.display == "block" && e.key === "Escape"){
        box.style.display = "none";
    }
    if(boxsearch.style.display=="block" && e.key === "Escape"){
        boxsearch.style.display="none";
    }
    let ee = e;
    ee.button = -1;
    if(checkCombis(ee) == 4){
        if(boxsearch.style.display=="block"){
            boxsearch.style.display="none";
            return;
        }
        boxsearch.style.left = window.innerWidth/2-parseInt(boxsearch.style.width)/2+"px";
        boxsearch.style.top = window.innerHeight/2-parseInt(boxsearch.style.height)/2+"px";
        search.addEventListener("keyup",wikisearch,true);
        boxsearch.style.display="block";
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
    if(box.hasChildNodes()){
        box.removeChild(box.firstChild);
    }
    var i=0;
    if(method == 1){
        box.appendChild(content);
        box.style.width=window.innerWidth/1.5+"px";
        box.style.height=window.innerHeight/1.5+"px";
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
        box.appendChild(p);
        box.style.width=window.innerWidth/3+"px";
        box.style.height=window.innerHeight/2+"px";
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
        box.appendChild(t);
        box.style.width=window.innerWidth/3+"px";
        box.style.height=window.innerHeight/1.5+"px";
    }
    box.style.left = window.innerWidth/2-parseInt(box.style.width)/2+"px";
    box.style.top = window.innerHeight/2-parseInt(box.style.height)/2+"px";
    box.style.display = "block";
    box.scrollTop = 0;
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
    style.type = 'text/css';
    if (style.styleSheet) style.styleSheet.cssText = css;
    else style.appendChild(document.createTextNode(css));
    head.appendChild(style);
}

function hasClass( target, className ) {
    return new RegExp('(\\s|^)' + className + '(\\s|$)').test(target.className);
}
