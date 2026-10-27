const {test}=require('node:test');
const assert=require('node:assert/strict');
const c=require('../dist/changes.js');
test('audience, status and multiword search combine',()=>{
 assert.deepEqual(c.filter({audience:'children',status:'confirmed',query:'  chickenpox  AUGUST '}).map(i=>i.id),['mmrv-catch-up']);
 assert.equal(c.filter({audience:'older',status:'started'}).length,0);
 assert.equal(c.filter({audience:'pregnancy'}).length,0);
});
test('sorting prioritises confirmed starts and does not mutate the register',()=>{
 const ids=c.items.map(i=>i.id);
 assert.equal(c.filter()[0].status,'confirmed');
 assert.equal(c.filter({sort:'announced'})[0].id,'covid-autumn-2027');
 assert.deepEqual(c.items.map(i=>i.id),ids);
});
test('programme start boundary warns without promoting status',()=>{
 const item=c.items[0];
 assert.equal(c.statusNote(item,new Date('2026-10-31T12:00:00Z')),item.caveat);
 assert.match(c.statusNote(item,new Date('2026-11-01T00:00:00Z')),/start date has passed/);
 assert.equal(item.status,'confirmed');
});
test('overdue recommendations stay recommendations',()=>{
 const item=c.items.find(i=>i.status==='advice');
 assert.equal(c.statusNote(item,new Date('2026-11-23T12:00:00Z')),item.caveat);
 assert.match(c.statusNote(item,new Date('2026-11-24T12:00:00Z')),/source recheck/);
 assert.equal(item.status,'advice');
 assert.equal(item.effectiveFrom,null);
});
test('entries have unique IDs, exact monitored sources and review history',()=>{
 const sources=require('../dist/sources.json').sources;
 assert.equal(new Set(c.items.map(i=>i.id)).size,c.items.length);
 for(const i of c.items){
  assert.ok(sources.some(s=>s.url===i.sourceUrl),i.id);
  assert.ok(i.sourceSection&&i.editorialHistory.length&&i.affects&&i.next);
  assert.ok(i.audiences.every(a=>c.audiences[a]));
  assert.ok(c.statuses[i.status]);
 }
 assert.equal(c.meta.clinicalReviewedAt,null);
});
