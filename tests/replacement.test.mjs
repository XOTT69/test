import test from 'node:test';
import assert from 'node:assert/strict';
import { addMonths, filterInterval, dueFor, intervalDisplay, replacementPlan, calendarParts, replacementStatus, filterIcon } from '../src/index.js';

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
  assert.equal(intervalDisplay({...x,changed:'2026-10-19',due:'2027-04-19'}),'6 міс. 0 дн. (182 днів)');
});

test('replacements of legacy days-based filters keep original day cycle', () => {
  const x={interval_unit:'days',interval_value:0,days:90};
  const plan=replacementPlan(x,'2027-01-01');
  assert.equal(plan.due,'2027-04-01');
  assert.equal(plan.days,90);
  assert.equal(intervalDisplay({...x,changed:'2027-01-01',due:'2027-04-01'}),'3 міс. 0 дн. (90 днів)');
});

test('calendar duration is expressed in months AND days with exact day total', () => {
  assert.deepEqual(calendarParts('2026-01-31','2026-03-01'),{months:1,days:1});
  assert.deepEqual(calendarParts('2028-01-31','2028-02-29'),{months:1,days:0});
  assert.equal(intervalDisplay({changed:'2026-10-19',due:'2027-01-17',interval_unit:'days',days:90}),'2 міс. 29 дн. (90 днів)');
});

test('filters needing replacement are highlighted according to their status', () => {
  const now='2026-10-19';
  assert.equal(filterIcon('2026-10-18',now),'🔴');
  assert.equal(filterIcon('2026-10-19',now),'🔴');
  assert.equal(filterIcon('2026-10-20',now),'🟠');
  assert.equal(filterIcon('2026-10-26',now),'🟠');
  assert.equal(filterIcon('2026-10-27',now),'🟢');
  assert.match(replacementStatus('2026-10-18',now),/ПРОСТРОЧЕНО.*1 днів/);
  assert.match(replacementStatus('2026-10-19',now),/ЗАМІНИТИ СЬОГОДНІ/);
  assert.match(replacementStatus('2026-10-20',now),/0 міс. 1 дн. \(1 днів\)/);
  assert.match(replacementStatus('2027-04-19',now),/6 міс. 0 дн. \(182 днів\)/);
});
