import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import worker from "../src/index.js";
import {miniAppHtml} from "../src/miniapp-ui.js";

const demo={
 me:{id:123,role:"owner",name:"Тест"},household:{owner:123,name:"Моя оселя",members:[]},
 today:"2026-10-20",
 systems:[{id:1,title:"Домашній осмос",model:"Чиста вода",installed_at:"2026-01-01"}],
 filters:[{id:1,title:"Картридж тест",changed:"2026-07-20",due:"2026-11-20",days:123,interval_unit:"months",interval_value:4,osmosis_id:1}],
 medicines:[{id:2,name:"Тестовий препарат",form:"таблетки",quantity:5,unit:"шт",low_at:2,expires_at:"2027-04-01",location:"шафа",notes:"",archived:0}],
 tasks:[{id:3,title:"Прибрати кухню",due:"2026-10-22",days:7,done:0}],
 shopping:[{id:4,title:"Молоко",notes:"1 л",done:0}],
 expenses:[{id:5,title:"Витрата",amount:15000,changed:"2026-10-19"}],
 history:[{item_id:1,changed:"2026-07-20",amount:5000,title:"Картридж тест"}],
 stats:{spending:15000,expenses:1,replacements:1},
 settings:{enabled:true,warnings:true}
};

test("Worker serves Mini App without requiring Telegram for static page, not private API",async()=>{
 const page=await worker.fetch(new Request("https://oselya.example/app"),{});
 assert.equal(page.status,200);
 assert.match(page.headers.get("content-type"),/text\/html/);
 assert.match(await page.text(),/Telegram Mini App|Оселя/);
 const secret=await worker.fetch(new Request("https://oselya.example/api/bootstrap"),{BOT_TOKEN:"12345:test",DB:{}});
 assert.equal(secret.status,401);
});
test("Mini App mounts live bootstrap and switches every screen",async()=>{
 const raw=miniAppHtml();
 const scripts=[...raw.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
 assert.equal(scripts.length,1);
 const elems={app:{innerHTML:""},modal:{innerHTML:"",firstElementChild:null},toast:{innerHTML:""}};
 const listeners={};
 const doc={
  getElementById(id){return elems[id]||null},
  addEventListener(name,fn){listeners[name]=fn},
  createElement(){return {innerHTML:"",children:[]}}
 };
 const tg={initData:"mockInit",ready(){},expand(){},setHeaderColor(){},setBackgroundColor(){}};
 let apiCalls=0;
 const context={document:doc,
  window:{Telegram:{WebApp:tg},scrollTo(){}},
  navigator:{},console,Intl,Date,Math,Number,String,Object,Array,Promise,URL,URLSearchParams,setTimeout,clearTimeout,
  fetch:async(url,opts)=>{
   apiCalls++;
   assert.equal(url,"/api/bootstrap");
   assert.equal(opts.headers["x-telegram-init-data"],"mockInit");
   return {ok:true,json:async()=>structuredClone(demo)};
  }
 };
 vm.runInNewContext(scripts[0],context,{timeout:3000});
 await new Promise(resolve=>setTimeout(resolve,100));
 assert.ok(apiCalls>0);
 assert.match(elems.app.innerHTML,/Картридж тест/);
 assert.match(elems.app.innerHTML,/Оселя/);
 const select=act=>{
  const btn={dataset:{act},classList:{contains(){return false}},closest(){return null},type:"button"};
  const ev={target:{closest(){return btn}},preventDefault(){}};
  listeners.click(ev);
 };
 for(const [page,specific] of [
  ["osmosis","Домашній осмос"],
  ["medicines","Тестовий препарат"],
  ["tasks","Прибрати кухню"],
  ["shopping","Молоко"],
  ["expenses","Витрата"],
  ["stats","Статистика"],
  ["family","Наша сім’я"],
  ["settings","Налаштування"]
 ]){
  select("page:"+page);
  assert.match(elems.app.innerHTML,new RegExp(specific));
 }
});
