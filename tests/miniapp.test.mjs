import test from "node:test";
import assert from "node:assert/strict";
import {createHmac} from "node:crypto";
import {miniAppHtml} from "../src/miniapp-ui.js";
import {verifyTelegramInitData,handleMiniAppApi} from "../src/miniapp-api.js";

test("Mini App ships complete Telegram-compatible HTML and executable client JS",()=>{
 const html=miniAppHtml();
 assert.match(html,/lang="uk"/);
 assert.match(html,/telegram-web-app\.js/);
 assert.match(html,/Оселя/);
 assert.match(html,/Аптечка/);
 assert.match(html,/x-telegram-init-data/);
 assert.match(html,/safe-area-inset-bottom/);
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
 assert.equal(scripts.length,1);
 assert.doesNotThrow(()=>new Function(scripts[0]));
});
function signed(token,user,now){
 const params={auth_date:String(now),query_id:"AAE123",user:JSON.stringify(user)};
 const data=Object.entries(params).sort((a,b)=>a[0].localeCompare(b[0],"en")).map(([k,v])=>k+"="+v).join("\n");
 const key=createHmac("sha256","WebAppData").update(token).digest();
 const hash=createHmac("sha256",key).update(data).digest("hex");
 return new URLSearchParams({...params,hash}).toString();
}
test("Mini App verifies Telegram HMAC and rejects tampering, stale sessions and bots",async()=>{
 const token="123456:ABC_test_token",now=1792450800,user={id:199099,first_name:"Test User"};
 const init=signed(token,user,now);
 assert.deepEqual(await verifyTelegramInitData(init,token,now),{id:199099,first_name:"Test User"});
 assert.equal(await verifyTelegramInitData(init.replace("Test+User","Other+User"),token,now),null);
 assert.equal(await verifyTelegramInitData(init,token,now+86401),null);
 assert.equal(await verifyTelegramInitData(init,token,now-61),null);
 assert.equal(await verifyTelegramInitData(signed(token,{id:111,is_bot:true},now),token,now),null);
 assert.equal(await verifyTelegramInitData(init+"&user=%7B%7D",token,now),null);
});
test("Mini App private API rejects missing Telegram credentials before D1 access",async()=>{
 const response=await handleMiniAppApi(new Request("https://example.workers.dev/api/bootstrap"),{BOT_TOKEN:"123:token",DB:{}});
 assert.equal(response.status,401);
 assert.match((await response.json()).error,/Telegram/);
});
