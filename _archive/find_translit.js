const fs=require("fs");
const html=fs.readFileSync("C:/Users/chris/Desktop/Hebrew BOM/BOM.html","utf8");

const pn=new Set(["nephi","alma","ammon","aaron","moroni","mormon","mosiah","helaman","ether","jacob","enos","jarom","omni","lamoni","laman","lemuel","ishmael","jerusalem","zarahemla","gideon","coriantumr","pahoran","gadianton","amulek","zoram","noah","korihor","mulek","bountiful","lehi","sam","abinadi","zeniff","limhi","ammonihah","middoni","kishkumen","moronihah","teancum","moriantum","shiblon","corianton","zeezrom","antionah","kumenonhi","lachoneus","gidgiddoni","zemnarihah","timothy","jonas","zedekiah","jeremiah","isaiah","christ","jesus","yeshua","messiah","god","lord","adam","eve","moses","abraham","sarah","david","israel","judah","joseph","benjamin","seth","cain","abel","o","amen","rameumptom","sariah","laban","zoramites","amaleki","amalickiah","amlici","ammoron","aminadab","aminadi","anti","antipas","antipus","cezoram","chemish","cohor","corihor","cumeni","cumorah","deseret","enoch","esrom","ezias","gad","gid","giddianhi","gilgal","gimgimno","hagoth","hem","hermounts","isabel","irreantum","jared","jershon","joneam","josh","kib","kim","kish","lachish","lib","liahona","luram","manti","mathoni","mathonihah","melek","midian","moriancumer","morianton","moron","nahom","neas","nehor","nimrah","nimrod","ogath","onidah","onti","oriha","paanchi","pacumeni","pachus","pagag","rabbanah","riplah","riplakish","seezoram","sebus","shared","sharon","shelem","shem","shemnon","sherem","sherrizah","shilom","shiloah","shimnilon","shiz","shule","shurr","sidom","sidon","siron","teomner","tubaloth","zerahemnah","zeram","ziff","zion","zoramite","egypt","egyptian","hebrew","lamanite","lamanites","nephite","nephites","jaredite","jaredites","mulekite","mulekites","amalekite","amalekites","jacobite","josephite","ishmaelite","ishmaelites","gadiantonites"]);
var cwArr=[];
cwArr.push("behold","arise","amen","yea","nay","thus","lo","now","not","all","who","which","that","this","what","how","why","if","or","so","but","and","for","to","of","in","on","at","by","up","out","it","he","she","we","me","you","i","god","again","also","even","both","here","there","where","when","then","than","them","they","him","her","his","its","our","your","us","no","yes");
cwArr.push("many","much","more","most","some","any","few","other","such","each","every","do","be","go","see","say","come","take","give","know","make","one","two","three","four","continually","truly","surely","therefore","king","people","son","daughter","father","mother","brother","sister","man","woman","land","city","house","place","day","year","word","name","heart","soul","spirit","water","fire","power");
cwArr.push("great","good","evil","holy","righteous","wicked","mighty","blessed","cursed","living","dead","first","last","free","captive","judge","priest","prophet","chief","captain","servant","master","war","peace","battle","sword","prison","the","a","an","is","are","was","were","been","being","have","has","had","having","will","would","shall","should","may","might","can","could","must","need");
cwArr.push("with","from","about","into","through","during","before","after","above","below","between","under","over","own","my","thy","mine","thine","their","these","those","am","done","gone","said","came","took","gave","knew","made","saw","went","got","let","put","set","run","cut","sit","eat","lie","die","thing","things","time","part","way","work","hand","hands","eye","eyes","head");
cwArr.push("life","death","earth","heaven","world","sea","blood","flesh","bone","mouth","face","voice","seed","tree","fruit","vine","rock","stone","iron","brass","gold","silver","wood","dust","sand","cloud","wind","rain","snow","field","garden","gate","wall","tower","tent","ship","boat","altar","temple","throne","grave","pit","cave","men","women","children","child","sons","nation","nations","tribe","tribes","army","host","hosts","armies");
cwArr.push("spoke","told","heard","seen","known","given","taken","found","lost","left","kept","held","brought","taught","fought","caught","thought","sought","wrought","send","sent","bring","call","called","answer","asked","ten","five","six","seven","eight","nine","hundred","thousand","new","old","young","long","high","deep","wide","full","empty","strong","weak","rich","poor","wise","true","false");
cwArr.push("just","pure","whole","right","wrong","light","dark","white","black","red","night","still","alone","down","away","very","too","once","always","never","often","soon","only","upon","unto","among","against","toward","beyond","within","without","together","because","lest","until","since","while","though","whether","either","neither","like","well","far","near","back","forth","yet","already","else","perhaps");
cwArr.push("according","concerning","notwithstanding","nevertheless","wherefore","inasmuch","insomuch","whatsoever","whosoever","nothing","something","everything","anyone","everyone","anything","enough","same","another","next","joy","anger","fear","love","hate","hope","faith","truth","grace","glory");
cwArr.push("salvation","redemption","resurrection","atonement","baptism","repentance","commandment","commandments","covenant","covenants","promise","promises","offering","offerings","sacrifice","sacrifices","prayer","prayers","testimony","knowledge","wisdom","understanding","instruction","law","laws","judgment","judgments","justice","mercy","iniquity","sin","sins","transgression");
cwArr.push("abomination","abominations","wickedness","righteousness","holiness","destruction","desolation","captivity","bondage","liberty","freedom","prosperity","abundance","famine","plague","pestilence","earthquake","storm","sign","signs","wonder","wonders","miracle","miracles","record","records","plate","plates","writing","writings","scripture","scriptures","church","synagogue","sanctuary");
cwArr.push("rod","staff","bow","arrow","arrows","spear","sling","garment","garments","robe","robes","cloth","clothes","food","drink","bread","wine","oil","honey","grain","wheat","corn","barley","horse","horses","cattle","sheep","goat","goats","flock","flocks","herd","herds","ass","ox","swine","serpent","serpents","beast","beasts","bird","birds","fish");
cwArr.push("river","lake","fountain","spring","pool","ocean","island","mountain","hill","valley","plain","desert","wilderness","forest","north","south","east","west","morning","evening","noon","summer","winter","harvest","season","age","birth","end","beginning","middle","number","measure","weight","month","generation","generations","rest","sleep","dream","vision","trance");
cwArr.push("cry","weep","mourn","rejoice","sing","praise","worship","pray","teach","learn","preach","baptize","bless","curse","heal","save","redeem","destroy","build","plant","sow","reap","gather","scatter","divide","separate","join","bind","loose","open","shut","break","mend","fill","pour","wash","cleanse","anoint","burn","kindle","quench");
cwArr.push("lead","follow","guide","rule","reign","govern","command","obey","rebel","fight","smite","slay","kill","wound","protect","defend","attack","conquer","overcome","prevail","submit","surrender","flee","escape","hide","seek","search","discover","reveal","conceal","cover","uncover");
cwArr.push("ask","speak","listen","hear","tell","declare","proclaim","announce","testify","witness","confess","deny","accuse","condemn","forgive","pardon","swear","vow","pledge","agree","refuse","accept","reject","believe","doubt","trust","betray","deceive","tempt","provoke");
cwArr.push("desire","envy","covet","lust","greed","humility","patience","labor","toil","strive","endure","suffer","bear","carry","lift","raise","fall","rise","stand","walk","fly","swim","climb","descend","ascend","pass","cross","enter","leave","depart","arrive","return","remain","stay","dwell","abide","inhabit","sojourn","journey","travel","wander");
cwArr.push("possess","inherit","receive","obtain","acquire","purchase","sell","trade","pay","owe","lend","borrow","steal","rob","plunder","spoil","pride");
const cw=new Set(cwArr);

function isT(g){
if(!g||g.trim()==="")return false;
var c=g.replace(/[()]/g,"").trim();
if(!c||c.includes("-")||c.length<2||c.length>12)return false;
if(pn.has(c.toLowerCase())||cw.has(c.toLowerCase()))return false;
if(c.includes(" "))return false;
var hebRe=new RegExp("[\u0590-\u05FF]");
if(hebRe.test(c))return false;
if(!/^[A-Z]/.test(c))return false;
if(c.length>1&&c===c.toUpperCase())return false;
pn.add("kohor");pn.add("korintomr");pn.add("coriantum");pn.add("orihah");pn.add("jacobites");pn.add("jew");pn.add("jews");pn.add("khish");pn.add("znok");pn.add("zrom");
if(/[!/]/.test(c))return false;
return true;}
pn.add("seraphim");
pn.add("sheol");
pn.add("amulon");
pn.add("coriantor");
pn.add("akish");
pn.add("helam");
pn.add("samuel");
pn.add("nephihah");
pn.add("zenos");
pn.add("zenock");
pn.add("neum");
pn.add("amlicite");
pn.add("amlicites");
pn.add("ammaron");
pn.add("antiparah");
pn.add("nahor");
pn.add("heth");
pn.add("shez");
pn.add("omer");
pn.add("emer");
pn.add("com");
pn.add("shemlon");
pn.add("shiblom");
pn.add("pahkoos");
pn.add("antionum");
pn.add("abinadom");
pn.add("ablom");
pn.add("ahah");
pn.add("ahaz");
pn.add("aram");
pn.add("assyria");
pn.add("babylon");
pn.add("bashan");
pn.add("boaz");
pn.add("calno");
pn.add("chaldeans");
pn.add("damascus");
pn.add("ephraim");
pn.add("geba");
pn.add("hamath");
pn.add("isaac");
pn.add("jeberechiah");
pn.add("jesse");
pn.add("john");
pn.add("jordan");
pn.add("judean");
pn.add("lebanon");
pn.add("madmenah");
pn.add("manasseh");
pn.add("naphtali");
pn.add("nazareth");
pn.add("oreb");
pn.add("pharaoh");
pn.add("philistia");
pn.add("rahab");
pn.add("ramah");
pn.add("rezin");
pn.add("samaria");
pn.add("saul");
pn.add("sinim");
pn.add("solomon");
pn.add("tarshish");
pn.add("uriah");
pn.add("uzziah");
pn.add("zebulun");
pn.add("gebim");
pn.add("anathoth");
pn.add("ophir");
pn.add("levi");
pn.add("amaron");
pn.add("angola");
pn.add("antum");
pn.add("joshua");
pn.add("gidgiddonah");
pn.add("amos");
pn.add("bible");
pn.add("hosanna");
pn.add("rameumptom");
pn.add("seraphim");
pn.add("ethiopia");
pn.add("midianite");
pn.add("tabernacle");
cw.add("himself");
cw.add("herself");
cw.add("itself");
cw.add("themselves");
cw.add("myself");
cw.add("yourself");
cw.add("ourselves");
cw.add("eternal");
cw.add("almighty");
cw.add("creator");
cw.add("counselor");
cw.add("reeds");
cw.add("adversary");
cw.add("everlasting");
cw.add("wonderful");
cw.add("beautiful");
cw.add("terrible");
cw.add("horrible");
cw.add("precious");
cw.add("zealous");
cw.add("glorious");
cw.add("gracious");
cw.add("righteous");
cw.add("marvelous");
cw.add("spacious");
cw.add("delicious");
cw.add("industrious");
cw.add("rebellious");
cw.add("numerous");
cw.add("cautious");
cw.add("curious");
cw.add("anxious");
cw.add("previous");
cw.add("continuous");
cw.add("obvious");
cw.add("serious");
cw.add("mysterious");
cw.add("enormous");
cw.add("dangerous");
cw.add("furious");
cw.add("generous");
cw.add("nervous");
cw.add("religious");
cw.add("tremendous");
cw.add("various");

var cp=new RegExp("const\\s+(\\w+Verses)\\s*=\\s*\\[","g");
var vp=new RegExp("\\{\\s*num\\s*:\\s*\"([^\"]+)\"\\s*,\\s*words\\s*:\\s*\\[","g");
var pp=new RegExp("\\[\"([^\"]*?)\"\\s*,\\s*\"([^\"]*?)\"\\]","g");
var m,res=[];

while((m=cp.exec(html))!==null){
  var vn=m[1];var si=m.index+m[0].length;
  var d=1,i=si;
  while(i<html.length&&d>0){if(html[i]==="[")d++;else if(html[i]==="]")d--;i++;}
  var ac=html.substring(si,i-1);
  vp.lastIndex=0;var vm;
  while((vm=vp.exec(ac))!==null){
    var verseNum=vm[1];var ws=vm.index+vm[0].length;
    var wd=1,wi=ws;
    while(wi<ac.length&&wd>0){if(ac[wi]==="[")wd++;else if(ac[wi]==="]")wd--;wi++;}
    var wc=ac.substring(ws,wi-1);
    pp.lastIndex=0;var pm;
    while((pm=pp.exec(wc))!==null){
      if(isT(pm[2])){res.push({ch:vn,v:verseNum,h:pm[1],g:pm[2]});}
    }
  }
}

var colP=new RegExp("const\\s+colophonWords\\s*=\\s*\\[([\\s\\S]*?)\\];");
var colM=html.match(colP);
if(colM){pp.lastIndex=0;var pm;while((pm=pp.exec(colM[1]))!==null){if(isT(pm[2])){res.push({ch:"colophonWords",v:"colophon",h:pm[1],g:pm[2]});}}}

console.log("chapter_var|verse_num|hebrew_word|transliteration_gloss");
console.log("---");
for(var r of res)console.log(r.ch+"|"+r.v+"|"+r.h+"|"+r.g);
console.log("---");
console.log("Total: "+res.length);
var ug=new Map();
for(var r of res){if(!ug.has(r.g))ug.set(r.g,[]);ug.get(r.g).push(r);}
console.log("Unique glosses: "+ug.size);console.log("");
var s=[...ug.entries()].sort(function(a,b){return b[1].length-a[1].length;});
for(var e of s){var h=[...new Set(e[1].map(function(x){return x.h;}))].join(", ");
console.log("  "+JSON.stringify(e[0])+" ("+e[1].length+"x) -- Hebrew: "+h);}
