import test from "node:test";
import assert from "node:assert/strict";
import {medicineState,medicineExpiryPhase,medicineEntry,medicineExpiryDate} from "../src/index.js";

test("expiry accepts exact calendar date and month/year as last day of month",()=>{
 assert.equal(medicineExpiryDate("15.12.2027"),"2027-12-15");
 assert.equal(medicineExpiryDate("12.2027"),"2027-12-31");
 assert.equal(medicineExpiryDate("02.2028"),"2028-02-29");
 assert.equal(medicineExpiryDate("02.2027"),"2027-02-28");
 assert.equal(medicineExpiryDate("13.2027"),null);
 assert.equal(medicineExpiryDate("31.02.2027"),null);
 assert.equal(medicineEntry("-","expires_at"),null);
});
test("expiry and low stock status is deterministic",()=>{
 const now="2026-10-19",base={quantity:10,low_at:2,expires_at:"2027-05-01",unit:"шт"};
 assert.equal(medicineState(base,now).icon,"🟢");
 assert.equal(medicineState({...base,expires_at:"2026-11-18"},now).icon,"🟠");
 assert.equal(medicineState({...base,expires_at:"2026-10-18"},now).icon,"🔴");
 assert.equal(medicineState({...base,expires_at:null},now).icon,"⚪");
 assert.equal(medicineState({...base,quantity:2},now).scarce,true);
 assert.equal(medicineState({...base,quantity:0},now).icon,"🔴");
 assert.equal(medicineState({...base,quantity:3},now).scarce,false);
});
test("expiry reminders occur at 30, 7, 1, 0 and 1 day after expiry",()=>{
 const now="2026-10-19";
 assert.equal(medicineExpiryPhase("2026-11-18",now),"expiry30");
 assert.equal(medicineExpiryPhase("2026-10-26",now),"expiry7");
 assert.equal(medicineExpiryPhase("2026-10-20",now),"expiry1");
 assert.equal(medicineExpiryPhase("2026-10-19",now),"expiry0");
 assert.equal(medicineExpiryPhase("2026-10-18",now),"expired1");
 assert.equal(medicineExpiryPhase("2026-10-17",now),null);
});
test("stock, label and free-form input validation",()=>{
 assert.equal(medicineEntry("10","quantity"),10);
 assert.equal(medicineEntry("0","quantity"),0);
 assert.equal(medicineEntry("-1","quantity"),null);
 assert.equal(medicineEntry("100000","quantity"),null);
 assert.equal(medicineEntry("5","low_at"),5);
 assert.equal(medicineEntry("-","location"),"");
 assert.equal(medicineEntry("-","unit"),null);
 assert.equal(medicineEntry("краплі","unit"),"краплі");
});