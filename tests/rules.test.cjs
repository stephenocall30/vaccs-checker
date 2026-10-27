const {test}=require('node:test');
const assert=require('node:assert/strict');
const V=require('../dist/rules.js');
const today=new Date(2026,9,22);
const base={region:'England',who:'self',dob:'1990-01-01',pregnancy:'no',immuno:'no',conditions:['none'],work:['none'],student:'no'};
const result=(patch={},date=today)=>V.assess({...base,...patch},date);
const keys=r=>r.cards.map(c=>c.key);
test('birthdays use calendar date, not year subtraction',()=>{
 assert.equal(V.ageAt(new Date(1961,9,23),today),64);
 assert.equal(V.ageAt(new Date(1961,9,22),today),65);
 assert(!keys(result({dob:'1961-10-23'})).includes('flu'));
 assert(keys(result({dob:'1961-10-22'})).includes('flu'));
});
test('leap dates validated without rollover',()=>{assert(V.isValidDate(2024,2,29));assert(!V.isValidDate(2023,2,29));assert(!V.isValidDate(2026,4,31));});
test('immunosuppressed adult under 50 receives qualified shingles prompt',()=>{const card=result({immuno:'yes'}).cards.find(c=>c.key==='shingles');assert(card);assert.match(card.reasons[0],/severely/);});
test('children never receive calculated infant catch-up dates',()=>{for(const dob of ['2026-03-01','2026-09-01','2010-01-01']){const r=result({dob});assert.deepEqual(keys(r),['schedule']);assert(!JSON.stringify(r).includes('can still be caught up'));}});
test('child risk factors add professional review, not adult recommendations',()=>{assert.deepEqual(keys(result({dob:'2020-01-01',childRisk:['immuno']})),['schedule','childAssessment']);});
test('deduplication preserves multiple triggers',()=>{const cards=result({dob:'1950-01-01',conditions:['diabetes']}).cards;assert.equal(cards.filter(c=>c.key==='flu').length,1);assert(cards.find(c=>c.key==='flu').ruleIds.length>1);});
test('unknown immune status is not treated as a confirmed positive',()=>{const r=result({immuno:'notsure'});assert(!keys(r).includes('shingles'));assert(r.notes.some(n=>n.includes('unsure')));});
test('work alone never invents a COVID campaign entitlement',()=>{assert(!keys(result({work:['frontline']})).includes('covid'));});
test('student under 25 has MenACWY discussion prompt, older adult does not',()=>{assert(keys(result({dob:'2005-01-01',student:'yes'})).includes('menacwy'));assert(!keys(result({student:'yes'})).includes('menacwy'));});
test('not-pregnant state cannot use retained gestation',()=>{assert(!keys(result({weeks:28})).includes('rsvPreg'));});
test('shingles cohort boundary',()=>{assert(keys(result({dob:'1958-09-01'})).includes('shingles'));assert(!keys(result({dob:'1958-08-31'})).includes('shingles'));});
test('every rendered recommendation links to HTTPS guidance and has rule IDs',()=>{for(const patch of [{dob:'1950-01-01'},{pregnancy:'yes',weeks:28},{immuno:'yes'},{conditions:['kidney','liver']},{dob:'2020-01-01'}]){for(const c of result(patch).cards){assert.match(c.url,/^https:\/\//);assert(c.ruleIds.length);}}});
test('clinical approval is never fabricated',()=>{assert.equal(V.META.clinicalReviewedAt,null);assert.equal(V.metadataForRule('flu-65','flu').status,'awaiting-clinical-review');});
test('all monitored source identities unique',()=>{assert.equal(new Set(V.SOURCE_REGISTER.map(s=>s.id)).size,V.SOURCE_REGISTER.length);});
test('result copy uses prompt language, never programme-entitlement language',()=>{
 const banned=/\b(offered|eligible|entitled|qualify|qualifies|due|available|can get)\b/i;
 const profiles=[];
 for(const dob of ['1940-01-01','1950-01-01','1955-06-01','1958-09-01','1990-01-01','2005-01-01'])
  for(const extra of [{},{immuno:'yes'},{immuno:'notsure'},{conditions:['diabetes','kidney','liver','othercond']},{work:['frontline','lab']},{student:'yes'},{pregnancy:'yes',weeks:12},{pregnancy:'yes',weeks:24},{pregnancy:'yes',weeks:32}])
   profiles.push({dob,...extra});
 for(const patch of profiles){
  const r=result(patch);
  for(const c of r.cards)for(const reason of c.reasons)assert.doesNotMatch(reason,banned,reason);
  for(const n of r.notes)assert.doesNotMatch(n,banned,n);
 }
});
