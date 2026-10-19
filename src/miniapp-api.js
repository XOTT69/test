// Telegram Mini App API: all data is protected by verified Telegram initData.
// No client-provided Telegram ID or household owner is trusted.
const enc=new TextEncoder();
const respond=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
const db=(e,sql,...args)=>e.DB.prepare(sql).bind(...args);
const one=(e,sql,...args)=>db(e,sql,...args).first();
const many=async(e,sql,...args)=>(await db(e,sql,...args).all()).results||[];
const exec=(e,sql,...args)=>db(e,sql,...args).run();
function bad(message,status=400){throw Object.assign(new Error(message),{status});}
function txt(v,max=120,allowEmpty=false){
 if(typeof v!=="string")bad("Введіть текст.");
 const value=v.trim().replace(/\s+/g," ");
 if(value.length>max||(!allowEmpty&&!value))bad("Перевір назву або довжину тексту.");
 return value;
}
function posId(v){const n=Number(v);if(!Number.isSafeInteger(n)||n<1)bad("Некоректний ідентифікатор.");return n;}
function integer(v,min=0,max=99999){const n=Number(v);if(!Number.isSafeInteger(n)||n<min||n>max)bad("Некоректна кількість.");return n;}
function isoDate(v,optional=false){
 if((v===""||v===null||v===undefined)&&optional)return null;
 if(typeof v!=="string")bad("Некоректна дата.");
 let value=v.trim();
 const m=value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
 if(m)value=m[3]+"-"+m[2]+"-"+m[1];
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))bad("Дата: ДД.ММ.РРРР.");
 const dt=new Date(value+"T12:00:00Z");
 if(!Number.isFinite(dt.valueOf())||dt.toISOString().slice(0,10)!==value)bad("Такої дати не існує.");
 return value;
}
function medicineDate(v){
 if(v==null||v==="")return null;
 const m=typeof v==="string"&&v.trim().match(/^(\d{2})\.(\d{4})$/);
 if(!m)return isoDate(v);
 const year=Number(m[2]),month=Number(m[1]);
 if(year<2000||year>2100||month<1||month>12)bad("Некоректний місяць.");
 const day=new Date(Date.UTC(year,month,0)).getUTCDate();
 return year+"-"+String(month).padStart(2,"0")+"-"+String(day).padStart(2,"0");
}
function dayGap(a,b){return Math.round((Date.parse(b+"T12:00:00Z")-Date.parse(a+"T12:00:00Z"))/86400000);}
function plusDays(d,n){const x=new Date(d+"T12:00:00Z");x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10);}
function plusMonths(d,n){
 const [y,m,day]=d.split("-").map(Number),index=y*12+m-1+n,yr=Math.floor(index/12),mo=index%12;
 const last=new Date(Date.UTC(yr,mo+1,0)).getUTCDate();
 return String(yr).padStart(4,"0")+"-"+String(mo+1).padStart(2,"0")+"-"+String(Math.min(day,last)).padStart(2,"0");
}
function todayKyiv(){const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Kyiv",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
 const p=k=>parts.find(x=>x.type===k).value;return p("year")+"-"+p("month")+"-"+p("day");}
function equalHex(a,b){
 if(!/^[a-f0-9]{64}$/i.test(a||"")||b.length!==a.length)return false;
 let diff=0;for(let i=0;i<b.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;
}
async function hmac(key,value){
 const secret=await crypto.subtle.importKey("raw",key,{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 return new Uint8Array(await crypto.subtle.sign("HMAC",secret,value));
}
const hex=bytes=>[...bytes].map(x=>x.toString(16).padStart(2,"0")).join("");
export async function verifyTelegramInitData(raw,token,now=Math.floor(Date.now()/1000)){
 if(typeof raw!=="string"||raw.length>8192||!raw||!token)return null;
 const params=new URLSearchParams(raw);
 const entries=[...params.entries()];
 if(new Set(entries.map(x=>x[0])).size!==entries.length)return null;
 const hash=params.get("hash"),stamp=Number(params.get("auth_date"));
 if(!Number.isSafeInteger(stamp)||stamp>now+60||now-stamp>86400)return null;
 const key=await hmac(enc.encode("WebAppData"),enc.encode(token));
 async function verify(excludeSignature){
  const check=entries.filter(([k])=>k!=="hash"&&(!excludeSignature||k!=="signature"))
   .sort((a,b)=>a[0].localeCompare(b[0],"en")).map(([k,v])=>k+"="+v).join("\n");
  return equalHex(hash,hex(await hmac(key,enc.encode(check))));
 }
 if(!await verify(false)&&!(params.has("signature")&&await verify(true)))return null;
 let user;try{user=JSON.parse(params.get("user")||"");}catch{return null;}
 if(!Number.isSafeInteger(user?.id)||user.id<1||user.is_bot)return null;
 return {id:user.id,first_name:String(user.first_name||"").slice(0,80)};
}
async function authorize(req,e){
 const raw=req.headers.get("x-telegram-init-data")||"";
 const user=await verifyTelegramInitData(raw,e.BOT_TOKEN);
 if(!user)bad("Відкрийте «Оселю» через Telegram. Сесію слід оновити.",401);
 const allowed=String(e.ALLOWED_USERS||"").split(",").map(x=>x.trim()).includes(String(user.id));
 const member=await one(e,"SELECT owner_uid FROM family_members WHERE uid=?",user.id);
 if(!allowed&&!member)bad("Доступ лише за запрошенням власника оселі.",403);
 const owner=member?.owner_uid||user.id;
 await exec(e,"INSERT INTO users(id,name) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name",user.id,user.first_name);
 return {uid:user.id,owner,role:member?"member":"owner",name:user.first_name};
}
async function bootstrap(e,auth){
 const u=auth.owner;
 const [systems,filters,medicines,tasks,shopping,expenses,history,members,ownerName,settings]=await Promise.all([
  many(e,"SELECT id,title,model,installed_at FROM osmosis_systems WHERE uid=? ORDER BY id DESC LIMIT 100",u),
  many(e,"SELECT id,title,changed,due,days,interval_unit,interval_value,osmosis_id FROM items WHERE uid=? AND kind='filters' AND done=0 ORDER BY due LIMIT 200",u),
  many(e,"SELECT id,name,form,quantity,unit,expires_at,low_at,location,notes,archived FROM medicine_items WHERE uid=? ORDER BY archived,expires_at,id LIMIT 250",u),
  many(e,"SELECT id,title,due,days,done FROM items WHERE uid=? AND kind='tasks' ORDER BY done,due LIMIT 200",u),
  many(e,"SELECT id,title,notes,done FROM items WHERE uid=? AND kind='shopping' ORDER BY done,id DESC LIMIT 200",u),
  many(e,"SELECT id,title,amount,changed FROM items WHERE uid=? AND kind='expenses' ORDER BY id DESC LIMIT 100",u),
  many(e,"SELECT h.item_id,h.changed,h.amount,i.title FROM history h JOIN items i ON i.id=h.item_id AND i.uid=h.uid WHERE h.uid=? ORDER BY h.id DESC LIMIT 100",u),
  many(e,"SELECT m.uid,COALESCE(users.name,'') name FROM family_members m LEFT JOIN users ON users.id=m.uid WHERE m.owner_uid=? ORDER BY m.joined_at LIMIT 10",u),
  one(e,"SELECT name FROM users WHERE id=?",u),
  one(e,"SELECT enabled,warnings FROM notification_settings WHERE uid=?",auth.uid)
 ]);
 const costs=await one(e,"SELECT COALESCE(SUM(amount),0) total,COUNT(*) entries FROM items WHERE uid=? AND kind='expenses'",u);
 const current=todayKyiv();
 return {me:{id:auth.uid,name:auth.name,role:auth.role},household:{owner:u,name:ownerName?.name||"Моя оселя",members},
  today:current,systems,filters,medicines,tasks,shopping,expenses,history,
  stats:{spending:costs?.total||0,expenses:costs?.entries||0,replacements:history.length},
  settings:{enabled:settings?.enabled!==0,warnings:settings?.warnings!==0}};
}
async function mutate(e,a,p){
 const u=a.owner,id=p.id?posId(p.id):null,now=todayKyiv();
 switch(p.type){
 case "system.save":{
  const title=txt(p.title),model=txt(p.model||"",120,true),installed=isoDate(p.installed_at,true);
  if(id){
   const result=await exec(e,"UPDATE osmosis_systems SET title=?,model=?,installed_at=? WHERE uid=? AND id=?",title,model,installed,u,id);
   if(!result.meta.changes)bad("Осмос не знайдено.",404);
  }else await exec(e,"INSERT INTO osmosis_systems(uid,title,model,installed_at) VALUES(?,?,?,?)",u,title,model,installed);
  break;
 }
 case "filter.save":{
  const title=txt(p.title),changed=isoDate(p.changed);
  const system=p.osmosis_id?posId(p.osmosis_id):null;
  if(system&&!await one(e,"SELECT id FROM osmosis_systems WHERE uid=? AND id=?",u,system))bad("Осмос не знайдено.");
  const unit=p.unit==="months"?"months":"days",value=integer(p.interval,1,unit==="months"?120:3650);
  const due=p.exact_due?isoDate(p.exact_due):unit==="months"?plusMonths(changed,value):plusDays(changed,value);
  const days=dayGap(changed,due);
  if(days<1||days>3650)bad("Дата заміни повинна бути після останньої заміни.");
  if(id){
   const updated=await exec(e,"UPDATE items SET title=?,changed=?,due=?,days=?,interval_unit=?,interval_value=?,osmosis_id=? WHERE uid=? AND kind='filters' AND id=?",title,changed,due,days,p.exact_due?"days":unit,p.exact_due?days:value,system,u,id);
   if(!updated.meta.changes)bad("Фільтр не знайдено.",404);
  }else await exec(e,"INSERT INTO items(uid,kind,title,changed,due,days,interval_unit,interval_value,osmosis_id) VALUES(?,'filters',?,?,?,?,?,?,?)",u,title,changed,due,days,p.exact_due?"days":unit,p.exact_due?days:value,system);
  break;
 }
 case "filter.replace":{
  if(!id)bad("Вибери фільтр.");
  const item=await one(e,"SELECT * FROM items WHERE uid=? AND kind='filters' AND id=?",u,id);
  if(!item)bad("Фільтр не знайдено.",404);
  const date=isoDate(p.date||now),cost=integer(p.cost||0,0,100000000);
  if(date>now||date<=item.changed)bad("Дата має бути пізнішою за попередню заміну і не в майбутньому.");
  const unit=item.interval_unit==="months"&&item.interval_value>0?"months":"days",val=item.interval_value||item.days;
  if(!val)bad("Інтервал фільтра не встановлено.");
  const due=unit==="months"?plusMonths(date,val):plusDays(date,val);
  const update=await exec(e,"UPDATE items SET changed=?,due=?,days=? WHERE uid=? AND id=? AND changed=?",date,due,dayGap(date,due),u,id,item.changed);
  if(!update.meta.changes)bad("Фільтр уже оновили. Перезавантажте дані.",409);
  await exec(e,"INSERT INTO history(uid,item_id,changed,amount) VALUES(?,?,?,?)",u,id,date,cost);
  if(cost)await exec(e,"INSERT INTO items(uid,kind,title,amount,changed) VALUES(?,'expenses',?,?,?)",u,"Заміна: "+item.title,cost,date);
  return {next_due:due};
 }
 case "filter.delete":{
  if(!id)bad("Вибери фільтр.");
  await e.DB.batch([db(e,"DELETE FROM history WHERE uid=? AND item_id=?",u,id),db(e,"DELETE FROM sent WHERE item_id=? AND uid=?",id,u),
   db(e,"DELETE FROM items WHERE uid=? AND kind='filters' AND id=?",u,id)]);break;
 }
 case "medicine.save":{
  const name=txt(p.name),form=txt(p.form||"",80,true),unit=txt(p.unit||"шт",40),qty=integer(p.quantity,0,99999);
  const exp=medicineDate(p.expires_at),low=integer(p.low_at||0,0,99999),location=txt(p.location||"",80,true),notes=txt(p.notes||"",350,true);
  if(id){
   const current=await one(e,"SELECT quantity FROM medicine_items WHERE uid=? AND id=?",u,id);
   if(!current)bad("Препарат не знайдено.",404);
   await exec(e,"UPDATE medicine_items SET name=?,form=?,quantity=?,unit=?,expires_at=?,low_at=?,location=?,notes=?,updated_at=CURRENT_TIMESTAMP WHERE uid=? AND id=?",name,form,qty,unit,exp,low,location,notes,u,id);
   if(current.quantity!==qty)await exec(e,"INSERT INTO medicine_events(uid,medicine_id,delta,kind) VALUES(?,?,?,?)",u,id,qty-current.quantity,"adjust");
   await exec(e,"DELETE FROM medicine_alerts WHERE medicine_id=? AND uid=?",id,a.uid);
  }else{
   const res=await exec(e,"INSERT INTO medicine_items(uid,name,form,quantity,unit,expires_at,low_at,location,notes) VALUES(?,?,?,?,?,?,?,?,?)",u,name,form,qty,unit,exp,low,location,notes);
   if(qty)await exec(e,"INSERT INTO medicine_events(uid,medicine_id,delta,kind) VALUES(?,?,?,?)",u,res.meta.last_row_id,qty,"stock");
  }
  break;
 }
 case "medicine.stock":{
  if(!id)bad("Вибери препарат.");
  const delta=integer(Math.abs(Number(p.delta)),1,99999)*Math.sign(Number(p.delta));
  const med=await one(e,"SELECT quantity FROM medicine_items WHERE uid=? AND id=? AND archived=0",u,id);
  if(!med)bad("Препарат не знайдено.",404);
  if(med.quantity+delta<0||med.quantity+delta>99999)bad("Недостатньо запасу або перевищений ліміт.");
  const res=await exec(e,"UPDATE medicine_items SET quantity=quantity+?,updated_at=CURRENT_TIMESTAMP WHERE uid=? AND id=? AND quantity=?",delta,u,id,med.quantity);
  if(!res.meta.changes)bad("Дані вже оновили. Спробуй ще раз.",409);
  await exec(e,"INSERT INTO medicine_events(uid,medicine_id,delta,kind) VALUES(?,?,?,?)",u,id,delta,delta<0?"used":"stock");
  if(delta>0)await exec(e,"DELETE FROM medicine_alerts WHERE medicine_id=? AND kind='low'",id);
  break;
 }
 case "medicine.archive":{
  if(!id)bad("Вибери препарат.");
  await exec(e,"UPDATE medicine_items SET archived=? WHERE uid=? AND id=?",p.archived?1:0,u,id);break;
 }
 case "task.save":{
  const title=txt(p.title),due=isoDate(p.due),days=integer(p.days||0,0,3650);
  if(id){const res=await exec(e,"UPDATE items SET title=?,due=?,days=?,done=0 WHERE uid=? AND kind='tasks' AND id=?",title,due,days,u,id);
   if(!res.meta.changes)bad("Справу не знайдено.",404);
  }else await exec(e,"INSERT INTO items(uid,kind,title,due,days) VALUES(?,'tasks',?,?,?)",u,title,due,days);
  break;
 }
 case "task.done":{
  if(!id)bad("Вибери справу.");
  const item=await one(e,"SELECT * FROM items WHERE uid=? AND kind='tasks' AND id=?",u,id);
  if(!item||item.done)bad("Справу вже завершено або не знайдено.");
  if(item.days>0){
   const cycles=Math.max(1,Math.floor(dayGap(item.due,now)/item.days)+1);
   await exec(e,"UPDATE items SET due=? WHERE uid=? AND id=?",plusDays(item.due,cycles*item.days),u,id);
  }else await exec(e,"UPDATE items SET done=1 WHERE uid=? AND id=?",u,id);
  break;
 }
 case "shopping.save":{
  const title=txt(p.title),notes=txt(p.notes||"",120,true);
  if(id){const res=await exec(e,"UPDATE items SET title=?,notes=? WHERE uid=? AND kind='shopping' AND id=?",title,notes,u,id);
   if(!res.meta.changes)bad("Покупку не знайдено.",404);
  }else await exec(e,"INSERT INTO items(uid,kind,title,notes) VALUES(?,'shopping',?,?)",u,title,notes);
  break;
 }
 case "shopping.done":{
  if(!id)bad("Вибери покупку.");
  await exec(e,"UPDATE items SET done=? WHERE uid=? AND kind='shopping' AND id=?",p.done?1:0,u,id);break;
 }
 case "expense.add":{
  const title=txt(p.title),amount=integer(p.amount,1,100000000);
  await exec(e,"INSERT INTO items(uid,kind,title,amount,changed) VALUES(?,'expenses',?,?,?)",u,title,amount,isoDate(p.changed||now));
  break;
 }
 case "settings.save":{
  await exec(e,"INSERT INTO notification_settings(uid,enabled,warnings) VALUES(?,?,?) ON CONFLICT(uid) DO UPDATE SET enabled=excluded.enabled,warnings=excluded.warnings",
   a.uid,p.enabled?1:0,p.warnings?1:0);break;
 }
 case "family.invite":{
  if(a.role!=="owner")bad("Лише власник може запросити сім’ю.",403);
  const count=await one(e,"SELECT COUNT(*) n FROM family_members WHERE owner_uid=?",u);
  if(count.n>=5)bad("Досягнуто ліміт п’яти учасників.");
  const bytes=crypto.getRandomValues(new Uint8Array(18)),code=hex(bytes);
  const digest=hex(new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode(code))));
  const res=await fetch("https://api.telegram.org/bot"+e.BOT_TOKEN+"/getMe");
  const response=await res.json(),name=response?.result?.username;
  if(!response.ok||!name)bad("Не вдалося отримати назву бота.",502);
  await exec(e,"INSERT INTO family_invites(token_hash,owner_uid,expires_at) VALUES(?,?,?)",digest,u,Math.floor(Date.now()/1000)+86400);
  return {invite:"https://t.me/"+name+"?start=join_"+code};
 }
 case "family.remove":{
  if(a.role!=="owner")bad("Лише власник може керувати сім’єю.",403);
  const uid=posId(p.uid);
  await exec(e,"DELETE FROM family_members WHERE owner_uid=? AND uid=?",u,uid);
  break;
 }
 case "family.leave":{
  if(a.role!=="member")bad("Ви не учасник спільної оселі.");
  await exec(e,"DELETE FROM family_members WHERE owner_uid=? AND uid=?",u,a.uid);
  break;
 }
 default:bad("Невідома дія.");
 }
 return {};
}
export async function handleMiniAppApi(request,e){
 try{
  if(!e?.DB||!e.BOT_TOKEN)bad("Сервіс тимчасово недоступний.",503);
  if(request.method!=="GET"&&request.method!=="POST")bad("Метод не підтримується.",405);
  if(request.method==="POST"){
   const origin=request.headers.get("origin");
   if(origin&&origin!==new URL(request.url).origin)bad("Заборонений запит.",403);
   if(Number(request.headers.get("content-length")||"0")>16000)bad("Завеликий запит.",413);
  }
  const auth=await authorize(request,e);
  const path=new URL(request.url).pathname;
  if(path==="/api/bootstrap"&&request.method==="GET")return respond(await bootstrap(e,auth));
  if(path==="/api/action"&&request.method==="POST"){
   let payload;try{payload=await request.json();}catch{bad("Некоректний JSON.");}
   if(!payload||typeof payload!=="object"||Array.isArray(payload))bad("Некоректні дані.");
   const result=await mutate(e,auth,payload);
   return respond({ok:true,...result});
  }
  return respond({error:"Маршрут не знайдено."},404);
 }catch(err){
  if((err.status||500)>=500)console.error("miniapp api",err);
  return respond({error:err.status?err.message:"Внутрішня помилка. Повтори спробу."},err.status||500);
 }
}
