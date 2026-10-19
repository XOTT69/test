const kinds={agenda:"📅 План на тиждень",osmosis:"🚰 Мій осмос",filters:"💧 Фільтри",tasks:"📋 Справи",shopping:"🛒 Покупки",expenses:"💸 Витрати",stats:"📊 Статистика",family:"👨‍👩‍👧 Сім’я"};
const prompts={osmosis:["Як називається твоя система зворотного осмосу?","Марка та модель осмосу (або - якщо невідомо)?"],filters:["Назва фільтра?","Дата останньої заміни: ДД.ММ.РРРР або сьогодні?","Інтервал: 90 днів, 6 місяців або кінцева дата 31.12.2027?"],tasks:["Назва справи?","Коли виконати: ДД.ММ.РРРР або сьогодні?","Повторювати через скільки днів? (0 — не повторювати)"],shopping:["Що потрібно купити?","Кількість або примітка?"],expenses:["За що витрати?","Сума в гривнях?"]};
const key=(text,callback_data)=>({text,callback_data});
const kb=[["agenda","osmosis"],["filters","tasks"],["shopping","expenses"],["stats","family"],["other"]].map(r=>r.map(x=>key(kinds[x]||"⚙️ Інше","menu:"+x)));
const toHome=[[key("🏠 Головне меню","menu:home")]];
const intervalButtons=[[key("📆 Дні","period:days"),key("🗓 Місяці","period:months"),key("🎯 Кінцева дата","period:date")]];
function periodPrompt(mode){
 return mode==="months"?"Скільки місяців? Наприклад: 6 (від 1 до 120).":mode==="date"?"Введіть дату наступної заміни у форматі ДД.ММ.РРРР. Бот сам порахує інтервал у днях.":"Скільки днів? Наприклад: 90 (від 1 до 3650). Можна також написати «6 міс» або кінцеву дату.";
}

function today(now=new Date()){const p=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Kyiv",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);const x=n=>p.find(y=>y.type===n).value;return x("year")+"-"+x("month")+"-"+x("day");}
function hour(now){return +new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Kyiv",hour:"2-digit",hourCycle:"h23"}).format(now);}
function add(d,n){const x=new Date(d+"T12:00:00Z");x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10);}
function gap(a,b){return Math.round((Date.parse(b+"T12:00:00Z")-Date.parse(a+"T12:00:00Z"))/86400000);}
function addMonths(date,count){
 const [y,m,d]=date.split("-").map(Number);
 const monthIndex=y*12+(m-1)+count;
 const targetYear=Math.floor(monthIndex/12),targetMonth=monthIndex%12;
 const monthLength=new Date(Date.UTC(targetYear,targetMonth+1,0)).getUTCDate();
 return String(targetYear).padStart(4,"0")+"-"+String(targetMonth+1).padStart(2,"0")+"-"+String(Math.min(d,monthLength)).padStart(2,"0");
}
function dueFor(changed,unit,value){return unit==="months"?addMonths(changed,value):add(changed,value);}
function filterInterval(text,changed,mode="days"){
 const source=String(text||"").trim().toLowerCase();
 const date=validDate(source);
 if(date){const days=gap(changed,date);return days>0&&days<=3650?{unit:"days",value:days,due:date}:null;}
 const m=source.match(/^(\d+)\s*(.*)$/);
 if(!m)return null;
 const n=Number(m[1]);if(!Number.isSafeInteger(n))return null;
 const suffix=m[2].replace(/\./g,"").trim();
 let unit;
 if(!suffix) unit=mode==="date"?null:mode;
 else if(/^(?:д|дн|день|дня|дні|днів|day|days)$/.test(suffix))unit="days";
 else if(/^(?:міс|місяць|місяця|місяці|місяців|month|months|mo)$/.test(suffix))unit="months";
 if(!unit||n<1||n>(unit==="months"?120:3650))return null;
 const due=dueFor(changed,unit,n);
 return gap(changed,due)<=3650?{unit,value:n,due}:null;
}
function calendarParts(start,end){
 if(!validDate(start)||!validDate(end)||start>=end)return {months:0,days:0};
 const a=start.split("-").map(Number),b=end.split("-").map(Number);
 let months=(b[0]-a[0])*12+(b[1]-a[1]);
 while(months>0&&addMonths(start,months)>end)months--;
 return {months,days:gap(addMonths(start,months),end)};
}
function calendarSpan(start,end){
 const {months,days}=calendarParts(start,end);
 return months+" міс. "+days+" дн.";
}
function intervalDisplay(item){
 if(item.changed&&item.due&&validDate(item.changed)&&validDate(item.due)){
  const total=gap(item.changed,item.due);
  return calendarSpan(item.changed,item.due)+" ("+total+" днів)";
 }
 const n=item.interval_value||item.days;
 return item.interval_unit==="months"&&item.interval_value>0?n+" міс. (календарний термін)":n+" днів";
}
function replacementStatus(due,now=today()){
 if(!due||!validDate(due))return "⚪ Дату заміни не вказано";
 const remaining=gap(now,due);
 if(remaining<0)return "🔴 ПРОСТРОЧЕНО на "+calendarSpan(due,now)+" ("+(-remaining)+" днів)";
 if(remaining===0)return "🔴 ЗАМІНИТИ СЬОГОДНІ";
 if(remaining<=7)return "🟠 Заміна скоро — "+calendarSpan(now,due)+" ("+remaining+" днів)";
 return "🟢 До заміни — "+calendarSpan(now,due)+" ("+remaining+" днів)";
}
function filterIcon(due,now=today()){
 if(!due)return "⚪";
 const remaining=gap(now,due);
 return remaining<=0?"🔴":remaining<=7?"🟠":"🟢";
}

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
const actor=(e,u)=>e.ACTOR_UID??u;
const send=(e,u,s,keys)=>tg(e,"sendMessage",{chat_id:actor(e,u),text:s,parse_mode:"HTML",reply_markup:keys?{inline_keyboard:keys}:undefined});
async function session(e,u,kind,step=0,obj={}){await run(e,"INSERT INTO sessions(uid,kind,step,json) VALUES(?,?,?,?) ON CONFLICT(uid) DO UPDATE SET kind=excluded.kind,step=excluded.step,json=excluded.json",actor(e,u),kind,step,JSON.stringify(obj));}
const cancel=(e,u)=>run(e,"DELETE FROM sessions WHERE uid=?",actor(e,u));

async function agenda(e,u){
 const d=today(),until=add(d,7);
 const rows=await all(e,"SELECT id,kind,title,due FROM items WHERE uid=? AND done=0 AND kind IN ('filters','tasks') AND due<=? ORDER BY due,id LIMIT 35",u,until);
 const overdue=rows.filter(x=>x.due<=d),upcoming=rows.filter(x=>x.due>d);
 const line=x=>(x.due<d?"🔴":x.due===d?"🚨":"🟠")+" "+esc(x.title)+" — "+fmt(x.due)+(x.kind==="filters"?" 💧":" 📋");
 const buttons=rows.slice(0,12).map(x=>[key((x.kind==="filters"?"💧 ":"✅ ")+x.title.slice(0,34),x.kind==="filters"?"filter:"+x.id:"task:"+x.id)]);
 buttons.push([key("📋 Додати справу","add:tasks"),key("💧 Додати фільтр","add:filters")],...toHome);
 return send(e,u,"<b>📅 План на найближчі 7 днів</b>\n\n<b>Сьогодні та прострочено ("+overdue.length+"):</b>\n"+
 (overdue.length?overdue.map(line).join("\n"):"Немає.")+
 "\n\n<b>Незабаром ("+upcoming.length+"):</b>\n"+(upcoming.length?upcoming.map(line).join("\n"):"Немає.")+
 (rows.length===35?"\n\nПоказано перші 35 записів.":""),
 buttons);
}
async function statistics(e,u){
 const now=today(),month=now.slice(0,7)+"-01",year=now.slice(0,4)+"-01-01";
 const [total,recent,allExp,monthExp,yearExp,pending,done,upcoming,perFilter]=await Promise.all([
  first(e,"SELECT COUNT(*) n,COALESCE(SUM(amount),0) cost FROM history WHERE uid=?",u),
  first(e,"SELECT COUNT(*) n,COALESCE(SUM(amount),0) cost FROM history WHERE uid=? AND changed>=?",u,add(now,-30)),
  first(e,"SELECT COUNT(*) n,COALESCE(SUM(amount),0) cost FROM items WHERE uid=? AND kind='expenses'",u),
  first(e,"SELECT COUNT(*) n,COALESCE(SUM(amount),0) cost FROM items WHERE uid=? AND kind='expenses' AND changed>=?",u,month),
  first(e,"SELECT COUNT(*) n,COALESCE(SUM(amount),0) cost FROM items WHERE uid=? AND kind='expenses' AND changed>=?",u,year),
  first(e,"SELECT COUNT(*) n FROM items WHERE uid=? AND kind='tasks' AND done=0",u),
  first(e,"SELECT COUNT(*) n FROM items WHERE uid=? AND kind='tasks' AND done=1",u),
  first(e,"SELECT COUNT(*) n FROM items WHERE uid=? AND kind='filters' AND done=0 AND due<=?",u,add(now,7)),
  all(e,"SELECT i.title,COUNT(*) n FROM history h JOIN items i ON i.id=h.item_id AND i.uid=h.uid WHERE h.uid=? GROUP BY i.id ORDER BY n DESC LIMIT 5",u)
 ]);
 const lines=perFilter.map(x=>"• "+esc(x.title)+": "+x.n+" замін").join("\n");
 return send(e,u,"<b>📊 Статистика всієї оселі</b>\n\n<b>💸 Витрати</b>\nЦього місяця: "+hryvnia(monthExp.cost)+
 "\nЦього року: "+hryvnia(yearExp.cost)+"\nЗа весь час: "+hryvnia(allExp.cost)+
 "\n\n<b>💧 Обслуговування</b>\nВсього замін: "+total.n+"\nЗа останні 30 днів: "+recent.n+
 "\nПотребують уваги за 7 днів: "+upcoming.n+
 "\n"+(lines||"Заміни ще не записувалися.")+
 "\n\n<b>📋 Домашні справи</b>\nАктивних: "+pending.n+"\nЗавершених: "+done.n,
 [[key("📅 План на тиждень","menu:agenda")],...toHome]);
}
function notificationPhase(due,d){
 const delta=gap(d,due);
 if(delta===7)return "seven";
 if(delta===1)return "early";
 if(delta===0)return "due";
 if(delta<0&&(-delta)%3===0)return "late";
 return null;
}
async function notificationPrefs(e,uid){
 const x=await first(e,"SELECT enabled,warnings FROM notification_settings WHERE uid=?",uid);
 return {enabled:x?.enabled!==0,warnings:x?.warnings!==0};
}
async function notificationsMenu(e,u){
 const pref=await notificationPrefs(e,actor(e,u));
 return send(e,u,"<b>🔔 Нагадування</b>\n\n"+(pref.enabled?"✅ Увімкнені":"🔕 Вимкнені")+
 "\nПопередження за 7 днів: "+(pref.warnings?"так":"ні")+
 "\n\nЧас: 09:00 за Києвом. Налаштування особисті для кожного учасника сім’ї.",
 [[key(pref.enabled?"🔕 Вимкнути все":"🔔 Увімкнути все","notify:enabled")],[key(pref.warnings?"🔕 Без попереджень за 7 днів":"🔔 Попереджати за 7 днів","notify:warnings")],...toHome]);
}
async function familyMenu(e,u){
 const viewer=actor(e,u),isOwner=viewer===u;
 const members=await all(e,"SELECT m.uid,COALESCE(users.name,'') name FROM family_members m LEFT JOIN users ON users.id=m.uid WHERE m.owner_uid=? ORDER BY m.joined_at",u);
 const current=await first(e,"SELECT name FROM users WHERE id=?",u);
 const names=["👑 "+esc(current?.name||"Власник"),...members.map(x=>"👤 "+esc(x.name||String(x.uid)))];
 const buttons=[];
 if(isOwner){
  buttons.push([key("🔗 Запросити члена сім’ї","family:invite")]);
  for(const m of members)buttons.push([key("🚫 Відключити "+(m.name||String(m.uid)).slice(0,22),"familyremove:"+m.uid)]);
 }else buttons.push([key("🚪 Вийти зі спільної оселі","family:leave")]);
 buttons.push(...toHome);
 return send(e,u,"<b>👨‍👩‍👧 Наша оселя</b>\n\nСпільні фільтри, осмос, покупки, витрати, справи та історія.\n"+
 "Нагадування кожен налаштовує окремо.\n\n"+names.join("\n")+
 "\n\n"+(isOwner?"Лише власник може запросити або відключити учасників.":"Доступ надав власник оселі."),
 buttons);
}
function invitationCode(){
 const bytes=new Uint8Array(18);crypto.getRandomValues(bytes);
 return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
}
async function inviteHash(code){
 const data=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(code));
 return Array.from(new Uint8Array(data),b=>b.toString(16).padStart(2,"0")).join("");
}
async function issueInvitation(e,u){
 if(actor(e,u)!==u)return send(e,u,"Лише власник оселі може запросити учасника.");
 const members=await first(e,"SELECT COUNT(*) n FROM family_members WHERE owner_uid=?",u);
 if(members.n>=5)return send(e,u,"Максимум 5 запрошених учасників.");
 const code=invitationCode(),hash=await inviteHash(code),me=await tg(e,"getMe",{});
 if(!/^[A-Za-z0-9_]{5,32}$/.test(me.username||""))throw Error("Telegram bot username unavailable");
 const expires=Math.floor(Date.now()/1000)+86400;
 await run(e,"INSERT INTO family_invites(token_hash,owner_uid,expires_at) VALUES(?,?,?)",hash,u,expires);
 const link="https://t.me/"+me.username+"?start=join_"+code;
 return send(e,u,"🔐 <b>Одноразове сімейне запрошення</b>\n\n"+link+
 "\n\nДіє 24 години та лише для одного учасника. Надішли посилання потрібній людині приватно. Вона натисне Start і отримає доступ до спільної оселі.");
}
async function redeemInvitation(e,uid,code){
 if(!/^[a-f0-9]{36}$/.test(code))return false;
 const already=await first(e,"SELECT owner_uid FROM family_members WHERE uid=?",uid);
 if(already)return false;
 const hasData=await first(e,"SELECT (SELECT COUNT(*) FROM items WHERE uid=?)+(SELECT COUNT(*) FROM osmosis_systems WHERE uid=?) n",uid,uid);
 if(hasData?.n)return false; // Never strand private records by making their owner inaccessible.
 const hash=await inviteHash(code),invite=await first(e,"SELECT owner_uid FROM family_invites WHERE token_hash=? AND used_by IS NULL AND expires_at>?",hash,Math.floor(Date.now()/1000));
 if(!invite||invite.owner_uid===uid)return false;
 const used=await run(e,"UPDATE family_invites SET used_by=?,used_at=? WHERE token_hash=? AND used_by IS NULL AND expires_at>? AND owner_uid!=(?) AND (SELECT COUNT(*) FROM family_members WHERE owner_uid=?)<5",uid,Math.floor(Date.now()/1000),hash,Math.floor(Date.now()/1000),uid,invite.owner_uid);
 if(!used?.meta?.changes)return false;
 await run(e,"INSERT OR IGNORE INTO family_members(uid,owner_uid) SELECT ?,owner_uid FROM family_invites WHERE token_hash=? AND used_by=?",uid,hash,uid);
 return true;
}

async function menu(e,u,kind="home"){
 if(kind==="home"){
  const overdue=await first(e,"SELECT COUNT(*) n FROM items WHERE uid=? AND kind='filters' AND done=0 AND due<=?",u,today());
  const soon=await first(e,"SELECT COUNT(*) n FROM items WHERE uid=? AND kind='filters' AND done=0 AND due>? AND due<=?",u,today(),add(today(),7));
  const tasks=await first(e,"SELECT COUNT(*) n FROM items WHERE uid=? AND kind='tasks' AND done=0 AND due<=?",u,add(today(),7));
  const shopping=await first(e,"SELECT COUNT(*) n FROM items WHERE uid=? AND kind='shopping' AND done=0",u);
  return send(e,u,"<b>🏠 Оселя</b>\n\n🔴 Фільтрів замінити зараз: "+overdue.n+"\n🟠 Фільтрів замінити протягом 7 днів: "+soon.n+"\n📋 Справ на 7 днів: "+tasks.n+"\n🛒 Покупок: "+shopping.n+"\n\nОберіть розділ:",kb);
 }
 if(kind==="agenda")return agenda(e,u);
 if(kind==="stats")return statistics(e,u);
 if(kind==="family")return familyMenu(e,u);
 if(kind==="osmosis"){
  const systems=await all(e,"SELECT * FROM osmosis_systems WHERE uid=? ORDER BY id DESC LIMIT 30",u);
  const buttons=systems.map(x=>[key("🚰 "+x.title.slice(0,43),"system:"+x.id)]);
  buttons.push([key("➕ Додати осмос","add:osmosis")],...toHome);
  return send(e,u,"<b>🚰 Мій осмос</b>\n\n"+(systems.length?"Обери систему, щоб переглянути картриджі й терміни їх заміни.":"Додай свій осмос. Для нього можна вести окремі картриджі й графік їх замін.")+"\n",buttons);
 }
 if(kind==="other")return send(e,u,"<b>⚙️ Налаштування</b>\n\nНагадування надходять о 09:00 за Києвом.\n/export — резервна копія JSON\n/import — імпорт у порожній профіль (лише власник)\n/cancel — скасувати",[[key("🔔 Налаштування нагадувань","notifications")],[key("📤 Експорт","export"),key("📥 Імпорт","import")],...toHome]);
 if(!kinds[kind])return menu(e,u);
 const rows=await all(e,"SELECT * FROM items WHERE uid=? AND kind=? AND done=0 ORDER BY COALESCE(due,'9999-12-31'),id DESC LIMIT 15",u,kind);
 const desc=rows.map(x=>kind==="filters"?"• "+filterIcon(x.due)+" "+esc(x.title)+" — "+fmt(x.due)+"\n   "+replacementStatus(x.due):"• "+esc(x.title)+(x.due?" — "+fmt(x.due):"")+(kind==="expenses"?" · "+hryvnia(x.amount):"")+(kind==="shopping"&&x.notes?" · "+esc(x.notes):""));
 const opts=rows.map(x=>kind==="filters"?[key(filterIcon(x.due)+" "+x.title.slice(0,26),"filter:"+x.id)]:["tasks","shopping"].includes(kind)?[key("✅ "+x.title.slice(0,26),"done:"+x.id)]:[]).filter(r=>r.length);
 opts.push([key("➕ Додати","add:"+kind)]);opts.push(...toHome);
 return send(e,u,"<b>"+kinds[kind]+"</b>\n\n"+(desc.length?desc.join("\n"):"Наразі записів немає."),opts);
}
async function systemDetail(e,u,id){
 const x=await first(e,"SELECT * FROM osmosis_systems WHERE uid=? AND id=?",u,id);
 if(!x)return menu(e,u,"osmosis");
 const filters=await all(e,"SELECT * FROM items WHERE uid=? AND osmosis_id=? AND kind='filters' AND done=0 ORDER BY due,id LIMIT 30",u,id);
 const desc=filters.length?filters.map(z=>"• "+filterIcon(z.due)+" "+esc(z.title)+" — "+fmt(z.due)+"\n   "+replacementStatus(z.due)).join("\n"):"Фільтри поки не додані.";
 const buttons=filters.map(z=>[key(filterIcon(z.due)+" "+z.title.slice(0,35),"filter:"+z.id)]);
 buttons.push([key("➕ Додати фільтр","add:filters:"+id)]);
 buttons.push([key("✏️ Редагувати осмос","sysedit:"+id)]);
 buttons.push([key("🔗 Прив'язати наявні фільтри","attach:"+id)]);
 buttons.push([key("⬅️ Мої осмоси","menu:osmosis")]);
 return send(e,u,"<b>🚰 "+esc(x.title)+"</b>\n"+(x.model?"Модель: "+esc(x.model)+"\n":"Модель: не вказана\n")+(x.installed_at?"Встановлено: "+fmt(x.installed_at)+"\n":"Дата встановлення: не вказана\n")+"\n<b>Картриджі:</b>\n"+desc,buttons);
}
async function attachFilters(e,u,id){
 const device=await first(e,"SELECT id FROM osmosis_systems WHERE uid=? AND id=?",u,id);
 if(!device)return menu(e,u,"osmosis");
 const rows=await all(e,"SELECT id,title FROM items WHERE uid=? AND kind='filters' AND osmosis_id IS NULL ORDER BY id LIMIT 30",u);
 if(!rows.length)return send(e,u,"Немає неприв'язаних фільтрів. Новий фільтр можна додати безпосередньо в картці осмосу.",[[key("⬅️ Назад","system:"+id)]]);
 return send(e,u,"Обери картриджі, які належать цьому осмосу. Уже збережені дати та історія замін залишаться без змін.",[...rows.map(z=>[key("🔗 "+z.title.slice(0,36),"assign:"+id+":"+z.id)]),[key("⬅️ Назад","system:"+id)]]);
}
async function detail(e,u,id){const x=await first(e,"SELECT * FROM items WHERE uid=? AND kind='filters' AND id=?",u,id);if(!x)return menu(e,u,"filters");const h=await all(e,"SELECT * FROM history WHERE uid=? AND item_id=? ORDER BY changed DESC LIMIT 5",u,id);
 const back=x.osmosis_id?"system:"+x.osmosis_id:"menu:filters";
 return send(e,u,"<b>💧 "+esc(x.title)+"</b>\n\nОстання заміна: "+fmt(x.changed)+"\nНаступна: "+fmt(x.due)+"\n"+replacementStatus(x.due)+"\nІнтервал: "+intervalDisplay(x)+"\n\nІсторія:\n"+(h.length?h.map(z=>"• "+fmt(z.changed)+(z.amount?" · "+hryvnia(z.amount):"")).join("\n"):"Записів ще немає."),[[key("✅ Замінено сьогодні","replacenow:"+id)],[key("📅 Вказати дату заміни","replacedate:"+id)],[key("💸 Замінено з витратами","replace:"+id)],[key("✏️ Змінити інтервал","interval:"+id),key("🗑 Видалити","delete:"+id)],[key("⬅️ Назад",back)]]);

}
// Calculate next replacement from the previously saved interval (including calendar months).
function replacementPlan(item,changed){
 if(!validDate(changed))return null;
 const unit=item.interval_unit==="months"&&item.interval_value>0?"months":"days";
 const value=unit==="months"?item.interval_value:(item.interval_value||item.days);
 if(!Number.isSafeInteger(value)||value<1)return null;
 const due=dueFor(changed,unit,value);
 return {changed,due,days:gap(changed,due),unit,value};
}
// Records a completed replacement and recalculates the next due date using the saved interval.
// The date must follow the previous recorded replacement and cannot be in the future.
async function recordReplacement(e,u,item,replacedOn,cost=0){
 if(!validDate(replacedOn)||replacedOn>today())
  return send(e,u,"❗ Дата заміни не може бути в майбутньому.");
 if(replacedOn<=item.changed)
  return send(e,u,"ℹ️ Остання заміна вже записана на "+fmt(item.changed)+". Обери пізнішу дату, щоб не дублювати запис.");
 const plan=replacementPlan(item,replacedOn);
 if(!plan)return send(e,u,"❗ Спочатку налаштуй інтервал цього фільтра.");
 const {due,days}=plan;
 // Optimistic guard: avoid processing an old button after another replacement.
 const result=await e.DB.batch([
  query(e,"UPDATE items SET changed=?,due=?,days=? WHERE uid=? AND kind='filters' AND id=? AND changed=?",replacedOn,due,days,u,item.id,item.changed),
  query(e,"INSERT INTO history(uid,item_id,changed,amount) SELECT ?,?,?,? WHERE (SELECT changed FROM items WHERE uid=? AND id=?)=? AND NOT EXISTS(SELECT 1 FROM history WHERE uid=? AND item_id=? AND changed=?)",u,item.id,replacedOn,cost,u,item.id,replacedOn,u,item.id,replacedOn),
  ...(cost>0?[query(e,"INSERT INTO items(uid,kind,title,amount,changed) SELECT ?,'expenses',?,?,? WHERE changes()=1",u,"Заміна: "+item.title,cost,replacedOn)]:[])
 ]);
 if(!result[0]?.meta?.changes){
  return send(e,u,"ℹ️ Цей запис уже оновлено. Відкрий фільтр ще раз, щоб побачити актуальні дати.");
 }
 await cancel(e,u);
 await send(e,u,"✅ Заміну "+esc(item.title)+" записано на "+fmt(replacedOn)+".\n🔔 Наступна заміна: <b>"+fmt(due)+"</b> ("+intervalDisplay({...item,changed:replacedOn,due})+").");
 return detail(e,u,item.id);
}
async function wizard(e,u,text,s){
 const p=JSON.parse(s.json);
 if(s.kind.startsWith("replace:")||s.kind.startsWith("interval:")||s.kind.startsWith("replacedate:")){
  const id=+s.kind.split(":")[1],item=await first(e,"SELECT * FROM items WHERE uid=? AND kind='filters' AND id=?",u,id);
  if(!item){await cancel(e,u);return menu(e,u,"filters");}
  if(s.kind.startsWith("interval:")){
   const interval=filterInterval(text,item.changed,p.mode||"days");
   if(!interval)return send(e,u,"❗ Неправильний інтервал. Приклади: 90 днів, 6 місяців або 31.12.2027.",intervalButtons);
   await run(e,"UPDATE items SET days=?,interval_unit=?,interval_value=?,due=? WHERE uid=? AND id=?",gap(item.changed,interval.due),interval.unit,interval.value,interval.due,u,id);
   await cancel(e,u);
   return detail(e,u,id);
  }
  if(s.kind.startsWith("replacedate:")){
   const date=validDate(text);
   if(!date)return send(e,u,"❗ Введи дату у форматі ДД.ММ.РРРР (наприклад, 15.10.2026) або «сьогодні».");
   return recordReplacement(e,u,item,date);
  }
  const amount=text==="-"?0:sum(text);
  if(amount===null)return send(e,u,"Введіть суму або - без витрат.");
  return recordReplacement(e,u,item,today(),amount);
 }
 const k=s.kind,n=s.step;if(!prompts[k])return false;
 if(k==="osmosis"){
  const value=n===1&&text.trim()==="-"?"":label(text);
  if(value===null)return send(e,u,"❗ Введіть назву до 120 символів або - якщо модель невідома.");
  p[n]=value;
  if(n+1<prompts[k].length){await session(e,u,k,n+1,p);return send(e,u,prompts[k][n+1]+"\n/cancel — скасувати");}
  const result=await run(e,"INSERT INTO osmosis_systems(uid,title,model) VALUES(?,?,?)",u,p[0],p[1]);
  await cancel(e,u);
  await send(e,u,"✅ Осмос додано! Тепер можеш додати картриджі й відстежувати терміни замін.");
  return systemDetail(e,u,result.meta.last_row_id);
 }
 let value;
 if((k==="filters"||k==="tasks")&&n===1)value=validDate(text);
 else if(k==="filters"&&n===2)value=filterInterval(text,p[1],p.mode||"days");
 else if(k==="tasks"&&n===2)value=number(text,0,3650);
 else if(k==="expenses"&&n===1)value=sum(text);
 else value=label(text);
 if(value===null)return send(e,u,k==="filters"&&n===2?"❗ Введіть 90 днів, 6 місяців або майбутню кінцеву дату.": "❗ Некоректне значення. Спробуйте ще раз або /cancel.",k==="filters"&&n===2?intervalButtons:undefined);
 p[n]=value;
 if(n+1<prompts[k].length){
  await session(e,u,k,n+1,p);
  return send(e,u,prompts[k][n+1]+"\n/cancel — скасувати",k==="filters"&&n+1===2?intervalButtons:undefined);
 }
 if(k==="filters"){
  const interval=p[2];
  await run(e,"INSERT INTO items(uid,kind,title,changed,days,due,interval_unit,interval_value,osmosis_id) VALUES(?,'filters',?,?,?,?,?,?,?)",
    u,p[0],p[1],gap(p[1],interval.due),interval.due,interval.unit,interval.value,p.osmosis_id||null);
 }
 if(k==="tasks")await run(e,"INSERT INTO items(uid,kind,title,due,days) VALUES(?,'tasks',?,?,?)",u,p[0],p[1],p[2]);
 if(k==="shopping")await run(e,"INSERT INTO items(uid,kind,title,notes) VALUES(?,'shopping',?,?)",u,p[0],p[1]);
 if(k==="expenses"){
  if(p[1]===0)return send(e,u,"Сума має бути більшою за нуль.");
  await run(e,"INSERT INTO items(uid,kind,title,amount,changed) VALUES(?,'expenses',?,?,?)",u,p[0],p[1],today());
 }
 await cancel(e,u);await send(e,u,"✅ Збережено.");
 return p.osmosis_id&&k==="filters"?systemDetail(e,u,p.osmosis_id):menu(e,u,k);
}
async function exportData(e,u){
 const backup={
  type:"oselya-bot-v1",
  systems:await all(e,"SELECT * FROM osmosis_systems WHERE uid=?",u),
  items:await all(e,"SELECT * FROM items WHERE uid=? AND kind!='tds'",u),
  history:await all(e,"SELECT * FROM history WHERE uid=?",u)
 };
 const form=new FormData();
 form.append("chat_id",String(u));
 form.append("document",new Blob([JSON.stringify(backup,null,2)],{type:"application/json"}),"oselya-"+today()+".json");
 const r=await fetch("https://api.telegram.org/bot"+e.BOT_TOKEN+"/sendDocument",{method:"POST",body:form});
 if(!r.ok)throw Error("Помилка експорту");
 const j=await r.json();if(!j.ok)throw Error(j.description);
}
async function importData(e,u,document){
 if(document.file_size>1048576||!String(document.file_name||"").toLowerCase().endsWith(".json"))throw Error("Потрібен .json до 1 МБ.");
 const file=await tg(e,"getFile",{file_id:document.file_id});
 if(!file.file_path||file.file_size>1048576)throw Error("Недоступний файл.");
 const r=await fetch("https://api.telegram.org/file/bot"+e.BOT_TOKEN+"/"+file.file_path);
 if(!r.ok)throw Error("Не вдалося завантажити файл.");
 const bytes=await r.arrayBuffer();if(bytes.byteLength>1048576)throw Error("Завеликий файл.");
 const b=JSON.parse(new TextDecoder().decode(bytes));
 // Older backups may contain TDS readings. Ignore those on restore.
 if(Array.isArray(b.items)){
  const keptIds=new Set(b.items.filter(x=>x.kind!=="tds").map(x=>x.id));
  b.items=b.items.filter(x=>x.kind!=="tds");
  if(Array.isArray(b.history))b.history=b.history.filter(x=>keptIds.has(x.item_id));
 }
 const systems=Array.isArray(b.systems)?b.systems:[];
 if(b.type!=="oselya-bot-v1"||!Array.isArray(b.items)||!Array.isArray(b.history)||b.items.length+b.history.length+systems.length>500)throw Error("Некоректна копія цього бота.");
 const systemIds=new Set(systems.map(x=>x.id));
 const itemIds=new Set(b.items.map(x=>x.id));
 if(systemIds.size!==systems.length||itemIds.size!==b.items.length)throw Error("Повторювані ID у резервній копії.");
 for(const x of systems){
  if(!Number.isSafeInteger(x.id)||!label(x.title)||String(x.model||"").length>120)throw Error("Некоректні дані осмосу.");
 }
 for(const x of b.items){
  if(!["filters","tasks","shopping","expenses"].includes(x.kind)||!Number.isSafeInteger(x.id)||!label(x.title)||
      !Number.isInteger(x.amount)||x.amount<0||x.amount>1000000000||
      !Number.isInteger(x.days)||x.days<0||x.days>3650)throw Error("Некоректні дані запису.");
  if(x.changed&&!validDate(x.changed))throw Error("Некоректна дата.");
  if(x.due&&!validDate(x.due))throw Error("Некоректна дата.");
  if(x.osmosis_id!=null&&!systemIds.has(x.osmosis_id))throw Error("Невідома система осмосу в копії.");
  if(x.kind==="filters"){
   const unit=x.interval_unit||"days",val=x.interval_value||x.days;
   if(!["days","months"].includes(unit)||!Number.isInteger(val)||val<1||val>(unit==="months"?120:3650))throw Error("Некоректний інтервал фільтра.");
  }
 }
 for(const h of b.history){
  if(!itemIds.has(h.item_id)||!validDate(h.changed)||number(h.amount,0,1000000000)===null)throw Error("Некоректна історія.");
 }
 const currentItems=await first(e,"SELECT COUNT(*) n FROM items WHERE uid=?",u);
 const currentSystems=await first(e,"SELECT COUNT(*) n FROM osmosis_systems WHERE uid=?",u);
 if(currentItems.n||currentSystems.n)throw Error("Імпорт можливий лише в порожній профіль.");
 const newSystems=new Map();
 for(const x of systems){
  const result=await run(e,"INSERT INTO osmosis_systems(uid,title,model,installed_at) VALUES(?,?,?,?)",
    u,x.title,String(x.model||""),x.installed_at&&validDate(x.installed_at)?x.installed_at:null);
  newSystems.set(x.id,result.meta.last_row_id);
 }
 const ids=new Map();
 for(const x of b.items){
  const unit=x.kind==="filters"?(x.interval_unit||"days"):"days";
  const interval=x.kind==="filters"?(x.interval_value||x.days):0;
  const result=await run(e,"INSERT INTO items(uid,kind,title,done,changed,days,due,notes,amount,osmosis_id,interval_unit,interval_value) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
    u,x.kind,x.title,x.done===1?1:0,x.changed||null,x.days,x.due||null,String(x.notes||"").slice(0,120),
    x.amount,x.osmosis_id==null?null:newSystems.get(x.osmosis_id),unit,interval);
  ids.set(x.id,result.meta.last_row_id);
 }
 for(const h of b.history){
  await run(e,"INSERT INTO history(uid,item_id,changed,amount) VALUES(?,?,?,?)",
    u,ids.get(h.item_id),h.changed,h.amount);
 }
 await cancel(e,u);
}
async function action(e,u,data){
 if(data.startsWith("menu:"))return menu(e,u,data.slice(5));
 const sd=data.match(/^system:(\d+)$/);
 if(sd)return systemDetail(e,u,+sd[1]);
 const attached=data.match(/^attach:(\d+)$/);
 if(attached)return attachFilters(e,u,+attached[1]);
 const assigned=data.match(/^assign:(\d+):(\d+)$/);
 if(assigned){
  const id=+assigned[1],itemId=+assigned[2];
  const exists=await first(e,"SELECT id FROM osmosis_systems WHERE uid=? AND id=?",u,id);
  if(!exists)return menu(e,u,"osmosis");
  await run(e,"UPDATE items SET osmosis_id=? WHERE uid=? AND kind='filters' AND id=? AND osmosis_id IS NULL",id,u,itemId);
  return systemDetail(e,u,id);
 }
 if(data.startsWith("add:")){
  const match=data.match(/^add:(osmosis|filters|tasks|shopping|expenses)(?::(\d+))?$/);
  if(!match)return menu(e,u);
  const k=match[1],id=match[2]?+match[2]:null;
  if(id){
   if(k!=="filters")return menu(e,u);
   const exists=await first(e,"SELECT id FROM osmosis_systems WHERE uid=? AND id=?",u,id);
   if(!exists)return menu(e,u,"osmosis");
  }
  await session(e,u,k,0,id?{osmosis_id:id}:{});
  return send(e,u,prompts[k][0]+"\n/cancel — скасувати");
 }
 if(data.startsWith("period:")){
  const mode=data.slice(7);
  if(!["days","months","date"].includes(mode))return menu(e,u);
  const current=await first(e,"SELECT * FROM sessions WHERE uid=?",u);
  if(!current||!((current.kind==="filters"&&current.step===2)||current.kind.startsWith("interval:")))return menu(e,u);
  const state=JSON.parse(current.json);
  state.mode=mode;
  await session(e,u,current.kind,current.step,state);
  return send(e,u,periodPrompt(mode)+"\n/cancel — скасувати",intervalButtons);
 }
 if(data==="export")return exportData(e,u);
 if(data==="import"){await session(e,u,"import");return send(e,u,"📥 Надішліть JSON-файл від /export. Імпорт тільки в порожній профіль.");}
 const m=data.match(/^(filter|replacenow|replacedate|replace|interval|delete|done):(\d+)$/);if(!m)return menu(e,u);
 const id=+m[2],verb=m[1];
 if(verb==="filter")return detail(e,u,id);
 const x=await first(e,"SELECT * FROM items WHERE uid=? AND id=?",u,id);if(!x)return menu(e,u);
 if(verb==="replacenow"){
  if(x.kind!=="filters")return menu(e,u);
  return recordReplacement(e,u,x,today());
 }
 if(verb==="replace"||verb==="interval"||verb==="replacedate"){
  if(x.kind!=="filters")return menu(e,u);
  await session(e,u,verb+":"+id);
  const prompt=verb==="replace"?"Вартість заміни сьогодні у грн (або - без витрат)?":
    verb==="replacedate"?"Коли замінив фільтр? Введи ДД.ММ.РРРР або «сьогодні». Інтервал збережений і буде застосований автоматично.":
    "Новий інтервал: 90 днів, 6 місяців або дата 31.12.2027?";
  return send(e,u,prompt,verb==="interval"?intervalButtons:undefined);
 }
 if(verb==="delete"){
  if(x.kind!=="filters")return menu(e,u);
  await e.DB.batch([query(e,"DELETE FROM history WHERE uid=? AND item_id=?",u,id),query(e,"DELETE FROM items WHERE uid=? AND id=?",u,id)]);
  return x.osmosis_id?systemDetail(e,u,x.osmosis_id):menu(e,u,"filters");
 }
 if(verb==="done"){
  if(x.kind==="tasks"&&x.days>0){
   const cycles=Math.max(1,Math.floor(gap(x.due,today())/x.days)+1);
   await run(e,"UPDATE items SET due=? WHERE uid=? AND id=?",add(x.due,cycles*x.days),u,id);
  }else await run(e,"UPDATE items SET done=1 WHERE uid=? AND id=?",u,id);
  return menu(e,u,x.kind);
 }
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
 const c={"/osmosis":"osmosis","/filters":"filters","/tasks":"tasks","/shopping":"shopping","/expenses":"expenses","/help":"other"};
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

export {addMonths,filterInterval,dueFor,intervalDisplay,replacementPlan,calendarParts,calendarSpan,replacementStatus,filterIcon};
