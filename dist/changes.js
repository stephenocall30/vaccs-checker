/* Selected England programme updates. Source-checked, not clinically approved.
   Status is an editorial record, never inferred from the calendar alone. */
const VaccsChanges = (() => {
 const meta={version:'1.0',checkedOn:'2026-10-23',reviewDue:'2026-11-23',jurisdiction:'England',clinicalReviewedAt:null};
 const audiences={all:'Everyone',children:'Children & parents',older:'Older adults',immune:'Weakened immunity',pregnancy:'Pregnancy'};
 const statuses={all:'All statuses',started:'Introduced',confirmed:'Start confirmed',advice:'Recommendation'};
 const items=[
  {
   id:'mmrv-catch-up',title:'MMRV catch-up starts in November',vaccine:'MMRV',audiences:['children'],status:'confirmed',
   announcedOn:'2025-10-31',effectiveFrom:'2026-11-01',effectiveUntil:'2028-03-31',timing:'1 November 2026 to 31 March 2028',
   summary:'A selective chickenpox catch-up offer is scheduled for children born between January 2020 and August 2022.',
   affects:'Children born from 1 January 2020 to 31 August 2022. Previous chickenpox infection and vaccination history affect the offer.',
   before:'These children were outside the new routine infant MMRV schedule.',
   after:'A separate, single-dose MMRV catch-up programme is planned for this birth cohort.',
   next:'Look out for a GP invitation. Tell the practice about previous chickenpox or varicella doses so they can confirm the offer.',
   caveat:'This is a confirmed programme start date, not a statement that appointments are already available.',
   sourceTitle:'UKHSA / NHS England · MMRV programme letter',
   sourceUrl:'https://www.gov.uk/government/publications/introduction-of-a-routine-varicella-mmrv-vaccination-programme/introduction-of-a-routine-varicella-mmrv-vaccination-programme-for-children-at-one-year-and-at-18-months',
   sourceSection:'Section 2: MMRV selective catch-up programme; Table 1',ruleLinks:['child-schedule'],
   editorialHistory:[{date:'2026-10-23',text:'Added from the published programme letter. This information has not been clinically reviewed.'}]
  },
  {
   id:'covid-autumn-2027',title:'JCVI publishes advice for autumn 2027',vaccine:'COVID-19',audiences:['older','immune'],status:'advice',
   announcedOn:'2026-07-16',effectiveFrom:null,effectiveUntil:null,timing:'Autumn 2027 · recommended season',
   summary:'The recommended age-based offer would start at 80. Care-home residents and immunosuppressed people are also included in the advice.',
   affects:'Adults aged 80 and over, residents of care homes for older adults, and immunosuppressed people aged 6 months and over, as defined in the guidance.',
   before:'The preceding advice used age 75 for the age-based offer.',
   after:'JCVI recommends raising that age to 80 for autumn 2027. This entry records advice, not a confirmed booking programme.',
   next:'Use current-season guidance for decisions now. Check the official programme announcement before making plans for autumn 2027.',
   caveat:'An advisory statement is not evidence that a future programme has been implemented. No opening date is recorded here.',
   sourceTitle:'JCVI · COVID-19 vaccination in autumn 2027',
   sourceUrl:'https://www.gov.uk/government/publications/covid-19-vaccination-in-autumn-2027-jcvi-advice/jcvi-statement-on-covid-19-vaccination-in-autumn-2027',
   sourceSection:'Advice on COVID-19 vaccination in autumn 2027; Eligible cohorts',ruleLinks:['covid-75','immuno-covid','condition-carehome'],
   editorialHistory:[{date:'2026-10-23',text:'Recorded as a recommendation only. Current checker eligibility has not been changed.'}]
  },
  {
   id:'routine-mmrv',title:'Chickenpox vaccination joins the childhood schedule',vaccine:'MMRV',audiences:['children'],status:'started',
   announcedOn:'2025-10-31',effectiveFrom:'2026-01-01',effectiveUntil:null,timing:'From 1 January 2026',
   summary:'The combined MMRV vaccine adds chickenpox protection to the routine childhood programme.',
   affects:'Children in the eligible birth cohorts. The timing and number of MMRV doses depend on date of birth.',
   before:'Routine childhood MMR vaccination covered measles, mumps and rubella.',
   after:'MMRV adds varicella (chickenpox). Transition arrangements differ by birth cohort.',
   next:'Check the official schedule with the GP practice. Use the child’s date of birth and vaccination record, rather than an older sibling’s schedule.',
   caveat:'The introduction does not mean every child needs an extra dose now.',
   sourceTitle:'UKHSA / NHS England · MMRV programme letter',
   sourceUrl:'https://www.gov.uk/government/publications/introduction-of-a-routine-varicella-mmrv-vaccination-programme/introduction-of-a-routine-varicella-mmrv-vaccination-programme-for-children-at-one-year-and-at-18-months',
   sourceSection:'Section 1: Routine MMRV programme; Table 1',ruleLinks:['child-schedule'],
   editorialHistory:[{date:'2026-10-23',text:'Added a summary of the routine introduction. Dose calculations remain outside the checker.'}]
  },
  {
   id:'eighteen-month-appointment',title:'A new vaccination appointment at 18 months',vaccine:'Childhood schedule',audiences:['children'],status:'started',
   announcedOn:'2025-04-30',effectiveFrom:'2026-01-01',effectiveUntil:null,timing:'From 1 January 2026',
   summary:'An additional routine appointment includes a fourth 6-in-1 dose for the eligible birth cohort.',
   affects:'Children born on or after 1 July 2024.',
   before:'This cohort did not have a routine 18-month appointment for a fourth 6-in-1 dose under the earlier schedule.',
   after:'The new appointment adds a fourth 6-in-1 dose. MMRV arrangements are covered by the later programme guidance.',
   next:'Check the invitation with the GP practice. If a dose was missed, ask the vaccination team to review the full record.',
   caveat:'This is a programme summary, not an individual catch-up plan.',
   sourceTitle:'UKHSA / NHS England · Childhood schedule changes',
   sourceUrl:'https://www.gov.uk/government/publications/changes-to-the-routine-childhood-schedule-letter/changes-to-the-routine-childhood-vaccination-schedule-from-1-july-2025-and-1-january-2026-letter',
   sourceSection:'Table 2 and section 4: new 18-month appointment',ruleLinks:['child-schedule'],
   editorialHistory:[{date:'2026-10-23',text:'Added the 18-month appointment change, with a link to the separate MMRV update.'}]
  },
  {
   id:'shingles-immunosuppression',title:'Shingles vaccination extended to more adults',vaccine:'Shingles',audiences:['immune'],status:'started',
   announcedOn:'2025-07-22',effectiveFrom:'2025-09-01',effectiveUntil:null,timing:'From 1 September 2025',
   summary:'The offer for people with severe immunosuppression now starts at age 18 rather than 50.',
   affects:'Adults aged 18 and over who meet the clinical definition of severe immunosuppression.',
   before:'The severe-immunosuppression offer started at age 50.',
   after:'The age threshold is 18. A clinical assessment is still needed; a weakened immune system does not automatically meet the definition.',
   next:'Ask the GP practice or treating specialist whether the criteria apply and check any previous shingles doses.',
   caveat:'The routine age-based programme for other adults follows separate criteria.',
   sourceTitle:'UKHSA · Shingles programme guidance',
   sourceUrl:'https://www.gov.uk/government/publications/shingles-vaccination-guidance-for-healthcare-professionals/shingles-immunisation-programme-information-for-healthcare-practitioners',
   sourceSection:'Eligible cohorts: Severely immunosuppressed individuals',ruleLinks:['shingles-immuno'],
   editorialHistory:[{date:'2026-10-23',text:'Added the expanded cohort. The checker retains a qualified prompt to seek clinical confirmation.'}]
  }
 ];
 function filter({audience='all',status='all',query='',sort='relevance'}={}){
   const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
   return items.filter(i=>(audience==='all'||i.audiences.includes(audience))&&(status==='all'||i.status===status)&&words.every(w=>[i.title,i.vaccine,i.summary,i.affects,...i.audiences.map(a=>audiences[a])].join(' ').toLowerCase().includes(w)))
    .sort((a,b)=>sort==='announced'?b.announcedOn.localeCompare(a.announcedOn):(['confirmed','advice','started'].indexOf(a.status)-['confirmed','advice','started'].indexOf(b.status))||(b.effectiveFrom||b.announcedOn).localeCompare(a.effectiveFrom||a.announcedOn));
 }
 function statusNote(item,today=new Date()){
   const iso=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).format(today);
   if(item.status==='confirmed' && item.effectiveFrom && iso>=item.effectiveFrom)return 'The scheduled start date has passed. Check the source for the current programme position; this entry has not been promoted to “Introduced” automatically.';
   if(iso>meta.reviewDue)return 'This entry is due a source recheck. Use the official source to confirm the current position.';
   return item.caveat;
 }
 return {meta,items,audiences,statuses,filter,statusNote};
})();
if(typeof module!=='undefined') module.exports=VaccsChanges;
