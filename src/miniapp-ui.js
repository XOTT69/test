// Premium mobile-first Telegram Mini App user interface. Data is never embedded into the HTML.
export function miniAppHtml(){
return String.raw`<!doctype html>
<html lang="uk">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#f7f9ff">
<meta name="color-scheme" content="light">
<title>Оселя — турбота про дім</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
:root{--ink:#111f4b;--muted:#8492b4;--purple:#6556f6;--violet:#986af9;--blue:#5bafff;--surface:#fff;--bg:#f6f8ff;--line:#e9edfa;--shadow:0 12px 38px rgba(72,87,159,.09);--radius:24px}
*{box-sizing:border-box}html{background:var(--bg);-webkit-tap-highlight-color:transparent}body{padding:0;margin:0;color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;font-size:14px;line-height:1.45;background:radial-gradient(ellipse at 10% 0%,#e4eeff 0%,transparent 46%),radial-gradient(ellipse at 94% 11%,#eee6ff 0%,transparent 39%),var(--bg);min-height:100dvh}
button,input,textarea,select{font:inherit}button{border:0;cursor:pointer}button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:3px solid #b5aeff;outline-offset:2px}
#app{max-width:540px;margin:0 auto;min-height:100dvh;padding:env(safe-area-inset-top) 0 calc(98px + env(safe-area-inset-bottom))}
.topbar{padding:24px 22px 12px;display:flex;align-items:center;justify-content:space-between;gap:12px}.identity{display:flex;align-items:center;gap:12px}.brandmark{width:48px;height:48px;border-radius:17px;display:grid;place-items:center;font-size:27px;color:white;background:linear-gradient(140deg,#8fbdff,#6b6afa 64%,#8152f6);box-shadow:0 7px 16px #6157ed3b}.brandname{font-size:25px;line-height:1.05;font-weight:850;letter-spacing:-.85px}.caption{font-size:12px;color:var(--muted);margin-top:4px}.round-btn{background:white;width:43px;height:43px;border-radius:15px;color:var(--purple);box-shadow:var(--shadow);font-size:20px}
.content{padding:8px 20px 30px}.section-title{font-size:19px;font-weight:820;letter-spacing:-.45px;display:flex;justify-content:space-between;align-items:center;margin:24px 0 13px;gap:12px}.section-title:first-child{margin-top:5px}
.subtle{color:var(--muted)}.tiny{font-size:11px}.small{font-size:12px}.bold{font-weight:750}.right{text-align:right}.text-purple{color:var(--purple)}
.pill{display:inline-flex;align-items:center;gap:5px;border-radius:100px;padding:6px 10px;background:#f2f0ff;color:#6553d9;font-size:11px;font-weight:750;white-space:nowrap}.pill.green{color:#179c66;background:#e8f9ee}.pill.warn{color:#be7420;background:#fff3e2}.pill.red{color:#e44d69;background:#ffeaf0}
.card{background:var(--surface);border:1px solid #ffffffbb;border-radius:var(--radius);padding:17px;box-shadow:var(--shadow)}.card+.card{margin-top:11px}.hero{padding:23px 20px;position:relative;overflow:hidden;background:linear-gradient(125deg,#dce8ff 0%,#e5e6ff 50%,#f9eafc 100%);box-shadow:0 16px 34px #7384cb1e;min-height:177px}.hero:after{content:"";position:absolute;width:200px;height:200px;right:-48px;top:-56px;border-radius:50%;border:25px solid #fff8;box-shadow:0 0 0 30px #fff3;pointer-events:none}.hero h1{font-size:23px;max-width:230px;line-height:1.22;letter-spacing:-.7px;margin:9px 0 9px}.hero p{max-width:228px;font-size:13px;color:#697aaf;margin:0 0 18px}.hero .emoji-home{position:absolute;right:19px;bottom:12px;font-size:92px;filter:drop-shadow(0 8px 13px #9da8d488)}.hero .btn{z-index:1;position:relative}
.btn{display:inline-flex;justify-content:center;align-items:center;gap:7px;padding:11px 15px;border-radius:14px;font-weight:780;background:#f0f0ff;color:var(--purple);line-height:1.1;min-height:41px}.btn.primary{background:linear-gradient(105deg,#719cff,#644ff2);color:white;box-shadow:0 7px 15px #6b67ee38}.btn.ghost{background:#f3f5ff;color:#6673a2}.btn.danger{background:#ffebef;color:#d94f68}.btn.full{width:100%}.btn.sm{padding:8px 11px;border-radius:12px;min-height:33px;font-size:12px}.btn:disabled{opacity:.45;pointer-events:none}
.metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px;margin-top:14px}.metric{min-height:114px;position:relative;overflow:hidden}.metric .iconbox{width:37px;height:37px;display:grid;place-items:center;border-radius:13px;font-size:22px;background:#edeaff}.metric .number{font-weight:880;font-size:24px;letter-spacing:-.5px;margin:10px 0 0}.metric .label{font-size:12px;color:#7b8aaf}.metric.red .number{color:#dd526d}.metric.blue .number{color:#3f7bef}.metric.green .number{color:#1db88d}.metric.orange .number{color:#e98e31}
.quick{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.quick-item{display:flex;align-items:center;flex-direction:column;gap:7px;background:none;color:var(--ink);padding:4px 0;text-align:center;font-size:11px;font-weight:700}.quick-icon{width:58px;height:56px;border-radius:19px;display:grid;place-items:center;background:white;box-shadow:var(--shadow);font-size:24px}.quick-item:nth-child(1) .quick-icon{background:#eaf5ff}.quick-item:nth-child(2) .quick-icon{background:#ffeaf3}.quick-item:nth-child(3) .quick-icon{background:#eeeaff}.quick-item:nth-child(4) .quick-icon{background:#e4faee}
.item{display:flex;align-items:center;gap:13px;padding:13px;border-radius:20px;background:white;margin-bottom:10px;box-shadow:0 7px 24px #5a74aa0e}.item-icon{width:46px;height:46px;flex:none;border-radius:15px;background:linear-gradient(135deg,#ecf5ff,#eee9ff);display:grid;place-items:center;font-size:23px}.item-content{min-width:0;flex:1}.item h3{font-size:13px;margin:0 0 4px;white-space:normal;font-weight:800}.item p{margin:2px 0 0;color:#7889b2;font-size:11px}.item .chevron{color:#aab3d3;font-size:22px}.item.actionable{cursor:pointer}.item .pills{margin-top:6px}.status-dot{width:9px;height:9px;border-radius:50%;display:inline-block;background:#2ac690;margin-right:5px}.status-dot.red{background:#f24d6f}.status-dot.warn{background:#f7a344}
.progress{height:6px;background:#e9edfa;overflow:hidden;border-radius:99px;margin:10px 0 1px}.progress span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#6a8efb,#7956f4)}
.row{display:flex;align-items:center;justify-content:space-between;gap:10px}.row.wrap{flex-wrap:wrap}.vertical{display:flex;flex-direction:column;gap:11px}.empty{text-align:center;padding:34px 18px;color:#8290b1}.empty .big{font-size:48px;margin-bottom:8px}.empty h3{margin:0 0 4px;color:var(--ink)}.empty p{margin:0 auto 18px;max-width:265px}
.section-summary{margin-top:10px;display:flex;gap:8px;flex-wrap:wrap}
.bottom-nav{position:fixed;bottom:0;left:0;right:0;max-width:540px;margin:0 auto;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));padding:8px 9px calc(11px + env(safe-area-inset-bottom));background:#ffffffed;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid #e9eafb;z-index:20;box-shadow:0 -10px 27px #6c74aa0b}
.nav-btn{background:none;color:#9aa7c2;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 0;font-size:10px;font-weight:700}.nav-btn span{font-size:22px;width:39px;height:34px;border-radius:12px;display:grid;place-items:center}.nav-btn.active{color:var(--purple)}.nav-btn.active span{background:#eeebff}
.fab{position:fixed;right:max(22px,calc((100vw - 540px)/2 + 22px));bottom:calc(94px + env(safe-area-inset-bottom));border-radius:18px;display:grid;place-items:center;color:white;width:56px;height:56px;background:linear-gradient(140deg,#75b0ff,#664ff4);font-size:30px;box-shadow:0 12px 25px #5c67dc55;z-index:15}
.screen-header{padding:2px 0 5px}.screen-header h1{font-size:29px;letter-spacing:-1.2px;margin:0 0 3px}.screen-header p{margin:0;color:#8491b0;font-size:13px}.summary-strip{display:flex;gap:8px;margin:16px 0}.summary-strip>div{flex:1;background:#fff;border-radius:16px;padding:12px;text-align:center}.summary-strip strong{font-size:20px;display:block}.summary-strip span{font-size:10px;color:var(--muted)}
.system-card{background:linear-gradient(120deg,#f2f7ff,#eff0ff);padding:18px;position:relative;overflow:hidden;margin-bottom:14px}.system-card:after{position:absolute;content:"💧";font-size:70px;opacity:.2;right:20px;top:11px}.system-card h3{margin:0 0 8px;font-size:17px}.system-card .details{font-size:12px;color:#7382a5;position:relative;z-index:1}.system-card .row{position:relative;z-index:2;margin-top:13px}
.tabs{display:flex;gap:7px;background:#e9ecf9;padding:5px;border-radius:16px;margin:15px 0}.tabs button{background:transparent;border-radius:12px;padding:9px 12px;color:#8894b7;flex:1;font-weight:750;font-size:12px}.tabs button.active{background:white;color:var(--purple);box-shadow:0 3px 11px #777ab624}
.input-search{height:47px;width:100%;border:1px solid #e4e9f8;padding:0 14px;border-radius:15px;background:#fff;outline:none;font-size:13px;color:var(--ink)}.input-search:focus{border-color:#8d83ff}
.overlay{position:fixed;inset:0;background:#15183f89;backdrop-filter:blur(5px);z-index:50;display:flex;align-items:flex-end;justify-content:center;padding:0}.sheet{width:100%;max-width:540px;max-height:94dvh;overflow:auto;background:#fff;border-radius:30px 30px 0 0;padding:13px 22px calc(26px + env(safe-area-inset-bottom));box-shadow:0 -8px 55px #262c6866}.drag{width:40px;height:5px;border-radius:10px;background:#e0e5f5;margin:1px auto 15px}.sheet h2{font-size:22px;letter-spacing:-.5px;margin:0 0 17px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.field{display:flex;flex-direction:column;gap:5px;margin-bottom:12px;min-width:0}.field.wide{grid-column:1/-1}.field label{color:#637095;font-size:12px;font-weight:750}.field input,.field select,.field textarea{width:100%;border-radius:14px;padding:12px 13px;border:1px solid #e4e8f5;background:#f8f9ff;color:var(--ink);outline:none;min-height:44px}.field textarea{min-height:80px;resize:vertical}.field input:focus,.field textarea:focus,.field select:focus{border-color:#887aff;background:#fff}.field .hint{font-size:11px;color:#9aa6bd}.sheet-footer{display:flex;gap:9px;margin-top:8px}.sheet-footer .btn{flex:1}
.toast{position:fixed;z-index:100;left:50%;bottom:calc(94px + env(safe-area-inset-bottom));transform:translateX(-50%);background:#1a2353;color:#fff;padding:13px 18px;border-radius:14px;box-shadow:0 9px 24px #202b5c55;max-width:calc(100vw - 32px);width:max-content;font-size:13px;line-height:1.4}.danger-note{border-radius:15px;padding:12px;background:#fff1f3;color:#b9506d;font-size:12px;margin-bottom:12px}.loading{min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:var(--muted);padding:20px}.spinner{height:37px;width:37px;border-radius:50%;border:4px solid #e3e3ff;border-top-color:var(--purple);animation:spin 1s linear infinite;margin-bottom:18px}@keyframes spin{to{transform:rotate(360deg)}}.chart{display:flex;gap:8px;height:130px;align-items:end;padding:12px 0}.bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:end;height:100%;gap:6px;font-size:10px;color:var(--muted)}.bar{width:100%;max-width:25px;min-height:3px;border-radius:8px 8px 4px 4px;background:linear-gradient(#b79aff,#6558f8)}.list-check{border:2px solid #cdd6ec;background:white;width:24px;height:24px;flex:none;border-radius:9px;font-size:14px;color:white;display:grid;place-items:center}.list-check.done{background:#6c5af3;border-color:#6c5af3}
@media(min-width:700px){body{background:linear-gradient(125deg,#e9f3ff,#f8f6ff)}#app{background:radial-gradient(ellipse at top,#f1f2ff 0%,#f7f9ff 48%);box-shadow:0 0 90px #5563aa21}.bottom-nav{border-radius:22px 22px 0 0}}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
</style>
</head>
<body>
<div id="app"><div class="loading"><div class="spinner"></div>Завантажуємо твою Оселю…</div></div>
<div id="modal"></div><div id="toast"></div>
<script>
(function(){
"use strict";
var T=window.Telegram&&window.Telegram.WebApp, state={page:"home",data:null,selectedSystem:null,search:"",medicineFilter:"all",taskFilter:"active",busy:false};
if(T){T.ready();T.expand();try{T.setHeaderColor("#f7f9ff");T.setBackgroundColor("#f7f9ff")}catch(_){}}
var initData=T&&T.initData||"";
var app=document.getElementById("app"),modal=document.getElementById("modal"),toastEl=document.getElementById("toast");
function h(s){return String(s===null||s===undefined?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function fmt(s){if(!s)return "—";var a=s.split("-");return a[2]+"."+a[1]+"."+a[0]}
function money(x){return (Number(x||0)/100).toLocaleString("uk-UA",{minimumFractionDigits:2,maximumFractionDigits:2})+" ₴"}
function iso(d){var a=new Date(d);return a.toISOString().slice(0,10)}
function dayDiff(a,b){return Math.round((Date.parse(b+"T12:00:00Z")-Date.parse(a+"T12:00:00Z"))/864e5)}
function monthAdd(start,n){var a=start.split("-").map(Number),i=a[0]*12+a[1]-1+n,y=Math.floor(i/12),m=i%12;return y+"-"+String(m+1).padStart(2,"0")+"-"+String(Math.min(a[2],new Date(Date.UTC(y,m+1,0)).getUTCDate())).padStart(2,"0")}
function timeLeft(d){if(!d)return "Дата не вказана";var now=state.data.today,days=dayDiff(now,d);
 if(days<0)return "Прострочено "+(-days)+" дн.";if(days===0)return "Сьогодні";if(days===1)return "Завтра";
 var n=0;while(n<120&&monthAdd(now,n+1)<=d)n++;return(n?n+" міс. ":"")+(dayDiff(monthAdd(now,n),d))+" дн. · "+days+" дн. загалом"}
function status(d,threshold){if(!d)return "neutral";var dif=dayDiff(state.data.today,d);return dif<=0?"red":dif<=(threshold||7)?"warn":"green"}
function medicineStatus(m){var d=dayDiff(state.data.today,m.expires_at||"9999-12-31");return m.quantity===0||d<=0?"red":d<=30||(m.low_at>0&&m.quantity<=m.low_at)?"warn":"green"}
function badge(color,label){return '<span class="pill '+(color==="green"?"green":color==="warn"?"warn":color==="red"?"red":"")+'">'+h(label)+'</span>'}
function button(text,act,cl){return '<button type="button" class="btn '+(cl||"")+'" data-act="'+h(act)+'">'+text+'</button>'}
function pageTitle(title,desc){return '<div class="screen-header"><h1>'+title+'</h1><p>'+desc+'</p></div>'}
function blockTitle(text,right){return '<div class="section-title">'+text+(right||"")+'</div>'}
function item(icon,title,subtitle,act,right){return '<div class="item actionable" data-act="'+h(act)+'"><div class="item-icon">'+icon+'</div><div class="item-content"><h3>'+h(title)+'</h3><p>'+subtitle+'</p></div>'+(right||'<span class="chevron">›</span>')+'</div>'}
function empty(icon,title,subtitle,buttonLabel,act){return '<div class="card empty"><div class="big">'+icon+'</div><h3>'+title+'</h3><p>'+subtitle+'</p>'+(act?button(buttonLabel,act,"primary"):"")+'</div>'}
function note(text){return '<div class="danger-note">'+text+'</div>'}
function header(){var d=state.data;return '<header class="topbar"><div class="identity"><div class="brandmark">⌂</div><div><div class="brandname">Оселя</div><div class="caption">Турбота про дім, який об’єднує 💜</div></div></div><button class="round-btn" data-act="page:settings" aria-label="Налаштування">⚙</button></header>'}
function navigation(){var tabs=[["home","⌂","Головна"],["osmosis","💧","Осмос"],["medicines","🧰","Аптечка"],["tasks","☑","Справи"],["more","▦","Ще"]];return '<nav class="bottom-nav" aria-label="Основна навігація">'+tabs.map(function(x){var active=state.page===x[0]||x[0]==="more"&&["shopping","stats","family","settings","expenses"].includes(state.page);return '<button class="nav-btn '+(active?"active":"")+'" data-act="page:'+x[0]+'"><span>'+x[1]+'</span>'+x[2]+'</button>'}).join("")+'</nav>'}
function hero(){var d=state.data,filters=d.filters.filter(x=>dayDiff(d.today,x.due)<=7).length,exp=d.medicines.filter(x=>!x.archived&&x.expires_at&&dayDiff(d.today,x.expires_at)<=30).length;
return '<section class="card hero"><div class="pill">✨ Твій простір у порядку</div><h1>Важливі речі під контролем</h1><p>Турбота про дім і близьких — в одному зручному місці.</p>'+button("📅 План на тиждень","page:tasks","primary sm")+'<span class="emoji-home">🏡</span></section>'}
function metrics(){var d=state.data,f=d.filters.filter(x=>dayDiff(d.today,x.due)<=7).length,t=d.tasks.filter(x=>!x.done&&dayDiff(d.today,x.due)<=7).length,m=d.medicines.filter(x=>!x.archived&&(x.expires_at&&dayDiff(d.today,x.expires_at)<=30||x.quantity===0)).length,s=d.shopping.filter(x=>!x.done).length;
return '<div class="metrics">'+[["💧",f,"фільтрів до заміни","red","osmosis"],["☑",t,"справ цього тижня","blue","tasks"],["🧰",m,"позицій в аптечці","orange","medicines"],["🛒",s,"товарів у покупках","green","shopping"]].map(function(x){return '<button class="card metric '+x[3]+'" data-act="page:'+x[4]+'" style="text-align:left"><div class="iconbox">'+x[0]+'</div><div class="number">'+x[1]+'</div><div class="label">'+x[2]+'</div></button>'}).join("")+'</div>'}
function home(){var d=state.data;
var urgent=d.filters.filter(x=>dayDiff(d.today,x.due)<=7).slice(0,3);
var next=d.tasks.filter(x=>!x.done).slice().sort((a,b)=>a.due.localeCompare(b.due)).slice(0,3);
return hero()+metrics()+blockTitle("Швидкі дії")+ '<div class="quick">'+[["💧","Осмос","page:osmosis"],["🧰","Аптечка","page:medicines"],["🛒","Покупки","page:shopping"],["➕","Нова справа","new:task"]].map(x=>'<button class="quick-item" data-act="'+x[2]+'"><span class="quick-icon">'+x[0]+'</span>'+x[1]+'</button>').join("")+'</div>'+
blockTitle("Потребує уваги",button("Усе","page:osmosis","sm ghost"))+
(urgent.length?urgent.map(x=>item("💧",x.title,"Наступна заміна: "+fmt(x.due), "open:filter:"+x.id,badge(status(x.due),timeLeft(x.due)))).join(""):empty("✨","Усе чудово!","Наразі немає фільтрів, які потребують заміни."))+
blockTitle("Домашні справи",button("Переглянути","page:tasks","sm ghost"))+
(next.length?next.map(x=>item("☑",x.title,"До "+fmt(x.due),"open:task:"+x.id,badge(status(x.due),timeLeft(x.due)))).join(""):empty("🎉","Справ немає","Додай першу домашню справу.","➕ Додати","new:task"))}
function systems(){var d=state.data;
var list=d.systems.map(function(x){var filters=d.filters.filter(f=>f.osmosis_id===x.id),bad=filters.filter(f=>status(f.due)!=="green").length;
return '<div class="card system-card"><h3>💧 '+h(x.title)+'</h3><div class="details">'+h(x.model||"Модель не вказана")+(x.installed_at?" · Встановлено "+fmt(x.installed_at):"")+'</div><div class="row"><span class="pill '+(bad?"warn":"green")+'">'+filters.length+' картриджів'+(bad?" · "+bad+" потребують уваги":"")+'</span>'+button("Відкрити →","system:"+x.id,"sm primary")+'</div></div>'}).join("");
return pageTitle("Мій осмос","Кожен картридж — під наглядом.")+blockTitle("Мої системи",button("+ Додати","new:system","sm"))+
(list||empty("💧","Осмос ще не додано","Створи свою систему й додай фільтри.","➕ Додати осмос","new:system"))+
blockTitle("Усі картриджі",button("＋","new:filter","sm"))+
(d.filters.length?d.filters.map(filterCard).join(""):empty("🫧","Фільтрів немає","Додай перший картридж і дату заміни.","Додати фільтр","new:filter"))}
function filterCard(f){
return item("💧",f.title,"Заміна: "+fmt(f.due)+" · "+timeLeft(f.due)+(f.osmosis_id?" · "+h((state.data.systems.find(x=>x.id===f.osmosis_id)||{}).title||""):""),"open:filter:"+f.id,badge(status(f.due),status(f.due)==="red"?"Замінити":status(f.due)==="warn"?"Скоро":"В нормі"))}
function systemDetail(id){var x=state.data.systems.find(x=>x.id===id);if(!x)return systems();
var filters=state.data.filters.filter(f=>f.osmosis_id===id);
return '<div class="row"><button class="btn ghost sm" data-act="system:back">‹ Усі системи</button>'+button("✏️ Змінити","edit:system:"+id,"sm")+'</div><div class="card system-card" style="margin-top:14px"><h3>'+h(x.title)+'</h3><div class="details">⚙ '+h(x.model||"Модель не вказана")+'<br>📅 '+(x.installed_at?fmt(x.installed_at):"Дата встановлення невідома")+'</div></div>'+
blockTitle("Картриджі",button("＋ Додати","new:filter:"+id,"sm"))+
(filters.length?filters.map(filterCard).join(""):empty("💧","Поки без картриджів","Додай фільтр до цієї системи.","Додати фільтр","new:filter:"+id))}
function medicines(){var d=state.data,list=d.medicines.filter(m=>!m.archived),term=state.search.trim().toLocaleLowerCase("uk-UA");
if(term)list=list.filter(m=>(m.name+" "+m.form+" "+m.location).toLocaleLowerCase("uk-UA").includes(term));
if(state.medicineFilter==="soon")list=list.filter(m=>m.expires_at&&dayDiff(d.today,m.expires_at)<=30);
if(state.medicineFilter==="low")list=list.filter(m=>m.quantity===0||m.low_at>0&&m.quantity<=m.low_at);
var low=d.medicines.filter(m=>!m.archived&&(m.quantity===0||m.low_at>0&&m.quantity<=m.low_at)).length;
return pageTitle("Аптечка","Здоров’я близьких під контролем")+
'<div class="summary-strip"><div><strong>'+d.medicines.filter(x=>!x.archived).length+'</strong><span>Препаратів</span></div><div><strong>'+d.medicines.filter(x=>!x.archived&&x.expires_at&&dayDiff(d.today,x.expires_at)<=30).length+'</strong><span>Строк завершується</span></div><div><strong>'+low+'</strong><span>Малий запас</span></div></div>'+
'<input id="medsearch" class="input-search" placeholder="🔍 Пошук ліків, форми, місця..." value="'+h(state.search)+'" autocomplete="off" />'+
'<div class="tabs">'+[["all","Усі"],["soon","Скоро"],["low","Мало"]].map(x=>'<button data-act="medfilter:'+x[0]+'" class="'+(state.medicineFilter===x[0]?"active":"")+'">'+x[1]+'</button>').join("")+'</div>'+
button("＋ Додати препарат","new:medicine","full primary")+'<div style="height:13px"></div>'+
(list.length?list.map(m=>item("💊",m.name,h(m.form||"Препарат")+" · "+m.quantity+" "+h(m.unit)+" · "+(m.expires_at?"до "+fmt(m.expires_at):"термін невідомий"),"open:medicine:"+m.id,badge(medicineStatus(m),medicineStatus(m)==="red"?"Увага":medicineStatus(m)==="warn"?"Скоро":"В нормі"))).join(""):empty("🧰","Нічого не знайдено",term?"Спробуй інший запит.":"Додай перший препарат.","Додати","new:medicine"))}
function tasks(){var d=state.data,list=d.tasks.filter(x=>state.taskFilter==="done"?x.done:state.taskFilter==="week"?!x.done&&dayDiff(d.today,x.due)<=7:!x.done);
return pageTitle("Домашні справи","Усі важливі плани під рукою")+
'<div class="tabs">'+[["active","Активні"],["week","На 7 днів"],["done","Завершені"]].map(x=>'<button class="'+(state.taskFilter===x[0]?"active":"")+'" data-act="taskfilter:'+x[0]+'">'+x[1]+'</button>').join("")+'</div>'+
button("＋ Додати справу","new:task","full primary")+'<div style="height:13px"></div>'+
(list.length?list.map(x=>'<div class="item"><button class="list-check '+(x.done?"done":"")+'" data-act="'+(x.done?"noop":"done:task:"+x.id)+'">'+(x.done?"✓":"")+'</button><div class="item-content" data-act="open:task:"+x.id><h3>'+h(x.title)+'</h3><p>'+fmt(x.due)+' · '+(x.days>0?"повтор через "+x.days+" днів":"без повтору")+'</p></div>'+badge(x.done?"green":status(x.due),x.done?"Готово":timeLeft(x.due))+'</div>').join(""):empty("✅","Справ поки немає","Додай нову справу, щоб нічого не забути.","Додати справу","new:task"))}
function shopping(){var list=state.data.shopping;
return pageTitle("Список покупок","Усе необхідне — в одному місці")+
button("＋ Додати покупку","new:shopping","full primary")+'<div style="height:14px"></div>'+
(list.length?list.map(x=>'<div class="item"><button class="list-check '+(x.done?"done":"")+'" data-act="shoppingdone:'+x.id+'">'+(x.done?"✓":"")+'</button><div class="item-content" data-act="edit:shopping:'+x.id+'"><h3 style="'+(x.done?"text-decoration:line-through;opacity:.55":"")+'">'+h(x.title)+'</h3><p>'+h(x.notes||"Без приміток")+'</p></div><span class="chevron" data-act="edit:shopping:'+x.id+'">›</span></div>').join(""):empty("🛍️","Покупок немає","Склади список для наступного походу до магазину.","Додати","new:shopping"))}
function expenses(){var list=state.data.expenses;
return pageTitle("Витрати","Догляд за оселею під контролем")+
'<div class="card" style="background:linear-gradient(125deg,#edf1ff,#f6edff)"><div class="small subtle">Загалом витрачено</div><div style="font-weight:900;font-size:29px;margin:7px 0">'+money(state.data.stats.spending)+'</div></div>'+
blockTitle("Історія",button("＋ Записати","new:expense","sm"))+
(list.length?list.map(x=>item("💸",x.title,fmt(x.changed),"noop",'<strong>'+money(x.amount)+'</strong>')).join(""):empty("💸","Витрат поки немає","Додай витрату вручну або при заміні картриджа.","Додати","new:expense"))}
function stats(){var d=state.data;
var cost=d.expenses,monthly={};cost.forEach(x=>{var k=x.changed.slice(0,7);monthly[k]=(monthly[k]||0)+x.amount});
var months=Object.keys(monthly).sort().slice(-6),max=Math.max(1,...months.map(k=>monthly[k]));
return pageTitle("Статистика","Більше ясності, менше турбот")+
'<div class="metrics">'+[["💸",money(d.stats.spending),"витрат за весь час","blue"],["💧",d.history.length,"замін фільтрів","green"],["☑",d.tasks.filter(x=>x.done).length,"виконаних справ","orange"],["💊",d.medicines.filter(x=>!x.archived).length,"позицій в аптечці","red"]].map(x=>'<div class="card metric '+x[3]+'"><div class="iconbox">'+x[0]+'</div><div class="number" style="font-size:20px">'+x[1]+'</div><div class="label">'+x[2]+'</div></div>').join("")+'</div>'+
blockTitle("Витрати по місяцях")+
'<div class="card">'+(months.length?'<div class="chart">'+months.map(k=>'<div class="bar-wrap"><div class="bar" style="height:'+Math.max(4,Math.round(monthly[k]/max*97))+'%"></div><span>'+k.slice(5)+'</span></div>').join("")+'</div><div class="small subtle">Останні '+months.length+' місяців з витратами</div>':'<div class="empty">Поки немає витрат для графіка.</div>')+'</div>'+
blockTitle("Останні заміни")+
(d.history.length?d.history.slice(0,8).map(x=>item("💧",x.title,fmt(x.changed),"noop",x.amount?'<strong>'+money(x.amount)+'</strong>':'')).join(""):empty("💧","Заміни ще не записано","Історія з’явиться після першої заміни картриджа."))}
function family(){var d=state.data,owner=d.household;
return pageTitle("Наша сім’я","Разом дбаємо про затишок")+
'<div class="card" style="background:linear-gradient(120deg,#eaf4ff,#f1eafe)"><div style="font-size:19px;font-weight:850">👨‍👩‍👧 Спільна оселя</div><p class="small subtle">Фільтри, аптечка, справи, покупки та витрати доступні запрошеним членам сім’ї.</p>'+badge("green",d.me.role==="owner"?"Ви власник":"Спільний доступ")+'</div>'+
blockTitle("Учасники")+
item("👑",owner.name||"Власник","Власник оселі","noop")+
owner.members.map(m=>item("👤",m.name||String(m.uid),"Учасник","noop",d.me.role==="owner"?button("Відключити","removefamily:"+m.uid,"sm danger"):"")).join("")+
'<div style="height:10px"></div>'+(d.me.role==="owner"?button("🔗 Запросити рідних","familyinvite","primary full"):button("🚪 Вийти зі спільної оселі","familyleave","danger full"))+
'<div class="small subtle" style="margin-top:15px">Запрошення одноразове і діє 24 години. Максимум 5 запрошених учасників.</div>'}
function settings(){var a=state.data.settings;
return pageTitle("Налаштування","Налаштуй «Оселю» під себе")+
'<div class="card"><h3>🔔 Сповіщення</h3><p class="small subtle">Щоденна перевірка о 09:00 за Києвом.</p><div class="row" style="margin:17px 0">'+badge(a.enabled?"green":"warn",a.enabled?"Увімкнено":"Вимкнено")+button(a.enabled?"Вимкнути":"Увімкнути","toggle:enabled","sm")+'</div><div class="row"><span>Попереджати заздалегідь</span>'+button(a.warnings?"Так":"Ні","toggle:warnings","sm ghost")+'</div></div>'+
blockTitle("Інформація")+
'<div class="card"><div class="bold">🏠 Оселя Mini App</div><p class="small subtle">Ваші записи зберігаються у Cloudflare D1 і доступні лише авторизованим користувачам Telegram або членам спільної оселі. Не використовуйте аптечку для підбору дозувань чи лікування.</p></div>'}
function more(){return pageTitle("Усі розділи","Керуйте домом легко")+
[["📅","План на тиждень","Термінові справи і заміни","tasks"],["🛒","Список покупок","Плануйте покупки всією сім’єю","shopping"],["💸","Витрати","Догляд і покупки","expenses"],["📊","Статистика","Історія й аналітика","stats"],["👨‍👩‍👧","Моя сім’я","Спільний доступ","family"],["⚙","Налаштування","Нагадування та інформація","settings"]].map(x=>item(x[0],x[1],x[2],"page:"+x[3])).join("")}
function fab(){var target={osmosis:"new:system",medicines:"new:medicine",tasks:"new:task",shopping:"new:shopping",expenses:"new:expense"}[state.page];return target?'<button class="fab" data-act="'+target+'" aria-label="Додати">+</button>':""}
function render(){
 if(!state.data)return;
 var html=header(),content=state.page==="home"?home():state.page==="osmosis"?(state.selectedSystem?systemDetail(state.selectedSystem):systems()):state.page==="medicines"?medicines():state.page==="tasks"?tasks():state.page==="shopping"?shopping():state.page==="expenses"?expenses():state.page==="stats"?stats():state.page==="family"?family():state.page==="settings"?settings():more();
 html+='<main class="content">'+content+'</main>'+fab()+navigation();
 app.innerHTML=html;
 var search=document.getElementById("medsearch");if(search){search.addEventListener("input",function(e){var pos=this.selectionStart;state.search=this.value;var list=state.data.medicines.filter(m=>!m.archived);var term=state.search.trim().toLocaleLowerCase("uk-UA");if(term)list=list.filter(m=>(m.name+" "+m.form+" "+m.location).toLocaleLowerCase("uk-UA").includes(term));
  if(state.medicineFilter==="soon")list=list.filter(m=>m.expires_at&&dayDiff(state.data.today,m.expires_at)<=30);
  if(state.medicineFilter==="low")list=list.filter(m=>m.quantity===0||m.low_at>0&&m.quantity<=m.low_at);
  var section=this.parentElement;var children=section.querySelectorAll('.item');children.forEach(x=>x.remove());
  var node=document.createElement("div");node.innerHTML=list.map(m=>item("💊",m.name,h(m.form||"Препарат")+" · "+m.quantity+" "+h(m.unit)+" · "+(m.expires_at?"до "+fmt(m.expires_at):"термін невідомий"),"open:medicine:"+m.id,badge(medicineStatus(m),medicineStatus(m)==="red"?"Увага":medicineStatus(m)==="warn"?"Скоро":"В нормі"))).join("");
  Array.from(node.children).forEach(el=>section.appendChild(el));
 });}
}
function notice(message){toastEl.innerHTML='<div class="toast">'+h(message)+'</div>';clearTimeout(notice._timeout);notice._timeout=setTimeout(()=>toastEl.innerHTML="",3500)}
async function api(path,payload){var opts={method:payload?"POST":"GET",headers:{"x-telegram-init-data":initData}};
if(payload){opts.headers["Content-Type"]="application/json";opts.body=JSON.stringify(payload)}
var res=await fetch(path,opts),result=await res.json();if(!res.ok)throw Error(result.error||"Помилка сервера");return result}
async function refresh(quiet){try{state.data=await api("/api/bootstrap");render()}catch(e){if(!quiet)app.innerHTML='<div class="loading"><div style="font-size:53px;margin-bottom:15px">🔒</div><div class="brandname">Оселя</div><p>'+h(e.message)+'</p><p class="small">Спробуй закрити застосунок і відкрити через меню Telegram-бота.</p>'+button("🔄 Повторити","retry","primary")+'</div>';else notice(e.message)}}
async function change(payload){if(state.busy)return;state.busy=true;try{var response=await api("/api/action",payload);await refresh(true);return response}catch(e){notice(e.message);return null}finally{state.busy=false}}
function field(name,label,value,type,wide,extra){return '<div class="field '+(wide?"wide":"")+'"><label for="f_'+name+'">'+label+'</label>'+(type==="textarea"?'<textarea id="f_'+name+'" name="'+name+'">'+h(value||"")+'</textarea>':'<input id="f_'+name+'" type="'+(type||"text")+'" name="'+name+'" value="'+h(value==null?"":value)+'" '+(extra||"")+' />')+'</div>'}
function selector(name,label,items,value,wide){return '<div class="field '+(wide?"wide":"")+'"><label for="f_'+name+'">'+label+'</label><select id="f_'+name+'" name="'+name+'">'+items.map(x=>'<option value="'+h(x[0])+'" '+(String(x[0])===String(value)?"selected":"")+'>'+h(x[1])+'</option>').join("")+'</select></div>'}
function sheet(title,fields,saveLabel,onSave,footer){modal.innerHTML='<div class="overlay" data-act="close"><section class="sheet" role="dialog" aria-modal="true" aria-label="'+h(title)+'"><div class="drag"></div><div class="row"><h2>'+h(title)+'</h2><button class="round-btn" data-act="close">×</button></div><form id="form" class="form-grid">'+fields+'<div class="sheet-footer field wide"><button type="button" class="btn ghost" data-act="close">Скасувати</button><button type="submit" class="btn primary">'+h(saveLabel||"Зберегти")+'</button></div></form>'+(footer||"")+'</section></div>';modal.querySelector("#form").addEventListener("submit",function(ev){ev.preventDefault();var o=Object.fromEntries(new FormData(this).entries());onSave(o)})}
function close(){modal.innerHTML=""}
function confirmAsk(message,yes){if(T&&T.showConfirm){T.showConfirm(message,function(ok){if(ok)yes()})}else if(window.confirm(message))yes()}
function newSystem(x){x=x||{};sheet(x.id?"Редагувати осмос":"Додати осмос",
field("title","Назва системи *",x.title||"","text",true,"required maxlength=120")+field("model","Виробник і модель",x.model||"","text",true,"maxlength=120")+field("installed_at","Коли встановлено",x.installed_at||"","date",true),
"Зберегти",async o=>{if(await change({type:"system.save",id:x.id,...o})){close();notice("✅ Осмос збережено")}})}
function newFilter(x,systemId){x=x||{};var systems=[["","Без прив’язки"]].concat(state.data.systems.map(s=>[s.id,s.title]));
sheet(x.id?"Редагувати фільтр":"Новий картридж",
field("title","Назва картриджа *",x.title||"","text",true,"required maxlength=120")+
selector("osmosis_id","Осмос",systems,systemId||x.osmosis_id||"",true)+
field("changed","Остання заміна *",x.changed||state.data.today,"date",true,"required")+
selector("unit","Інтервал", [["months","Місяці"],["days","Дні"]],x.interval_unit||"months")+
field("interval","Кількість",x.interval_value||x.days||6,"number",false,"min=1 max=3650 required")+
field("exact_due","Або конкретна дата наступної заміни (необов’язково)","","date",true),
"Зберегти",async o=>{var payload={type:"filter.save",id:x.id,title:o.title,osmosis_id:o.osmosis_id,changed:o.changed,unit:o.unit,interval:Number(o.interval),exact_due:o.exact_due||null};if(await change(payload)){close();notice("✅ Картридж збережено")}})}
function newMedicine(m){m=m||{};sheet(m.id?"Редагувати препарат":"Додати препарат",
note("Для упаковок з різними строками придатності створюй окремі записи.")+
field("name","Назва препарату *",m.name||"","text",true,"required maxlength=120")+
field("form","Форма та маркування",m.form||"","text",true,"maxlength=80")+
field("quantity","Кількість",m.quantity??1,"number",false,"required min=0 max=99999")+
field("unit","Одиниця (шт, табл, мл)",m.unit||"шт","text",false,"required maxlength=40")+
field("expires_at","Термін придатності",m.expires_at||"","date",false)+
field("low_at","Попереджати при залишку ≤",m.low_at??2,"number",false,"min=0 max=99999")+
field("location","Місце зберігання",m.location||"","text",true,"maxlength=80")+
field("notes","Примітка",m.notes||"","textarea",true),
"Зберегти",async o=>{var payload={type:"medicine.save",id:m.id,...o,quantity:Number(o.quantity),low_at:Number(o.low_at)};if(await change(payload)){close();notice("✅ Препарат збережено")}})}
function newTask(x){x=x||{};sheet(x.id?"Редагувати справу":"Нова справа",
field("title","Назва справи *",x.title||"","text",true,"required maxlength=120")+
field("due","До якої дати?",x.due||state.data.today,"date",true,"required")+
field("days","Повторювати кожні N днів (0 — ні)",x.days||0,"number",true,"min=0 max=3650"),
"Зберегти",async o=>{if(await change({type:"task.save",id:x.id,title:o.title,due:o.due,days:Number(o.days)})){close();notice("✅ Справу збережено")}})}
function newShopping(x){x=x||{};sheet(x.id?"Редагувати покупку":"Нова покупка",
field("title","Що придбати? *",x.title||"","text",true,"required maxlength=120")+
field("notes","Кількість / примітка",x.notes||"","text",true,"maxlength=120"),
"Зберегти",async o=>{if(await change({type:"shopping.save",id:x.id,...o})){close();notice("✅ Збережено")}})}
function newExpense(){sheet("Нова витрата",field("title","На що витратили? *","","text",true,"required maxlength=120")+
field("amount","Сума, грн","", "number",true,"required min=0.01 max=1000000 step=0.01"),"Додати",async o=>{if(await change({type:"expense.add",title:o.title,amount:Math.round(Number(o.amount)*100)})){close();notice("✅ Витрату додано")}})}
function replaceFilter(x){sheet("Заміна картриджа",'<p class="field wide small subtle">💧 '+h(x.title)+'<br>Поточний інтервал збережено — бот сам поставить наступну дату.</p>'+
field("date","Коли замінено?",state.data.today,"date",true,"required")+
field("cost","Вартість, грн (необов’язково)",0,"number",true,"min=0 max=1000000 step=0.01"),
"✅ Замінено",async o=>{var response=await change({type:"filter.replace",id:x.id,date:o.date,cost:Math.round(Number(o.cost||0)*100)});if(response){close();notice("✅ Наступна заміна: "+fmt(response.next_due))}})}
function medicinePanel(x){var expired=x.expires_at&&dayDiff(state.data.today,x.expires_at)<=0;
sheet("💊 "+x.name,
'<div class="field wide"><div class="card"><strong>'+h(x.name)+'</strong><p class="small subtle">'+h(x.form||"")+'</p><p>Запас: <strong>'+x.quantity+" "+h(x.unit)+'</strong></p><p>Придатний до: '+fmt(x.expires_at)+'</p><p>📍 '+h(x.location||"Не вказано")+'</p></div></div>'+
'<div class="field wide"><div class="row wrap">'+button("➖ Списати 1","meddelta:"+x.id+":-1","sm ghost")+button("➕ Додати 1","meddelta:"+x.id+":1","sm")+button("✏️ Редагувати","edit:medicine:"+x.id,"sm ghost")+'</div></div>'+
(expired?note("Термін придатності минув. Не використовуй препарат, звірся з упаковкою."):"")+
'<div class="field wide">'+button("📦 Архівувати","archive:medicine:"+x.id,"full ghost")+'</div>',
"Закрити",()=>close())}
function filterPanel(x){sheet("💧 "+x.title,
'<div class="field wide"><div class="card"><div class="small subtle">Наступна заміна</div><h2 style="margin:5px 0">'+fmt(x.due)+'</h2>'+
badge(status(x.due),timeLeft(x.due))+'<p class="small subtle">Остання заміна: '+fmt(x.changed)+'</p></div></div>'+
'<div class="field wide">'+button("✅ Позначити заміну","replace:"+x.id,"primary full")+'</div>'+
'<div class="field wide">'+button("✏️ Редагувати","edit:filter:"+x.id,"full ghost")+'</div>'+
'<div class="field wide">'+button("🗑 Видалити фільтр","delete:filter:"+x.id,"full danger")+'</div>',
"Закрити",()=>close())}
function taskPanel(x){sheet("☑ "+x.title,
'<div class="field wide card"><div>📅 Виконати до: <b>'+fmt(x.due)+'</b></div><p class="small subtle">'+(x.days>0?"Повтор кожні "+x.days+" днів":"Одноразова справа")+'</p></div>'+
'<div class="field wide">'+button("✅ Виконано","done:task:"+x.id,"primary full")+'</div>'+
'<div class="field wide">'+button("✏️ Редагувати","edit:task:"+x.id,"ghost full")+'</div>',
"Закрити",()=>close())}
async function click(act){if(!act||act==="noop")return;
 var a=act.split(":"),type=a[0],key=a[1],id=Number(a[2]);
 if(act==="close"){close();return}
 if(act==="retry"){refresh();return}
 if(type==="page"){close();state.page=key;state.selectedSystem=null;window.scrollTo(0,0);render();return}
 if(type==="system"){if(key==="back")state.selectedSystem=null;else state.selectedSystem=Number(key);render();return}
 if(type==="medfilter"){state.medicineFilter=key;render();return}
 if(type==="taskfilter"){state.taskFilter=key;render();return}
 if(type==="new"){if(key==="system")newSystem();if(key==="filter")newFilter(null,id||null);if(key==="medicine")newMedicine();if(key==="task")newTask();if(key==="shopping")newShopping();if(key==="expense")newExpense();return}
 if(type==="open"){var x=state.data[{filter:"filters",medicine:"medicines",task:"tasks"}[key]].find(v=>v.id===id);if(x){if(key==="filter")filterPanel(x);if(key==="medicine")medicinePanel(x);if(key==="task")taskPanel(x)}return}
 if(type==="edit"){var arr={system:"systems",filter:"filters",medicine:"medicines",task:"tasks",shopping:"shopping"}[key];var x=state.data[arr]&&state.data[arr].find(v=>v.id===id);if(x){if(key==="system")newSystem(x);if(key==="filter")newFilter(x);if(key==="medicine")newMedicine(x);if(key==="task")newTask(x);if(key==="shopping")newShopping(x)}return}
 if(type==="replace"){var f=state.data.filters.find(x=>x.id===Number(key));if(f)replaceFilter(f);return}
 if(type==="delete"&&key==="filter"){confirmAsk("Видалити картридж та історію його замін?",async()=>{if(await change({type:"filter.delete",id})){close();notice("Фільтр видалено")}});return}
 if(type==="meddelta"){var mid=Number(a[1]),delta=Number(a[2]);if(delta<0){confirmAsk("Списати одну одиницю препарату з домашнього запасу?",async()=>{if(await change({type:"medicine.stock",id:mid,delta})){close();notice("Кількість оновлена")}})}else if(await change({type:"medicine.stock",id:mid,delta})){close();notice("Запас поповнено")}return}
 if(type==="archive"&&key==="medicine"){confirmAsk("Перемістити препарат до архіву?",async()=>{if(await change({type:"medicine.archive",id,archived:true})){close();notice("Запис архівовано")}});return}
 if(type==="done"&&key==="task"){if(await change({type:"task.done",id})){close();notice("✅ Виконано")};return}
 if(type==="shoppingdone"){var x=state.data.shopping.find(y=>y.id===Number(key));if(x)change({type:"shopping.done",id:x.id,done:!x.done});return}
 if(type==="toggle"){var settings={...state.data.settings};settings[key]=!settings[key];if(await change({type:"settings.save",...settings}))notice("Налаштування збережено");return}
 if(act==="familyinvite"){var r=await change({type:"family.invite"});if(r&&r.invite){if(navigator.clipboard)navigator.clipboard.writeText(r.invite).catch(()=>{});sheet("Запрошення для сім’ї",'<p class="field wide small">Посилання чинне 24 години й може бути використане лише один раз.</p><div class="field wide"><input type="text" readonly value="'+h(r.invite)+'" id="inviteLink"></div><div class="field wide">'+button("📤 Поділитися","shareinvite","primary full")+'</div>',"Готово",()=>close())}return}
 if(act==="shareinvite"){var url=document.getElementById("inviteLink")?.value;if(url){if(T&&T.openTelegramLink)T.openTelegramLink("https://t.me/share/url?url="+encodeURIComponent(url));else if(navigator.share)navigator.share({url}).catch(()=>{});else notice("Посилання скопійовано")};return}
 if(type==="removefamily"){confirmAsk("Відключити учасника від спільної оселі?",async()=>{if(await change({type:"family.remove",uid:Number(key)}))notice("Доступ відкликано")});return}
 if(act==="familyleave"){confirmAsk("Вийти зі спільної оселі?",async()=>{if(await change({type:"family.leave"})){state.data=null;refresh()}});return}
}
document.addEventListener("click",function(e){var button=e.target.closest("[data-act]");if(!button)return;if(button.classList.contains("overlay")&&e.target!==button)return;if(e.target===modal.firstElementChild&&button.dataset.act==="close"){close();return}
if(button.closest("form")&&button.type==="submit")return;e.preventDefault();click(button.dataset.act)});
if(!initData){app.innerHTML='<div class="loading"><div style="font-size:64px">🏡</div><div class="brandname">Оселя</div><p>Цей застосунок відкривається через Telegram.</p><p class="small">Перейди у свого Telegram-бота та натисни кнопку «Оселя» в меню.</p></div>'}else refresh();
})();
</script>
</body></html>`;
}
