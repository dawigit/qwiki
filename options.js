document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("#oresetbutton").addEventListener("click", defaultOptions);
document.querySelector("#oti").textContent=browser.i18n.getMessage("optionsTitle");
document.querySelector("#ollanguage").textContent=browser.i18n.getMessage("optionsLanguage");
document.querySelector("#olcomplete").textContent=browser.i18n.getMessage("optionsC");
document.querySelector("#olshort").textContent=browser.i18n.getMessage("optionsS");
document.querySelector("#oltable").textContent=browser.i18n.getMessage("optionsT");
document.querySelector("#olquick").textContent=browser.i18n.getMessage("optionsQ");
document.querySelector("#osavebutton").textContent=browser.i18n.getMessage("optionsSave");
document.querySelector("#oresetbutton").textContent=browser.i18n.getMessage("optionsReset");
var flags = ["ar","bg","ca","cs","da","de","en","eo","es","et","eu","fa","fi","fr","he","hi","hr","hu","id","it","ja","kk","ko","lt","ms","nl","no","pl","pt","ro","ru","sk","sl","sr","sv","tr","uk","vi","war","zh"];
var flag_urls = [];
var select_language = document.querySelector("#oselectlanguage");

var dcomb = [      //A C S [0=lmb,1=mmb,2=rmb]
  ["oinputcomplete",[1,0,0,0,""]],
  ["oinputshort",   [1,0,1,0,""]],
  ["oinputtable",   [1,1,0,0,""]],
  ["oinputquick",   [1,0,0,-1,"j"]]
];
var comb = [];
var combis_loaded = false;

for(let f in flags){
  flag_urls[f] = browser.runtime.getURL(`flags/${flags[f]}.png`);
  let o = document.createElement("option");
  o.value = flags[f];
  o.textContent = `   ${flags[f]}`;
  o.style = `background-image:url(${flag_urls[f]});background-repeat: no-repeat; background-position: right;`;
  select_language.appendChild(o);
}
document.addEventListener("mousedown",inputClick);
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("#oinputquick").addEventListener("keydown", inputKey);
select_language.addEventListener("change",changedLanguage);

function inputKey(e){
  e.preventDefault();
  e.stopPropagation();
  console.log(`ek: ${e.key} alt: ${e.altKey} ctrl: ${e.ctrlKey} shift: ${e.shiftKey}`);
  if(e.key == "Alt" || e.key == "Control" || e.key == "Shift" || e.key =="OS")return false;
  let nc = [e.target.id,[e.altKey?1:0,e.ctrlKey?1:0,e.shiftKey?1:0,-1,e.key?e.key:""]];
  if(nc[1][2] && !(nc[1][0] || nc[1][1]))return false;
  if(!(nc[1][4] && (nc[1][0]||nc[1][1]||nc[1][2])))return false;
  let ee = e;
  ee.button = -1;
  inputClick(ee);
  return false;
}

function inputClick(e){
  if(e.target.id == "oinputquick" && !e.key)return;
  let f = 0,fp;
  for(let i=0;i<comb.length;i++){if(comb[i][0]==e.target.id){f = 1; fp = i; break;}}
  if(!f)return;
  e.preventDefault();
  e.stopPropagation();
  let nc = [e.target.id,[e.altKey?1:0,e.ctrlKey?1:0,e.shiftKey?1:0,e.button,e.key?e.key:""]];
  if(!(nc[1][0] || nc[1][1] || nc[1][2]))return;
  let jnc = JSON.stringify(nc[1]);
  for(let c=0;c<comb.length;c++){
    if( comb[c] && (JSON.stringify(comb[c][1]) === jnc) )return;
  }
  comb[fp]=nc;
  updateGUI();
  return false;
}

function combiString(e){
  let s = "";
  if(e[0])s+="alt";
  if(e[1])s+=(s?" + ctrl":"ctrl");
  if(e[2])s+=(s?" + shift":"shift");
  if(e[3]==0)s+=(s?" + lmb":"lmb");
  if(e[3]==1)s+=(s?" + mmb":"mmb");
  if(e[3]==2)s+=(s?" + rmb":"rmb");
  if(e[4])s+=(s?` + ${e[4]?e[4]:""}`:`${e[4]?e[4]:""}`);
  return s;
}

function saveOptions(e) {
  if(e){e.preventDefault();}
  browser.storage.local.set({
    language: document.querySelector("#oselectlanguage").value
  });
  browser.storage.local.set({
    combis: comb
  });
  browser.extension.getBackgroundPage().optionsUpdated();
}

function defaultOptions(e){
  if(e){e.preventDefault();}
  comb = dcomb.slice();
  browser.storage.local.set({combis: comb});
  browser.storage.local.set({language: "en"});
  updateGUI();
  //browser.extension.getBackgroundPage().optionsUpdated();
}

function updateGUI(){
  for(let i=0;i<comb.length;i++){
    if(comb[i][0] == "oinputquick"){
      document.querySelector(`#${comb[i][0]}`).value = combiString(comb[i][1]);
    }else{
      document.querySelector(`#${comb[i][0]}`).textContent = combiString(comb[i][1]);
    }
  }
}

function changedLanguage(e){
  updateFlag(e.target.value);
}

function updateFlag(language){
  if(flags.includes(language)){
    let i = flags.indexOf(language)
    document.querySelector("#oimageflag").src = flag_urls[i];
  }
}

function restoreOptions() {
  function setLanguage(result) {
    let language;
    if(result.language){
      language = result.language;
    }else{
      language  = browser.i18n.getUILanguage();
    }
    console.log(`raw lang=${language}`);
    if(language.length>3){
      language = language.substring(0,2);
      browser.storage.local.set({ language: language });
    }
    console.log(`lang=${language}`);
    document.querySelector("#oselectlanguage").value = language;
    updateFlag(language);
  }
  function setCombis(result){
    comb = [];
    let r = result.combis;
    if(r && r.length){
      for(let i=0;i<r.length;i++){
        if(r[i] && r[i][0]){
          comb[i] = r[i];
        }else{
          comb[i] = dcomb[i];
        }
      }
    }else{
      comb = dcomb.slice();
    }
    updateGUI();
    combis_loaded = true;
    browser.runtime.sendMessage({combis: comb});
  }
  function setCombisError(error){
    defaultOptions();
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  function onNoLang(error){
    console.log("no lang!");
    defaultOptions();
    saveOptions();
  }

  var getting_language = browser.storage.local.get("language");
  getting_language.then(setLanguage, onNoLang);
  var getting_combis = browser.storage.local.get("combis");
  getting_combis.then(setCombis, setCombisError);
}



