import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import { miniAppHtml } from "../src/miniapp-ui.js";

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"]
});
const title = "Супердовга назва для перевірки перенесення тексту «Оселя» 🌿 ".repeat(2).slice(0,120);
const today = "2026-10-20";
const fixture = {
  me:{id:123,role:"owner",name:"Власник"},
  household:{owner:123,name:"Моя оселя",members:[{uid:300,name:title.slice(0,80)}]},
  today,
  systems:[{id:1,title,model:title,installed_at:"2026-01-01"}],
  filters:[
   {id:1,title,changed:"2026-01-01",due:"2026-10-19",days:291,interval_unit:"months",interval_value:9,osmosis_id:1},
   {id:2,title:"Постфільтр",changed:"2026-10-01",due:"2026-10-22",days:21,interval_unit:"days",interval_value:21,osmosis_id:1}
  ],
  medicines:[
   {id:1,name:title,form:title.slice(0,80),quantity:2,unit:"упаковок",expires_at:"2026-10-20",low_at:3,location:"Довга назва шафи",notes:"",archived:0},
   {id:2,name:"Тестовий препарат",form:"таблетки",quantity:20,unit:"шт",expires_at:"2027-12-31",low_at:2,location:"",notes:"",archived:0},
   {id:3,name:"Старий",form:"",quantity:0,unit:"шт",expires_at:null,low_at:2,location:"",notes:"",archived:1}
  ],
  tasks:[{id:1,title,due:"2026-10-21",done:0,days:30},{id:2,title:"Виконане",due:"2026-10-17",done:1,days:0}],
  shopping:[{id:1,title,notes:title,done:0}],
  expenses:[{id:1,title,amount:12345678,changed:"2026-10-20"}],
  history:[{item_id:1,changed:"2026-10-17",title,amount:15500}],
  stats:{spending:123456789,expenses:15,replacements:19},
  settings:{enabled:true,warnings:true}
};
const fakeSdk = '<script>window.Telegram={WebApp:{initData:"verified-for-test",ready(){},expand(){},setHeaderColor(){},setBackgroundColor(){}}};window.fetch=async function(url){if(url==="/api/bootstrap")return {ok:true,json:async()=>('+JSON.stringify(fixture)+')};if(url==="/api/action")return {ok:true,json:async()=>({ok:true})};throw Error("Unexpected request "+url);};</script>';
const html = miniAppHtml().replace('<script src="https://telegram.org/js/telegram-web-app.js"></script>',fakeSdk);

function geometryScript(){
 const viewport=document.documentElement.clientWidth;
 const offenders=[...document.querySelectorAll("#app *, #modal *")].filter(node=>{
  const c=getComputedStyle(node);
  if(c.display==="none"||c.visibility==="hidden")return false;
  const b=node.getBoundingClientRect();
  return b.width>0&&(b.left < -2 || b.right > viewport+2);
 }).slice(0,10).map(el=>({tag:el.tagName,cls:String(el.className).slice(0,80),text:(el.innerText||"").slice(0,60),left:Math.round(el.getBoundingClientRect().left),right:Math.round(el.getBoundingClientRect().right)}));
 return {viewport,scrollWidth:document.documentElement.scrollWidth,offenders};
}
try{
 for(const width of [320,360,375,390,430,540]){
  const context=await browser.newContext({viewport:{width,height:810},deviceScaleFactor:3,isMobile:true,hasTouch:true});
  const page=await context.newPage();
  const errors=[];page.on("pageerror",err=>errors.push(err.message));
  await page.setContent(html,{waitUntil:"load"});
  await page.waitForSelector('[data-act="page:osmosis"]',{timeout:7000});
  async function check(name){
   const layout=await page.evaluate(geometryScript);
   assert.ok(layout.scrollWidth<=layout.viewport+2,width+"px "+name+": scrollWidth "+JSON.stringify(layout));
   assert.deepEqual(layout.offenders,[],width+"px "+name+": overflowing elements: "+JSON.stringify(layout));
  }
  await check("home");
  async function trigger(act){
   const clicked=await page.evaluate(act=>{
    let el=document.querySelector('[data-act="'+act+'"]');
    if(!el&&act.startsWith("page:")&&act!=="page:more"){
     document.querySelector('[data-act="page:more"]')?.click();
     el=document.querySelector('[data-act="'+act+'"]');
    }
    if(!el)return false;
    el.click();return true;
   },act);
   assert.ok(clicked,width+"px action "+act+" missing");
   await page.waitForTimeout(40);
  }
  for(const [action,name] of [
   ["page:osmosis","osmosis"],["page:medicines","medicines"],
   ["page:tasks","tasks"],["page:shopping","shopping"],
   ["page:expenses","expenses"],["page:stats","stats"],
   ["page:family","family"],["page:settings","settings"],
   ["page:more","more"],["page:home","home"]
  ]){
   await trigger(action);await check(name);
  }
  for(const [pageName,action] of [
   ["osmosis","new:system"],["osmosis","new:filter"],
   ["medicines","new:medicine"],["tasks","new:task"],
   ["shopping","new:shopping"],["expenses","new:expense"]
  ]){
   await trigger("page:"+pageName);
   await trigger(action);await check(action);
   await trigger("close");
  }
  await trigger("page:osmosis");
  await trigger("open:filter:1");await check("filter card");await trigger("close");
  await trigger("page:medicines");await trigger("open:medicine:1");await check("medicine card");await trigger("close");
  assert.deepEqual(errors,[],width+"px runtime JavaScript errors: "+errors.join("; "));
  console.log("PASS viewport "+width+"px: 10 screens, 6 forms and detail cards");
  await context.close();
 }
}finally{await browser.close();}
