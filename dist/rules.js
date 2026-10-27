/* Derived from stephenocall30/vaccs-checker, reviewed snapshot 382d350.
   Prototype only: source links are not clinical approval. */
const Vaccs = (()=>{

"use strict";

/* ==========================================================================
   1. CONTENT LAYER
   Vaccine catalogue, delivery routes and seasonal windows.
   Everything a content designer or clinical reviewer would edit lives here.
   Nothing below this section needs changing to update content.
   ========================================================================== */

const ROUTES = {
  gp:        {label:"Where to get it", text:"Book through a GP surgery."},
  gpPharm:   {label:"Where to get it", text:"Check the current NHS page for GP, pharmacy and booking options."},
  pharmacy:  {label:"Where to get it", text:"Check with a local pharmacy about availability and appointments."},
  maternity: {label:"Where to get it", text:"Usually offered at a routine maternity appointment. Ask a midwife."},
  school:    {label:"Where to get it", text:"Normally given by the school immunisation team. If it was missed, a GP surgery can catch up."},
  childClinic:{label:"Where to get it", text:"Given at routine baby and child appointments, at a GP surgery or child health clinic."},
  occHealth: {label:"Where to get it", text:"Vaccines needed for work are arranged and paid for by the employer through occupational health. Ask there before a GP surgery."},
  specialist:{label:"Where to get it", text:"Arranged by a GP surgery, sometimes with a referral to a specialist clinic."}
};

/* Seasonal windows. months are 0-indexed (0 = January). */
const SEASONS = {
  allYear:  {months:[0,1,2,3,4,5,6,7,8,9,10,11], name:"all year"},
  flu:      {months:[9,10,11,0,1,2], name:"flu season", opensText:"usually early October"},
  childFlu: {months:[8,9,10,11], name:"the autumn school programme", opensText:"usually early September"},
  covid:    {months:[3,4,5,9,10,11], name:"spring and autumn campaigns", opensText:"spring and autumn"},
  rsvAdult: {months:[0,1,2,3,4,5,6,7,8,9,10,11], name:"all year"}
};

const V = {
  flu:        {name:"Flu vaccine", url:"https://www.nhs.uk/vaccinations/flu-vaccine/", when:"Every year", season:"flu", route:"gpPharm"},
  pneumo:     {name:"Pneumococcal vaccine", url:"https://www.nhs.uk/vaccinations/pneumococcal-vaccine/", when:"1 dose for most adults. Some people at higher risk need extra or regular doses", season:"allYear", route:"gp", oneOff:true},
  shingles:   {name:"Shingles vaccine", url:"https://www.nhs.uk/vaccinations/shingles-vaccine/", when:"2 doses, 6 to 12 months apart", season:"allYear", route:"gp", oneOff:true},
  rsv:        {name:"RSV vaccine", url:"https://www.nhs.uk/vaccinations/rsv-vaccine/", when:"One-off dose", season:"rsvAdult", route:"gp", oneOff:true},
  covid:      {name:"COVID-19 vaccine", url:"https://www.nhs.uk/vaccinations/covid-19-vaccine/", when:"Offered in seasonal campaigns", season:"covid", route:"gpPharm"},
  fluPreg:    {name:"Flu vaccine in pregnancy", url:"https://www.nhs.uk/pregnancy/keeping-well/flu-jab/", when:"During flu season, at any stage of pregnancy", season:"flu", route:"maternity"},
  wcough:     {name:"Whooping cough vaccine", url:"https://www.nhs.uk/pregnancy/keeping-well/whooping-cough-vaccination/", when:"From about 20 weeks of pregnancy", season:"allYear", route:"maternity"},
  rsvPreg:    {name:"RSV vaccine in pregnancy", url:"https://www.nhs.uk/vaccinations/rsv-vaccine/", when:"From 28 weeks of pregnancy", season:"allYear", route:"maternity"},
  menacwy:    {name:"MenACWY vaccine", url:"https://www.nhs.uk/vaccinations/menacwy-vaccine/", when:"One-off dose. Catch-up available up to the 25th birthday", season:"allYear", route:"gp", oneOff:true},
  menb:       {name:"MenB vaccine", url:"https://www.nhs.uk/vaccinations/menb-vaccine-for-children/", when:"For new students aged 24 or under", season:"allYear", route:"gp", oneOff:true},
  mmr:        {name:"MMR vaccine", url:"https://www.nhs.uk/vaccinations/mmr-vaccine/", when:"2 doses. Catch-up at any age", season:"allYear", route:"gp", oneOff:true},
  hpv:        {name:"HPV vaccine", url:"https://www.nhs.uk/vaccinations/hpv-vaccine/", when:"1 dose under 25. More doses if older or immunosuppressed", season:"allYear", route:"specialist", oneOff:true},
  hepb:       {name:"Hepatitis B vaccine", url:"https://www.nhs.uk/vaccinations/hepatitis-b-vaccine/", when:"At least 3 doses over a few months", season:"allYear", route:"gp", oneOff:true},
  hepa:       {name:"Hepatitis A vaccine", url:"https://www.nhs.uk/conditions/hepatitis-a/", when:"1 dose, plus a booster 6 to 12 months later", season:"allYear", route:"gp", oneOff:true},
  bcg:        {name:"BCG (tuberculosis) vaccine", url:"https://www.nhs.uk/vaccinations/bcg-vaccine-for-tuberculosis-tb/", when:"Usually around 4 weeks old", season:"allYear", route:"specialist", oneOff:true},
  sixin1:     {name:"6-in-1 vaccine", url:"https://www.nhs.uk/vaccinations/6-in-1-vaccine/", when:"8, 12 and 16 weeks old", season:"allYear", route:"childClinic"},
  rota:       {name:"Rotavirus vaccine", url:"https://www.nhs.uk/vaccinations/rotavirus-vaccine/", when:"8 and 12 weeks old", season:"allYear", route:"childClinic"},
  mmrv:       {name:"MMRV vaccine", url:"https://www.nhs.uk/vaccinations/mmrv-vaccine/", when:"From 1 year old", season:"allYear", route:"childClinic"},
  fourin1:    {name:"4-in-1 pre-school booster", url:"https://www.nhs.uk/vaccinations/4-in-1-preschool-booster-vaccine/", when:"3 years 4 months old", season:"allYear", route:"childClinic"},
  childflu:   {name:"Children's flu vaccine", url:"https://www.nhs.uk/vaccinations/child-flu-vaccine/", when:"Every year from age 2 to the end of Year 11", season:"childFlu", route:"school"},
  tdipv:      {name:"Td/IPV teenage booster", url:"https://www.nhs.uk/vaccinations/td-ipv-vaccine-3-in-1-teenage-booster/", when:"School Year 9", season:"allYear", route:"school", oneOff:true},
  pneumoBaby: {name:"Pneumococcal vaccine (infant)", url:"https://www.nhs.uk/vaccinations/pneumococcal-vaccine/", when:"16 weeks and 1 year old", season:"allYear", route:"childClinic"},
  menbBaby:   {name:"MenB vaccine (infant)", url:"https://www.nhs.uk/vaccinations/menb-vaccine-for-children/", when:"8 weeks, 12 weeks and 1 year old", season:"allYear", route:"childClinic"}
};

const CONDITION_OPTS = [
  {value:"spleen", label:"Problems with the spleen", hint:"For example sickle cell disease, coeliac disease, or the spleen removed"},
  {value:"cochlear", label:"Cochlear implants"},
  {value:"respheart", label:"A long-term breathing or heart condition", hint:"For example asthma needing regular treatment, COPD or heart failure"},
  {value:"neuro", label:"A long-term neurological condition or learning disability", hint:"For example Parkinson's disease, cerebral palsy or a learning disability"},
  {value:"diabetes", label:"Diabetes"},
  {value:"kidney", label:"Long-term kidney disease"},
  {value:"liver", label:"A long-term liver condition"},
  {value:"haemophilia", label:"Haemophilia or a clotting disorder"},
  {value:"complement", label:"A complement disorder", hint:"Or treatment with a complement inhibitor"},
  {value:"carer", label:"Being an unpaid carer", hint:"For example the main carer for an older or disabled person"},
  {value:"household", label:"Living with someone who has a weakened immune system"},
  {value:"carehome", label:"Living in a care home for older adults"},
  {value:"othercond", label:"Another long-term condition, or not sure", hint:"Choose this if something applies but is not listed, or you are not certain"}
];

const CONDITION_RULES = {
  spleen:     {vaccines:["menacwy","menb","pneumo","flu"], reason:"problems with the spleen"},
  cochlear:   {vaccines:["pneumo"], reason:"cochlear implants"},
  respheart:  {vaccines:["pneumo","flu"], reason:"a long-term breathing or heart condition"},
  neuro:      {vaccines:["pneumo","flu"], reason:"a long-term neurological condition or learning disability"},
  diabetes:   {vaccines:["pneumo","flu"], reason:"diabetes"},
  kidney:     {vaccines:["pneumo","flu","hepb"], reason:"long-term kidney disease"},
  liver:      {vaccines:["pneumo","flu","hepa","hepb"], reason:"a long-term liver condition"},
  haemophilia:{vaccines:["hepa","hepb"], reason:"haemophilia or a clotting disorder"},
  complement: {vaccines:["menacwy","menb","pneumo","flu"], reason:"a complement disorder or complement inhibitor treatment"},
  carer:      {vaccines:["flu"], reason:"being an unpaid carer"},
  household:  {vaccines:["flu"], reason:"living with someone who has a weakened immune system"},
  carehome:   {vaccines:["covid","flu"], reason:"living in a care home for older adults"}
};

/* Cohort boundaries pulled out so they can be updated without touching logic. */
const COHORTS = {
  shinglesRollingFrom: "2023-09-01",  // turned 65 on or after this date
  mmrvFrom:            "2025-01-01",  // born on or after this date
  sixInOneFourthFrom:  "2024-07-01",  // 4th dose for babies born on or after
  hepBInfantTwelveTo:  "2024-06-30"   // 12-month dose for babies born on or before
};

/* ==========================================================================
   2. DATE AND COHORT HELPERS
   The reason the tool asks for a date of birth rather than an age.
   ========================================================================== */

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function toDate(iso){ const [y,m,d] = iso.split("-").map(Number); return new Date(y, m-1, d); }
function fmtDate(d){ return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear(); }
function isValidDate(y,m,d){
  if (!Number.isInteger(y)||!Number.isInteger(m)||!Number.isInteger(d)) return false;
  if (m<1||m>12||d<1||d>31||y<1900) return false;
  const dt = new Date(y, m-1, d);
  return dt.getFullYear()===y && dt.getMonth()===m-1 && dt.getDate()===d;
}
function ageAt(dob, ref){
  let a = ref.getFullYear() - dob.getFullYear();
  const before = ref.getMonth() < dob.getMonth() ||
    (ref.getMonth() === dob.getMonth() && ref.getDate() < dob.getDate());
  return before ? a-1 : a;
}
function monthsBetween(dob, ref){
  let m = (ref.getFullYear()-dob.getFullYear())*12 + (ref.getMonth()-dob.getMonth());
  if (ref.getDate() < dob.getDate()) m--;
  return m;
}
function weeksBetween(dob, ref){ return Math.floor((ref - dob) / 604800000); }
function addWeeks(d, w){ const n = new Date(d); n.setDate(n.getDate() + w*7); return n; }
function addMonths(d, mo){ const n = new Date(d); n.setMonth(n.getMonth() + mo); return n; }

/* Academic year in England runs 1 September to 31 August.
   Year group is determined by age on 31 August before the year starts.
   Reception = age 4, so Year N = age N+4. */
function academicStartYear(today){
  return today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1;
}
function schoolYearGroup(dob, today){
  const ref = new Date(academicStartYear(today), 7, 31);
  return ageAt(dob, ref) - 4;
}
function schoolYearLabel(yg){
  if (yg < 0) return "not yet at school";
  if (yg === 0) return "Reception";
  if (yg > 13) return "left school";
  return "Year " + yg;
}
function bornOnOrAfter(dob, iso){ return dob >= toDate(iso); }
function bornOnOrBefore(dob, iso){ return dob <= toDate(iso); }
function turned65OnOrAfter(dob, iso){
  const t65 = new Date(dob.getFullYear()+65, dob.getMonth(), dob.getDate());
  return t65 >= toDate(iso);
}

/* Seasonal state for a vaccine, given today's date. */
function seasonState(seasonKey, today){
  const s = SEASONS[seasonKey] || SEASONS.allYear;
  const m = today.getMonth();
  if (s.months.length === 12) return {open:true, always:true, label:"Available all year"};
  if (s.months.includes(m)) return {open:true, always:false, label:"Available now, during " + s.name};
  for (let i=1; i<=12; i++){
    const nm = (m+i) % 12;
    if (s.months.includes(nm)) return {open:false, always:false, label:"Opens in " + MONTHS[nm], detail:"Offered during " + s.name + ", " + s.opensText + "."};
  }
  return {open:true, always:true, label:"Available all year"};
}

/* ==========================================================================
   3. RULES LAYER
   Each rule is data: a condition over the derived context, a vaccine, and a
   reason. Adding or retiring a rule means editing this array only.
   ctx.p provides pronouns so one rule serves self, another adult, or a child.
   ========================================================================== */

const RULES = [
  /* --- Routine adult, by age --- */
  {id:"flu-65",      v:"flu",      if:c => c.age>=65, why:c => c.p.Subj+" "+c.p.are+" 65 or over. Ask about the annual flu vaccine."},
  {id:"pneumo-65",   v:"pneumo",   if:c => c.age>=65, why:c => c.p.Subj+" "+c.p.are+" 65 or over. Ask whether a pneumococcal vaccine applies. Previous doses and medical history need checking."},
  {id:"rsv-75",      v:"rsv",      if:c => c.age>=75, why:c => c.p.Subj+" "+c.p.are+" 75 or over. Ask the GP surgery to confirm the current RSV programme criteria."},
  {id:"covid-75",    v:"covid",    if:c => c.age>=75, why:c => c.p.Subj+" "+c.p.are+" 75 or over. Ask about COVID-19 vaccination."},

  /* --- Shingles: the cohort rule the old version could not answer --- */
  {id:"shingles-70s", v:"shingles", if:c => c.age>=70 && c.age<=79,
   why:c => c.p.Subj+" "+c.p.are+" aged 70 to 79. Ask whether shingles vaccination applies."},
  {id:"shingles-roll", v:"shingles",
   if:c => c.age>=65 && c.age<70 && turned65OnOrAfter(c.dob, COHORTS.shinglesRollingFrom),
   why:c => "Shingles vaccination criteria depend on date of birth. Ask the GP surgery whether they apply."},
  {id:"shingles-immuno", v:"shingles",
   if:c => c.immuno==="yes" && c.age>=18,
   why:c => c.p.Subj+" "+c.p.have+" a weakened immune system. From age 18, shingles vaccination may be worth discussing if it is severely weakened; a clinician needs to confirm this."},

  /* --- Pregnancy --- */
  {id:"preg-flu", v:"fluPreg", if:c => c.pregnant,
   why:c => "Pregnancy can affect vaccination recommendations. Check the current flu guidance."},
  {id:"preg-wcough-now", v:"wcough", if:c => c.pregnant && c.weeks>=20,
   why:c => "Discuss whooping cough vaccination and the recommended timing with the maternity team."},
  {id:"preg-wcough-later", v:"wcough", if:c => c.pregnant && c.weeks<20, later:true,
   why:c => "Discuss whooping cough vaccination and the recommended timing with the maternity team."},
  {id:"preg-rsv-now", v:"rsvPreg", if:c => c.pregnant && c.weeks>=28,
   why:c => "Discuss RSV vaccination and the recommended timing with the maternity team."},
  {id:"preg-rsv-later", v:"rsvPreg", if:c => c.pregnant && c.weeks<28, later:true,
   why:c => "Discuss RSV vaccination and the recommended timing with the maternity team."},

  /* --- Weakened immune system --- */
  {id:"immuno-pneumo", v:"pneumo", if:c => c.immuno==="yes", why:c => c.p.Subj+" "+c.p.have+" a weakened immune system."},
  {id:"immuno-flu",    v:"flu",    if:c => c.immuno==="yes", why:c => c.p.Subj+" "+c.p.have+" a weakened immune system. Ask about the annual flu vaccine."},
  {id:"immuno-covid",  v:"covid",  if:c => c.immuno==="yes", why:c => c.p.Subj+" "+c.p.have+" a weakened immune system."},

  /* --- Occupational --- */
  {id:"work-flu", v:"flu", if:c => c.work.includes("frontline") || c.work.includes("socialcare"),
   why:c => "Frontline health or social care work. Ask occupational health about flu vaccination."},
  {id:"work-covid", v:"covid", if:c => false,
   why:c => "Frontline health or social care work. Ask occupational health about COVID-19 vaccination."},
  {id:"work-hepb", v:"hepb", if:c => c.work.includes("frontline"),
   why:c => "Work that may involve contact with blood or body fluids. Ask occupational health about hepatitis B vaccination."},
  {id:"work-hepb-lab", v:"hepb", if:c => c.work.includes("lab"),
   why:c => "Handling infectious samples at work. Ask occupational health about hepatitis B vaccination."},

  /* --- Starting university or college --- */
  {id:"uni-menacwy", v:"menacwy", if:c => c.student && c.age<25, why:c => "Starting university or college, where meningitis outbreaks are more common. Ask whether MenACWY applies."},
  {id:"uni-mmr",     v:"mmr",     if:c => c.student, why:c => "Measles and mumps outbreaks happen at universities. Ask whether your MMR doses are complete."},
  {id:"uni-hpv",     v:"hpv",     if:c => c.student && c.age<25, why:c => "Ask whether HPV catch-up applies if the school dose was missed."},
  {id:"uni-menb",    v:"menb",    if:c => false, why:c => "Ask whether MenB vaccination applies to new students."},


];

/* Notes are advisory blocks that are not tied to a single vaccine. */
const NOTES = [
  {id:"immuno-unsure", if:c => c.immuno==="notsure",
   title:"Not sure about the immune system question?",
   html:"A GP surgery can check records and confirm. If it does apply, the pneumococcal, flu, COVID-19 and shingles vaccines may all be relevant."},
  {id:"other-cond", if:c => c.conditions.includes("othercond"),
   title:"Another condition, or not sure",
   html:"This checker only covers a short list of common conditions. Other conditions and treatments can affect vaccination. Ask a GP surgery or pharmacist for an individual review."},
  {id:"work-note", if:c => c.work.length>0,
   title:"Vaccines needed for work",
   html:"Vaccination for work is usually assessed through occupational health. Ask there first."},
  {id:"under25", if:c => c.age>=16 && c.age<25 && !c.student,
   title:"Catch-up under 25",
   html:"Ask whether MenACWY and MMR catch-up apply if either was missed at school."},
  {id:"redbook", if:c => c.age < 6,
   title:"Check the personal child health record",
   html:"The red book, or the GP surgery record, is the reliable source for which doses have already been given. This checker only shows what the routine schedule expects."},
  {id:"travel", if:c => true,
   title:"Travel vaccines are not covered",
   html:"Which travel vaccines are needed depends on the destination, and they are handled separately. A travel health clinic or pharmacy can advise."}
];

/* ==========================================================================
   4. QUESTION FLOW
   One question per page. Branching reads from derived facts, so the date of
   birth alone decides the adult, teenage or infant path.
   ========================================================================== */

function derivedAge(a){
  if (!a.dob) return null;
  return ageAt(toDate(a.dob), new Date());
}

const SCREENS = {
  who: {
    type:"radios", legend:"Who are you checking for?",
    name:"who", error:"Select who you are checking for",
    options:[
      {value:"self", label:"Myself"},
      {value:"adult", label:"Another adult", hint:"For example a parent or someone you care for"},
      {value:"child", label:"A child or young person"}
    ],
    next: () => "dob"
  },
  dob: {
    type:"date", legend:"What is their date of birth?",
    legendSelf:"What is your date of birth?",
    name:"dob",
    hint:"We use this to understand age and birth-cohort guidance. It stays in this tab. For example, 12 3 1958.",
    next: a => {
      const age = derivedAge(a);
      if (age < 18) return "childRisk";
      return "pregnancy";
    }
  },
  pregnancy: {
    type:"radios", legend:"Are they pregnant?",
    legendSelf:"Are you pregnant?",
    name:"pregnancy", error:"Select yes, no, or not sure",
    hint:"Some vaccines are offered in pregnancy to protect the baby.",
    options:[{value:"yes", label:"Yes"},{value:"no", label:"No"},{value:"notsure", label:"Not sure, or prefer not to say"}],
    next: a => a.pregnancy === "yes" ? "weeks" : "immuno"
  },
  weeks: {
    type:"number", legend:"How many weeks pregnant?",
    name:"weeks", label:"Weeks", suffix:"weeks",
    hint:"An estimate is fine. Two of the vaccines in pregnancy start at a particular week.",
    min:1, max:42,
    errors:{empty:"Enter how many weeks pregnant", range:"Enter a number of weeks between 1 and 42"},
    next: () => "immuno"
  },
  immuno: {
    type:"radios", legend:"Do they have a weakened immune system?",
    legendSelf:"Do you have a weakened immune system?",
    name:"immuno", error:"Select yes, no, or not sure",
    details:{
      summary:"What counts as a weakened immune system?",
      html:"<p>It means the body's defence against infection is weaker than usual, so infections can be more serious. It can be caused by:</p><ul><li>a health condition, such as HIV, some blood cancers, or having the spleen removed</li><li>a treatment, such as chemotherapy or radiotherapy, long-term steroid tablets, biologic medicines, or medicines taken after a transplant</li></ul><p>If you are not certain, choose \"Not sure\". A GP surgery can confirm.</p>"
    },
    options:[
      {value:"yes", label:"Yes"},
      {value:"no", label:"No"},
      {value:"notsure", label:"Not sure"}
    ],
    next: () => "conditions"
  },
  conditions: {
    type:"checkboxes", legend:"Do any of these apply to them?",
    legendSelf:"Do any of these apply to you?",
    name:"conditions", error:"Select any that apply, or select \"None of these\"",
    hint:"Select all that apply. This helps identify topics to discuss, rather than confirming eligibility. Choose “Another condition, or not sure” if uncertain.",
    options: CONDITION_OPTS,
    noneOption:{value:"none", label:"None of these"},
    next: () => "work"
  },
  work: {
    type:"checkboxes", legend:"Does their work involve any of these?",
    legendSelf:"Does your work involve any of these?",
    name:"work", error:"Select any that apply, or select \"None of these\"",
    hint:"Some vaccines are recommended for particular jobs and are usually arranged through an employer.",
    options:[
      {value:"frontline", label:"Frontline health care", hint:"Direct contact with patients"},
      {value:"socialcare", label:"Social care or care home work"},
      {value:"lab", label:"Laboratory work handling infectious samples"}
    ],
    noneOption:{value:"none", label:"None of these"},
    next: a => {
      const age = derivedAge(a);
      return (age >= 16 && age <= 25) ? "student" : "check";
    }
  },
  student: {
    type:"radios", legend:"Are they starting university or college for the first time?",
    legendSelf:"Are you starting university or college for the first time?",
    name:"student", error:"Select yes or no",
    hint:"Meningitis, measles and mumps outbreaks are more common in shared student accommodation.",
    options:[{value:"yes", label:"Yes"},{value:"no", label:"No"}],
    next: () => "check"
  },
  childRisk: {
    type:"checkboxes", legend:"Do any of these apply to them?",
    name:"childRisk", error:"Select any that apply, or select \"None of these\"",
    hint:"Some children are offered extra vaccines. Select all that apply.",
    options:[
      {value:"condition", label:"A long-term health condition", hint:"For example asthma needing regular treatment, diabetes or a heart condition"},
      {value:"immuno", label:"A weakened immune system", hint:"Caused by a condition or a treatment such as chemotherapy"},
      {value:"hepbmum", label:"Their mother has hepatitis B", showIf: a => derivedAge(a) < 2},
      {value:"tb", label:"A higher risk of TB", hint:"Living in an area with high rates, or a parent or grandparent born in a country with many TB cases"}
    ],
    noneOption:{value:"none", label:"None of these"},
    next: () => "check"
  }
};

const FLOW_START = "who";

const QUESTION_LABELS = {
  who:"Checking for", dob:"Date of birth", pregnancy:"Pregnant", weeks:"Weeks pregnant",
  immuno:"Weakened immune system", conditions:"Conditions and circumstances", work:"Work",
  student:"Starting university or college", childRisk:"Applies to them"
};

/* ==========================================================================
   5. CONTEXT BUILDER
   Turns raw answers into the derived facts the rules read.
   ========================================================================== */

const PRONOUNS = {
  self:  {subj:"you",  Subj:"You",  are:"are",  have:"have", was:"were", poss:"your",  Poss:"Your"},
  other: {subj:"they", Subj:"They", are:"are",  have:"have", was:"were", poss:"their", Poss:"Their"}
};

function buildContext(answers, today){
  const dob = toDate(answers.dob);
  const isSelf = answers.who === "self";
  return {
    today,
    dob,
    isSelf,
    p: isSelf ? PRONOUNS.self : PRONOUNS.other,
    age: ageAt(dob, today),
    ageMonths: monthsBetween(dob, today),
    ageWeeks: weeksBetween(dob, today),
    schoolYear: schoolYearGroup(dob, today),
    pregnant: answers.pregnancy === "yes",
    weeks: Number(answers.weeks) || 0,
    immuno: answers.immuno || "no",
    conditions: (answers.conditions || []).filter(x => x !== "none"),
    work: (answers.work || []).filter(x => x !== "none"),
    student: answers.student === "yes",
    childRisk: (answers.childRisk || []).filter(x => x !== "none")
  };
}

/* Runs the rules. Returns a map of vaccine -> {reasons, later}. */
function legacyEvaluate(ctx){
  const recs = new Map();
  const add = (key, reason, later) => {
    if (!V[key]) return;
    if (!recs.has(key)) recs.set(key, {reasons:[], later:true});
    const e = recs.get(key);
    if (reason && !e.reasons.includes(reason)) e.reasons.push(reason);
    if (!later) e.later = false;
  };
  RULES.forEach(r => {
    let ok = false;
    try { ok = !!r.if(ctx); } catch(e){ ok = false; }
    if (ok) add(r.v, r.why(ctx), !!r.later);
  });
  ctx.conditions.forEach(c => {
    const rule = CONDITION_RULES[c];
    if (!rule) return;
    rule.vaccines.forEach(v => add(v, capitalise(rule.reason) + "."));
  });
  const notes = NOTES.filter(n => { try { return !!n.if(ctx); } catch(e){ return false; } });
  return {recs, notes};
}

function capitalise(s){ return s.charAt(0).toUpperCase() + s.slice(1); }


const META = {version:"0.2.0", jurisdiction:"England", preparedOn:"2026-10-22", clinicalReviewedAt:null, reviewDue:"2026-11-22"};
const SOURCE_REGISTER = [{"id": "schedule", "title": "Routine vaccination schedule", "url": "https://www.nhs.uk/vaccinations/nhs-vaccinations-and-when-to-have-them/", "baselineSha256": null}, {"id": "greenbook", "title": "UKHSA \u00b7 The Green Book", "url": "https://www.gov.uk/government/collections/immunisation-against-infectious-disease-the-green-book", "baselineSha256": null}, {"id": "jcvi", "title": "JCVI \u00b7 Current advice", "url": "https://www.gov.uk/government/collections/jcvi-current-advice-and-recommendations", "baselineSha256": null}, {"id": "updates", "title": "UKHSA \u00b7 Vaccine Update", "url": "https://www.gov.uk/government/collections/vaccine-update", "baselineSha256": null}, {"id": "flu", "title": "Flu vaccine", "url": "https://www.nhs.uk/vaccinations/flu-vaccine/", "baselineSha256": null}, {"id": "pneumo", "title": "Pneumococcal vaccine", "url": "https://www.nhs.uk/vaccinations/pneumococcal-vaccine/", "baselineSha256": null}, {"id": "shingles", "title": "Shingles vaccine", "url": "https://www.nhs.uk/vaccinations/shingles-vaccine/", "baselineSha256": null}, {"id": "rsv", "title": "RSV vaccine", "url": "https://www.nhs.uk/vaccinations/rsv-vaccine/", "baselineSha256": null}, {"id": "covid", "title": "COVID-19 vaccine", "url": "https://www.nhs.uk/vaccinations/covid-19-vaccine/", "baselineSha256": null}, {"id": "fluPreg", "title": "Flu vaccine in pregnancy", "url": "https://www.nhs.uk/pregnancy/keeping-well/flu-jab/", "baselineSha256": null}, {"id": "wcough", "title": "Whooping cough vaccine", "url": "https://www.nhs.uk/pregnancy/keeping-well/whooping-cough-vaccination/", "baselineSha256": null}, {"id": "rsvPreg", "title": "RSV vaccine in pregnancy", "url": "https://www.nhs.uk/vaccinations/rsv-vaccine/", "baselineSha256": null}, {"id": "menacwy", "title": "MenACWY vaccine", "url": "https://www.nhs.uk/vaccinations/menacwy-vaccine/", "baselineSha256": null}, {"id": "menb", "title": "MenB vaccine", "url": "https://www.nhs.uk/vaccinations/menb-vaccine-for-children/", "baselineSha256": null}, {"id": "mmr", "title": "MMR vaccine", "url": "https://www.nhs.uk/vaccinations/mmr-vaccine/", "baselineSha256": null}, {"id": "hpv", "title": "HPV vaccine", "url": "https://www.nhs.uk/vaccinations/hpv-vaccine/", "baselineSha256": null}, {"id": "hepb", "title": "Hepatitis B vaccine", "url": "https://www.nhs.uk/vaccinations/hepatitis-b-vaccine/", "baselineSha256": null}, {"id": "hepa", "title": "Hepatitis A vaccine", "url": "https://www.nhs.uk/conditions/hepatitis-a/", "baselineSha256": null}, {"id": "bcg", "title": "BCG (tuberculosis) vaccine", "url": "https://www.nhs.uk/vaccinations/bcg-vaccine-for-tuberculosis-tb/", "baselineSha256": null}, {"id": "sixin1", "title": "6-in-1 vaccine", "url": "https://www.nhs.uk/vaccinations/6-in-1-vaccine/", "baselineSha256": null}, {"id": "rota", "title": "Rotavirus vaccine", "url": "https://www.nhs.uk/vaccinations/rotavirus-vaccine/", "baselineSha256": null}, {"id": "mmrv", "title": "MMRV vaccine", "url": "https://www.nhs.uk/vaccinations/mmrv-vaccine/", "baselineSha256": null}, {"id": "fourin1", "title": "4-in-1 pre-school booster", "url": "https://www.nhs.uk/vaccinations/4-in-1-preschool-booster-vaccine/", "baselineSha256": null}, {"id": "childflu", "title": "Children's flu vaccine", "url": "https://www.nhs.uk/vaccinations/child-flu-vaccine/", "baselineSha256": null}, {"id": "tdipv", "title": "Td/IPV teenage booster", "url": "https://www.nhs.uk/vaccinations/td-ipv-vaccine-3-in-1-teenage-booster/", "baselineSha256": null}, {"id": "pneumoBaby", "title": "Pneumococcal vaccine (infant)", "url": "https://www.nhs.uk/vaccinations/pneumococcal-vaccine/", "baselineSha256": null}, {"id": "menbBaby", "title": "MenB vaccine (infant)", "url": "https://www.nhs.uk/vaccinations/menb-vaccine-for-children/", "baselineSha256": null}];
V.schedule={name:"Routine childhood vaccinations",url:"https://www.nhs.uk/vaccinations/nhs-vaccinations-and-when-to-have-them/",when:"Check the age-specific schedule and vaccination record",route:"childClinic"};
V.childAssessment={name:"An individual vaccination review",url:V.schedule.url,when:"Discuss health conditions and risk factors with the vaccination team",route:"gp"};
function assess(a, today=new Date()) {
 const ctx=buildContext(a,today);
 const cards=[];
 const notes=[];
 const add=(key,reason,ruleId)=>{
   let card=cards.find(c=>c.key===key);
   if(!card){card={key,...V[key],reasons:[],ruleIds:[],status:'Review needed'};cards.push(card);}
   if(!card.reasons.includes(reason))card.reasons.push(reason);
   if(!card.ruleIds.includes(ruleId))card.ruleIds.push(ruleId);
 };
 if(ctx.age<18){
   add('schedule','The childhood schedule depends on date of birth, previous doses and programme changes. This version links to the official schedule rather than calculating dose dates.','child-schedule');
   if(ctx.childRisk.length)add('childAssessment','You selected a health or risk factor. A clinician should check which additional vaccinations or precautions apply.','child-risk-review');
   notes.push('Do not assume a missed dose can always be caught up: some vaccines, including rotavirus, have strict upper age limits.');
 }else{
   RULES.forEach(r=>{if(r.if(ctx))add(r.v,r.why(ctx),r.id)});
   ctx.conditions.forEach(k=>{const rule=CONDITION_RULES[k]; if(rule)rule.vaccines.forEach(v=>add(v,'You selected '+rule.reason+'. The exact condition and severity can affect eligibility.','condition-'+k));});
   if(ctx.immuno==='notsure')notes.push('You were unsure about immune status. Ask a clinician whether this changes flu, pneumococcal, COVID-19 or shingles eligibility.');
   if(ctx.pregnant || a.pregnancy==='notsure')notes.push('If pregnancy is possible, tell the vaccination team before any vaccine. Some vaccines are not suitable during pregnancy.');
   if(ctx.immuno==='yes')notes.push('A weakened immune system can affect which vaccines are suitable and how they are given. These results are discussion prompts, not instructions to have a vaccine.');
   if(ctx.conditions.includes('othercond'))notes.push('Other conditions and treatments may affect vaccination. Ask for an individual review because this checker cannot cover them all.');
   if(ctx.student)notes.push('Check the current student vaccination advice with the GP surgery, including any newly introduced programmes.');
   if(ctx.work.length)notes.push('Vaccination for work should be assessed through your employer’s occupational health service.');
   if(!cards.some(c=>c.key==='mmr'))notes.push('Check that the routine vaccination record is complete, including MMR. No result here confirms that you are up to date.');
 }
 if(today>toDate(META.reviewDue))notes.unshift('This prototype has passed its scheduled review date. Use the linked official guidance and arrange a professional review.');
 return {cards,notes,age:ctx.age,version:META.version};
}
function metadataForRule(id,vaccine){return {id,sourceId:vaccine,sourceUrl:V[vaccine]?.url,sourceSection:null,clinicalReviewer:null,clinicalReviewedAt:null,effectiveFrom:null,effectiveUntil:null,status:'awaiting-clinical-review'};}
return {META,SOURCE_REGISTER,SCREENS,QUESTION_LABELS,assess,toDate,fmtDate,ageAt,isValidDate,metadataForRule,RULES,V};

})();
if(typeof module!=="undefined") module.exports=Vaccs;
