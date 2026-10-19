import test from "node:test";
import assert from "node:assert/strict";
import {DatabaseSync} from "node:sqlite";
import {readFileSync} from "node:fs";
import bot, {notificationPhase,taskStatus} from "../src/index.js";

function testDatabase(){
 const sqlite=new DatabaseSync(":memory:");
 for(const number of ["0001_init.sql","0002_osmosis_and_intervals.sql","0003_remove_tds.sql","0004_household_preferences.sql"]){
  sqlite.exec(readFileSync(new URL("../migrations/"+number,import.meta.url),"utf8"));
 }
 const wrap=(sql,args)=>({
  first:async()=>sqlite.prepare(sql).get(...args)??null,
  all:async()=>({results:sqlite.prepare(sql).all(...args)}),
  run:async()=>{
   const result=sqlite.prepare(sql).run(...args);
   return {success:true,meta:{changes:Number(result.changes),last_row_id:Number(result.lastInsertRowid)}};
  }
 });
 return {
  sqlite,
  D1:{
   prepare(sql){return {bind(...args){return wrap(sql,args)}}},
   async batch(queries){
    sqlite.exec("BEGIN");
    try{const output=[];for(const query of queries)output.push(await query.run());sqlite.exec("COMMIT");return output;}
    catch(error){sqlite.exec("ROLLBACK");throw error;}
   }
  }
 };
}
test("notification schedule includes 7 days, next day, due and overdue",()=>{
 assert.equal(notificationPhase("2026-10-26","2026-10-19"),"seven");
 assert.equal(notificationPhase("2026-10-20","2026-10-19"),"early");
 assert.equal(notificationPhase("2026-10-19","2026-10-19"),"due");
 assert.equal(notificationPhase("2026-10-16","2026-10-19"),"late");
 assert.equal(notificationPhase("2026-10-17","2026-10-19"),null);
 assert.match(taskStatus("2026-10-19","2026-10-19"),/Зробити сьогодні/);
});

test("family invite is one-time, shared ownership is isolated, tasks and settings work",async t=>{
 const db=testDatabase(),out=[];
 const previous=globalThis.fetch;
 t.after(()=>{globalThis.fetch=previous;db.sqlite.close()});
 globalThis.fetch=async (url,options={})=>{
  assert.ok(String(url).startsWith("https://api.telegram.org/bot"),"unexpected network request");
  const endpoint=String(url).split("/").pop();
  const input=options.body?JSON.parse(options.body):{};
  if(endpoint==="sendMessage")out.push(input);
  return new Response(JSON.stringify({ok:true,result:endpoint==="getMe"?{username:"Oselya_test_bot"}:true}),{status:200,headers:{"content-type":"application/json"}});
 };
 const env={DB:db.D1,BOT_TOKEN:"123:testtoken",WEBHOOK_SECRET:"test-webhook-secret",ALLOWED_USERS:"101"};
 let updateId=1;
 const event=async (uid,value,callback=false)=>{
  const update=callback?
   {update_id:updateId++,callback_query:{id:"callback_"+updateId,from:{id:uid,first_name:"Family"+uid},message:{chat:{id:uid,type:"private"}},data:value}}:
   {update_id:updateId++,message:{from:{id:uid,first_name:"Family"+uid},chat:{id:uid,type:"private"},text:value}};
  const res=await bot.fetch(new Request("https://example.workers.dev/telegram",{method:"POST",headers:{"X-Telegram-Bot-Api-Secret-Token":env.WEBHOOK_SECRET,"Content-Type":"application/json"},body:JSON.stringify(update)}),env);
  assert.equal(res.status,200,await res.text());
 };
 const messageFor=uid=>out.filter(x=>x.chat_id===uid).at(-1)?.text||"";
 await event(101,"/start");
 assert.match(messageFor(101),/Оселя/);
 await event(101,"add:osmosis",true);
 await event(101,"Домашня система");
 await event(101,"Aqua X");
 assert.equal(db.sqlite.prepare("SELECT COUNT(*) n FROM osmosis_systems WHERE uid=101").get().n,1);
 await event(101,"sysedit:1",true);
 await event(101,"sysfield:1:title",true);
 await event(101,"Нова назва");
 assert.equal(db.sqlite.prepare("SELECT title FROM osmosis_systems WHERE id=1").get().title,"Нова назва");
 await event(101,"sysfield:1:installed",true);
 await event(101,"15.10.2026");
 assert.equal(db.sqlite.prepare("SELECT installed_at FROM osmosis_systems WHERE id=1").get().installed_at,"2026-10-15");

 await event(303,"/start");
 assert.match(messageFor(303),/приватний/);
 await event(101,"family:invite",true);
 const invite=messageFor(101).match(/start=join_([a-f0-9]{36})/);
 assert.ok(invite,"owner receives one-time invite");
 await event(202,"/start join_"+invite[1]);
 assert.ok(out.some(m=>m.chat_id===202 && /приєднався/.test(m.text)),"join welcome message is sent");
 assert.equal(db.sqlite.prepare("SELECT owner_uid FROM family_members WHERE uid=202").get().owner_uid,101);
 await event(303,"/start join_"+invite[1]);
 assert.match(messageFor(303),/недійсне/);
 assert.equal(db.sqlite.prepare("SELECT COUNT(*) n FROM family_members").get().n,1);
 await event(202,"/osmosis");
 await event(202,"system:1",true);
 assert.match(messageFor(202),/Нова назва/);

 await event(202,"add:tasks",true);
 await event(202,"Купити лампу");
 await event(202,"20.11.2026");
 await event(202,"0");
 const task=db.sqlite.prepare("SELECT * FROM items WHERE kind='tasks'").get();
 assert.equal(task.uid,101,"household data belongs to original owner");
 assert.equal(task.title,"Купити лампу");
 await event(101,"/tasks");
 assert.match(messageFor(101),/Купити лампу/);
 await event(202,"task:"+task.id,true);
 await event(202,"taskedit:"+task.id+":title",true);
 await event(202,"Купити LED лампу");
 assert.equal(db.sqlite.prepare("SELECT title FROM items WHERE id=?").get(task.id).title,"Купити LED лампу");
 await event(202,"notify:enabled",true);
 assert.equal(db.sqlite.prepare("SELECT enabled FROM notification_settings WHERE uid=202").get().enabled,0);
 assert.equal(db.sqlite.prepare("SELECT COUNT(*) n FROM notification_settings WHERE uid=101").get().n,0);

 await event(101,"familyremove:202",true);
 await event(101,"familyconfirm:202",true);
 assert.equal(db.sqlite.prepare("SELECT COUNT(*) n FROM family_members WHERE uid=202").get().n,0);
 await event(202,"/start");
 assert.match(messageFor(202),/приватний/);
});
