const kinds={filters:"💧 Фільтри",tasks:"📋 Справи",shopping:"🛒 Покупки",expenses:"💸 Витрати",tds:"🧪 TDS води"};
const prompts={filters:["Назва фільтра?","Дата останньої заміни: ДД.ММ.РРРР або сьогодні?","Інтервал заміни у днях?"],tasks:["Назва справи?","Коли виконати: ДД.ММ.РРРР або сьогодні?","Повторювати через скільки днів? (0 — не повторювати)"],shopping:["Що потрібно купити?","Кількість або примітка?"],expenses:["За що витрати?","Сума в гривнях?"],tds:["Результат TDS (ppm)?"]};
const key=(text,callback_data)=>({text,callback_data});
const kb=[["filters","tasks"],["shopping","expenses"],["tds","other"]].map(r=>r.map(x=>key(kinds[x]||"⚙️ Інше","menu:"+x)));
const toHome=[[key("🏠 Головне меню","menu:home")]];
function today(now=new Date()){const p=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Kyiv",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);const x=n=>p.find(y=>y.type===n).value;return x("year")+"-"+x("month")+"-"+x("day");}
function hour(now){return +new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Kyiv",hour:"2-digit",hourCycle:"h23"}).format(now);}
function add(d,n){const x=new Date(d+"T12:00:00Z");x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10);}
function gap(a,b){return Math.round((Date.parse(b+"T12:00:00Z")-Date.parse(a+"T12:00:00Z"))/86400000);}
function validDate(s){s=String(s||"").trim();if(s==="сьогодні")return today();const m=s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);if(m)s=m[3]+"-"+m[2]+"-"+m[1];if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return null;const d=new Date(s+"T12:00:00Z");return !isNaN(d)&&d.toISOString().slice(0,10)===s?s:null;}
function fmt(s){return s.slice(8,10)+"."+s.slice(5,7)+"."+s.slice(0,4);}
function esc(s){return String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function label(s){s=String(s||"").trim().replace(/\s+/g," ");return s.length&&s.length<=120?s:null;}
function number(s,min,max){return /^\d+$/.test(String(s))&&Number.isSafeInteger(+s)&&+s>=min&&+s<=max?+s:null;}
function sum(s){s=String(s).trim().replace(",",".");return /^\d{1,8}(\.\d{1,2})?$/.test(s)?Math.round(+s*100):null;}
function hryvnia(k){return (k/100).toFixed(2).replace(".",",")+" грн";}
const query=(e,sql,...a)=>e.DB.prepare(sql).bind(...a);
const first=(e,sql,...a)=>query(e,sql,...a).first();
const all=async(e,sql,...a)=>(await query(e,sql,...a).all()).results||[];
const run=(e,sql,...a)=>query(e,sql,...a).run();
async function tg(e,method,body){const r=await fetch("https://api.telegram.org/bot"+e.BOT_TOKEN+"/"+method,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});const j=await r.json();if(!r.ok||!j.ok)throw Error(j.description||"Telegram error");return j.result;}
const send=(e,u,s,keys)=>tg(e,"sendMessage",{chat_id:u,text:s,parse_mode:"HTML",reply_markup:keys?{inline_keyboard:keys}:undefined});
async function session(e,u,kind,step=0,obj={}){await run(e,"INSERT INTO sessions(uid,kind,step,json) VALUES(?,?,?,?) ON CONFLICT(uid) DO UPDATE SET kind=excluded.kind,step=excluded.step,json=excluded.json",u,kind,step,JSON.stringify(obj));}
const cancel=(e,u)=>run(e,"DELETE FROM sessions WHERE uid=?",u);
async function menu(e,u,kind="home"){
 if(kind==="home"){const f=await first(e,"SELECT COUNT(*) n FROM items WHERE uid=? AND kind='filters' AND due<=?",u,add(today(),7));const t=await first(e,"SELECT COUNT(*) n FROM items WHERE uid=? AND kind='tasks' AND done=0 AND due<=?",u,add(today(),7));const s=await first(e,"SELECT COUNT(*) n FROM items WHERE uid=? AND kind='shopping' AND done=0",u);return send(e,u,"<b>🏠 Оселя</b>\n\n💧 Фільтрів потребують уваги: "+f.n+"\n📋 Справ найближчим часом: "+t.n+"\n🛒 Покупок: "+s.n+"\n\nОберіть розділ:",kb);}
 if(kind==="other")return send(e,u,"<b>⚙️ Додатково</b>\n\n/export — резервна копія JSON\n/import — імпорт у порожній профіль\n/cancel — скасувати\n/start — меню\n\nІмпорт старого вебсайту поки не підтримується.",[[key("📤 Експорт","export"),key("📥 Імпорт","import")],...toHome]);
 if(!kinds[kind])return menu(e,u);
 const rows=await all(e,"SELECT * FROM items WHERE uid=? AND kind=? AND done=0 ORDER BY COALESCE(due,'9999-12-31'),id DESC LIMIT 15",u,kind);
 const desc=rows.map(x=>"• "+(kind==="tds"?x.amount+" ppm":esc(x.title))+(x.due?" — "+fmt(x.due):"")+(kind==="expenses"?" · "+hryvnia(x.amount):"")+(kind==="shopping"&&x.notes?" · "+esc(x.notes):""));
 const opts=rows.map(x=>kind==="filters"?[key("💧 "+x.title.slice(0,26),"filter:"+x.id)]:["tasks","shopping"].includes(kind)?[key("✅ "+x.title.slice(0,26),"done:"+x.id)]:[]).filter(r=>r.length);
 opts.push([key("➕ Додати","add:"+kind)]);opts.push(...toHome);
 return send(e,u,"<b>"+kinds[kind]+"</b>\n\n"+(desc.length?desc.join("\n"):"Наразі записів немає."),opts);
}
async function detail(e,u,id){const x=await first(e,"SELECT * FROM items WHERE uid=? AND kind='filters' AND id=?",u,id);if(!x)return menu(e,u,"filters");const h=await all(e,"SELECT * FROM history WHERE uid=? AND item_id=? ORDER BY changed DESC LIMIT 5",u,id);return send(e,u,"<b>💧 "+esc(x.title)+"</b>\n\nОстання заміна: "+fmt(x.changed)+"\nНаступна: "+fmt(x.due)+"\nІнтервал: "+x.days+" днів\n\nІсторія:\n"+(h.length?h.map(z=>"• "+fmt(z.changed)+(z.amount?" · "+hryvnia(z.amount):"")).join("\n"):"Записів ще немає."),[[key("✅ Замінено сьогодні","replace:"+id)],[key("✏️ Новий інтервал","interval:"+id),key("🗑 Видалити","delete:"+id)],[key("⬅️ Назад","menu:filters")]]);
}
async function wizard(e,u,text,s){
 const p=JSON.parse(s.json);
 if(s.kind.startsWith("replace:")||s.kind.startsWith("interval:")){
  const id=+s.kind.split(":")[1],item=await first(e,"SELECT * FROM items WHERE uid=? AND kind='filters' AND id=?",u,id);
  if(!item){await cancel(e,u);return menu(e,u,"filters");}
  if(s.kind.startsWith("interval:")){const n=number(text,1,3650);if(n===null)return send(e,u,"Введіть кількість днів від 1 до 3650.");await run(e,"UPDATE items SET days=?,due=? WHERE uid=? AND id=?",n,add(item.changed,n),u,id);}
  else{const amount=text==="-"?0:sum(text);if(amount===null)return send(e,u,"Введіть суму або - без витрат.");const d=today();await e.DB.batch([query(e,"UPDATE items SET changed=?,due=? WHERE uid=? AND id=?",d,add(d,item.days),u,id),query(e,"INSERT INTO history(uid,item_id,changed,amount) VALUES(?,?,?,?)",u,id,d,amount),...(amount?[query(e,"INSERT INTO items(uid,kind,title,amount,changed) VALUES(?,?,?,?,?)",u,"expenses","Заміна: "+item.title,amount,d)]:[])]);}
  await cancel(e,u);return detail(e,u,id);
 }
 const k=s.kind,n=s.step;if(!prompts[k])return false;
 let val;if((k==="filters"||k==="tasks")&&n===1)val=validDate(text);
 else if((k==="filters"||k==="tasks")&&n===2)val=number(text,k==="filters"?1:0,3650);
 else if(k==="tds")val=number(text,0,9999);
 else if(k==="expenses"&&n===1)val=sum(text);
 else val=label(text);
 if(val===null)return send(e,u,"❗ Некоректне значення. Спробуйте ще раз або /cancel.");
 p[n]=val;if(n+1<prompts[k].length){await session(e,u,k,n+1,p);return send(e,u,prompts[k][n+1]+"\n/cancel — скасувати");}
 if(k==="filters")await run(e,"INSERT INTO items(uid,kind,title,changed,days,due) VALUES(?,'filters',?,?,?,?)",u,p[0],p[1],p[2],add(p[1],p[2]));
 if(k==="tasks")await run(e,"INSERT INTO items(uid,kind,title,due,days) VALUES(?,'tasks',?,?,?)",u,p[0],p[1],p[2]);
 if(k==="shopping")await run(e,"INSERT INTO items(uid,kind,title,notes) VALUES(?,'shopping',?,?)",u,p[0],p[1]);
 if(k==="expenses"){if(p[1]===0)return send(e,u,"Сума має бути більшою за нуль.");await run(e,"INSERT INTO items(uid,kind,title,amount,changed) VALUES(?,'expenses',?,?,?)",u,p[0],p[1],today());}
 if(k==="tds")await run(e,"INSERT INTO items(uid,kind,title,amount,changed) VALUES(?,'tds','TDS',?,?)",u,p[0],today());
 await cancel(e,u);await send(e,u,"✅ Збережено.");return menu(e,u,k);
}
async function exportData(e,u){const backup={type:"oselya-bot-v1",items:await all(e,"SELECT * FROM items WHERE uid=?",u),history:await all(e,"SELECT * FROM history WHERE uid=?",u)};const form=new FormData();form.append("chat_id",String(u));form.append("document",new Blob([JSON.stringify(backup,null,2)],{type:"application/json"}),"oselya-"+today()+".json");const r=await fetch("https://api.telegram.org/bot"+e.BOT_TOKEN+"/sendDocument",{method:"POST",body:form});if(!r.ok)throw Error("Помилка експорту");const j=await r.json();if(!j.ok)throw Error(j.description);}
async function importData(e,u,document){
 if(document.file_size>1048576||!String(document.file_name||"").toLowerCase().endsWith(".json"))throw Error("Потрібен .json до 1 МБ.");
 const f=await tg(e,"getFile",{file_id:document.file_id});if(!f.file_path||f.file_size>1048576)throw Error("Недоступний файл.");
 const r=await fetch("https://api.telegram.org/file/bot"+e.BOT_TOKEN+"/"+f.file_path);if(!r.ok)throw Error("Не вдалося завантажити файл.");const bytes=await r.arrayBuffer();if(bytes.byteLength>1048576)throw Error("Завеликий файл.");
 const b=JSON.parse(new TextDecoder().decode(bytes));if(b.type!=="oselya-bot-v1"||!Array.isArray(b.items)||!Array.isArray(b.history)||b.items.length+b.history.length>500)throw Error("Некоректна копія цього бота.");
 if((await first(e,"SELECT COUNT(*) n FROM items WHERE uid=?",u)).n)throw Error("Імпорт можливий лише в порожній профіль.");
 const ids=new Map();
 for(const x of b.items){if(!kinds[x.kind]||!label(x.title)||!Number.isInteger(x.amount)||x.amount<0||x.amount>1000000000||!Number.isInteger(x.days)||x.days<0||x.days>3650)throw Error("Некоректні дані запису.");if(x.changed&&!validDate(x.changed))throw Error("Некоректна дата.");if(x.due&&!validDate(x.due))throw Error("Некоректна дата.");
  const res=await run(e,"INSERT INTO items(uid,kind,title,done,changed,days,due,notes,amount) VALUES(?,?,?,?,?,?,?,?,?)",u,x.kind,x.title,x.done===1?1:0,x.changed||null,x.days,x.due||null,String(x.notes||"").slice(0,120),x.amount);ids.set(x.id,res.meta.last_row_id);}
 for(const h of b.history){if(!ids.has(h.item_id)||!validDate(h.changed)||number(h.amount,0,1000000000)===null)throw Error("Некоректна історія.");await run(e,"INSERT INTO history(uid,item_id,changed,amount) VALUES(?,?,?,?)",u,ids.get(h.item_id),h.changed,h.amount);}
 await cancel(e,u);
}
async function action(e,u,data){
 if(data.startsWith("menu:"))return menu(e,u,data.slice(5));
 if(data.startsWith("add:")){const k=data.slice(4);if(!prompts[k])return menu(e,u);await session(e,u,k);return send(e,u,prompts[k][0]+"\n/cancel — скасувати");}
 if(data==="export")return exportData(e,u);
 if(data==="import"){await session(e,u,"import");return send(e,u,"📥 Надішліть JSON-файл від /export. Імпорт тільки в порожній профіль.");}
 const m=data.match(/^(filter|replace|interval|delete|done):(\d+)$/);if(!m)return menu(e,u);const id=+m[2],verb=m[1];
 if(verb==="filter")return detail(e,u,id);
 const x=await first(e,"SELECT * FROM items WHERE uid=? AND id=?",u,id);if(!x)return menu(e,u);
 if(verb==="replace"||verb==="interval"){if(x.kind!=="filters")return menu(e,u);await session(e,u,verb+":"+id);return send(e,u,verb==="replace"?"Вартість заміни у грн (або -)?":"Новий інтервал у днях?");}
 if(verb==="delete"){if(x.kind!=="filters")return menu(e,u);await e.DB.batch([query(e,"DELETE FROM history WHERE uid=? AND item_id=?",u,id),query(e,"DELETE FROM items WHERE uid=? AND id=?",u,id)]);return menu(e,u,"filters");}
 if(verb==="done"){if(x.kind==="tasks"&&x.days>0){const cycles=Math.max(1,Math.floor(gap(x.due,today())/x.days)+1);await run(e,"UPDATE items SET due=? WHERE uid=? AND id=?",add(x.due,cycles*x.days),u,id);}else await run(e,"UPDATE items SET done=1 WHERE uid=? AND id=?",u,id);return menu(e,u,x.kind);}
}
async function handle(e,update){
 const msg=update.message,cb=update.callback_query,who=(msg||cb)?.from,chat=msg?.chat||cb?.message?.chat;if(!who||!chat||chat.type!=="private"||who.id!==chat.id||who.is_bot)return;const uid=who.id;
 if(e.ALLOWED_USERS&&!e.ALLOWED_USERS.split(",").map(x=>x.trim()).includes(String(uid))){if(msg)await send(e,uid,"⛔ Цей бот приватний.");return;}
 await run(e,"INSERT INTO users(id,name) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name",uid,String(who.first_name||"").slice(0,80));
 if(cb){await tg(e,"answerCallbackQuery",{callback_query_id:cb.id});return action(e,uid,String(cb.data||""));}
 if(msg.document){const s=await first(e,"SELECT kind FROM sessions WHERE uid=?",uid);if(s?.kind!=="import")return send(e,uid,"Спочатку /import.");try{await importData(e,uid,msg.document);await send(e,uid,"✅ Копію імпортовано.");return menu(e,uid);}catch(err){return send(e,uid,"❗ "+esc(err.message));}}
 const text=String(msg?.text||"").trim(),cmd=text.split(/\s+/)[0].split("@")[0].toLowerCase();
 if(cmd==="/start"||cmd==="/cancel"){await cancel(e,uid);return menu(e,uid);}
 if(cmd==="/export")return exportData(e,uid);if(cmd==="/import")return action(e,uid,"import");
 const c={"/filters":"filters","/tasks":"tasks","/shopping":"shopping","/expenses":"expenses","/tds":"tds","/help":"other"};
 if(c[cmd]){await cancel(e,uid);return menu(e,uid,c[cmd]);}
 if(text.startsWith("/"))return send(e,uid,"Невідома команда: /start");
 const s=await first(e,"SELECT * FROM sessions WHERE uid=?",uid);if(s&&s.kind!=="import")return wizard(e,uid,text,s);return menu(e,uid);
}
async function reminders(e,dt){
 if(hour(dt)!==9)return;const d=today(dt),items=await all(e,"SELECT * FROM items WHERE kind IN ('filters','tasks') AND done=0 AND due<=? LIMIT 1000",add(d,7));
 for(const x of items){const left=gap(d,x.due),phase=left===1?"early":left===0?"due":left<0&&-left%7===0?"late":null;if(!phase)continue;if(await first(e,"SELECT 1 ok FROM sent WHERE uid=? AND item_id=? AND due=? AND phase=?",x.uid,x.id,x.due,phase))continue;
  try{await send(e,x.uid,"🔔 <b>"+(x.kind==="filters"?"Час замінити фільтр":"Домашня справа")+"</b>\n\n"+esc(x.title)+"\nДата: "+fmt(x.due)+"\n/start — відкрити меню.");await run(e,"INSERT OR IGNORE INTO sent(uid,item_id,due,phase) VALUES(?,?,?,?)",x.uid,x.id,x.due,phase);}catch(err){console.error("reminder",x.id,String(err));}
 }
}
export default {
 async fetch(request,e){const path=new URL(request.url).pathname;
  if(request.method==="GET"&&path==="/health")return new Response("OK");
  if(request.method!=="POST"||path!=="/telegram")return new Response("Not Found",{status:404});
  if(!e.BOT_TOKEN||!e.WEBHOOK_SECRET||!e.DB)return new Response("Not configured",{status:503});
  if(request.headers.get("X-Telegram-Bot-Api-Secret-Token")!==e.WEBHOOK_SECRET)return new Response("Forbidden",{status:403});
  let update;try{update=await request.json();}catch{return new Response("Bad JSON",{status:400});}
  if(!Number.isSafeInteger(update?.update_id))return new Response("Invalid update",{status:400});
  if(await first(e,"SELECT id FROM updates WHERE id=?",update.update_id))return new Response("OK");
  try{await handle(e,update);await run(e,"INSERT OR IGNORE INTO updates(id) VALUES(?)",update.update_id);return new Response("OK");}catch(err){console.error("Webhook",String(err));return new Response("Retry",{status:500});}
 },
 async scheduled(event,e){if(e.DB&&e.BOT_TOKEN)await reminders(e,new Date(event.scheduledTime));}
};
