import test from 'node:test';
import assert from 'node:assert/strict';
import { addMonths, filterInterval, dueFor, intervalDisplay, replacementPlan } from '../src/index.js';

test('calendar months clamp at end of shorter months', () => {
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28');
  assert.equal(addMonths('2028-01-31', 1), '2028-02-29');
  assert.equal(addMonths('2026-08-31', 6), '2027-02-28');
  assert.equal(addMonths('2026-10-19', 6), '2027-04-19');
  assert.equal(dueFor('2026-10-19','months',12),'2027-10-19');
});

test('user can set days, months, or an exact final date', () => {
  const start='2026-10-19';
  assert.deepEqual(filterInterval('90 днів', start), {unit:'days',value:90,due:'2027-01-17'});
  assert.deepEqual(filterInterval('6 місяців', start), {unit:'months',value:6,due:'2027-04-19'});
  assert.deepEqual(filterInterval('6',start,'months'), {unit:'months',value:6,due:'2027-04-19'});
  assert.deepEqual(filterInterval('31.12.2026',start), {unit:'days',value:73,due:'2026-12-31'});
  assert.equal(filterInterval('19.10.2026',start),null);
  assert.equal(filterInterval('31.02.2027',start),null);
});

test('replacement automatically keeps the existing monthly schedule', () => {
  const x={interval_unit:'months',interval_value:6,days:182};
  const plan=replacementPlan(x,'2027-04-15');
  assert.equal(plan.due,'2027-10-15');
  assert.equal(plan.unit,'months');
  assert.equal(plan.value,6);
  assert.equal(intervalDisplay(x),'6 міс.');
});

test('replacements of legacy days-based filters keep original day cycle', () => {
  const x={interval_unit:'days',interval_value:0,days:90};
  const plan=replacementPlan(x,'2027-01-01');
  assert.equal(plan.due,'2027-04-01');
  assert.equal(plan.days,90);
  assert.equal(intervalDisplay(x),'90 днів');
});
