"use strict";

/* ---------- navigation ---------- */
const steps = ["step-intro","step-1","step-2","step-3","step-4","step-5","step-6","step-results"];
function go(i){
  document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
  document.getElementById(steps[i]).classList.add("active");
  window.scrollTo({top:0, behavior:"auto"});
}
function restart(){
  document.querySelectorAll("input").forEach(el => {
    if(el.type === "radio" || el.type === "checkbox") el.checked = false;
    else el.value = "";
  });
  document.getElementById("weeks-field").style.display = "none";
  go(0);
}

/* ---------- validation ---------- */
function validateAge(){
  const v = Number(document.getElementById("age").value);
  const ok = document.getElementById("age").value !== "" && v >= 0 && v <= 120;
  document.getElementById("err-age").classList.toggle("show", !ok);
  if(ok) go(2);
}
function validatePreg(){
  const sel = document.querySelector('input[name="pregnant"]:checked');
  let ok = !!sel;
  if(sel && sel.value === "yes"){
    const w = Number(document.getElementById("weeks").value);
    ok = document.getElementById("weeks").value !== "" && w >= 1 && w <= 42;
  }
  document.getElementById("err-preg").classList.toggle("show", !ok);
  if(ok) go(3);
}
function validateRadio(name, next){
  const ok = !!document.querySelector(`input[name="${name}"]:checked`);
  document.getElementById("err-" + name).classList.toggle("show", !ok);
  if(ok) go(next);
}

/* show weeks input only if pregnant */
document.querySelectorAll('input[name="pregnant"]').forEach(r => {
  r.addEventListener("change", () => {
    document.getElementById("weeks-field").style.display = r.value === "yes" && r.checked ? "block" : "none";
  });
});

/* "none" checkboxes clear the rest, and vice versa */
[["cond","cond-none"],["circ","circ-none"],["work","work-none"]].forEach(([name, noneId]) => {
  document.querySelectorAll(`input[name="${name}"]`).forEach(cb => {
    cb.addEventListener("change", () => {
      const none = document.getElementById(noneId);
      if(cb === none && cb.checked){
        document.querySelectorAll(`input[name="${name}"]`).forEach(o => { if(o !== none) o.checked = false; });
      } else if(cb.checked){
        none.checked = false;
      }
    });
  });
});

/* ---------- vaccine reference ---------- */
const NHS = "https://www.nhs.uk";
const VAX = {
  flu:        {name:"Flu vaccine", link:NHS+"/vaccinations/flu-vaccine/", detail:"Given every year, usually in autumn or early winter."},
  fluPreg:    {name:"Flu vaccine (in pregnancy)", link:NHS+"/pregnancy/keeping-well/flu-jab/", detail:"Offered during flu season at any stage of pregnancy."},
  fluChild:   {name:"Children's flu vaccine", link:NHS+"/vaccinations/child-flu-vaccine/", detail:"Given every year, usually as a nasal spray."},
  pneumo:     {name:"Pneumococcal vaccine", link:NHS+"/vaccinations/pneumococcal-vaccine/", detail:"Protects against serious illnesses like pneumonia, sepsis and meningitis."},
  shingles:   {name:"Shingles vaccine", link:NHS+"/vaccinations/shingles-vaccine/", detail:"Offered at 65 (if you turned 65 on or after 1 September 2023), from 70 to 79, or from 18 if you have a severely weakened immune system."},
  rsv:        {name:"RSV vaccine", link:NHS+"/vaccinations/rsv-vaccine/", detail:"Protects against respiratory syncytial virus, which can cause serious lung infections."},
  covid:      {name:"COVID-19 vaccine", link:NHS+"/vaccinations/covid-19-vaccine/", detail:"Usually offered in spring and winter to those eligible."},
  whooping:   {name:"Whooping cough (pertussis) vaccine", link:NHS+"/pregnancy/keeping-well/whooping-cough-vaccination/", detail:"Offered around 20 weeks of pregnancy to protect your baby after birth."},
  rsvPreg:    {name:"RSV vaccine (in pregnancy)", link:NHS+"/vaccinations/rsv-vaccine/", detail:"Offered from 28 weeks of pregnancy to protect your baby."},
  menACWY:    {name:"MenACWY vaccine", link:NHS+"/vaccinations/menacwy-vaccine/", detail:"Protects against 4 strains of meningococcal bacteria that cause meningitis and sepsis."},
  menB:       {name:"MenB vaccine", link:NHS+"/vaccinations/menb-vaccine-for-children/", detail:"Protects against meningococcal group B infections including meningitis."},
  mmr:        {name:"MMR vaccine (2 doses)", link:NHS+"/vaccinations/mmr-vaccine/", detail:"Protects against measles, mumps and rubella. Worth checking your history — outbreaks happen at universities."},
  hpv:        {name:"HPV vaccine", link:NHS+"/vaccinations/hpv-vaccine/", detail:"Protects against cancers and genital warts caused by human papillomavirus."},
  hepA:       {name:"Hepatitis A vaccine", link:NHS+"/conditions/hepatitis-a/", detail:"Protects against hepatitis A liver infection."},
  hepB:       {name:"Hepatitis B vaccine", link:NHS+"/vaccinations/hepatitis-b-vaccine/", detail:"Protects against hepatitis B liver infection."},
  bcg:        {name:"BCG (TB) vaccine — risk assessment", link:NHS+"/vaccinations/bcg-vaccine-for-tuberculosis-tb/", detail:"Sometimes recommended for people whose work brings TB exposure risk."}
};

const CONDITION_LABELS = {
  spleen:"Spleen problems", cochlear:"Cochlear implant", resp:"Respiratory / heart condition",
  neuro:"Neurological condition", diabetes:"Diabetes", kidney:"Chronic kidney disease",
  liver:"Chronic liver condition", haemo:"Haemophilia", complement:"Complement disorder"
};

/* ---------- results engine ---------- */
function showResults(){
  const age = Number(document.getElementById("age").value);
  const pregnant = document.querySelector('input[name="pregnant"]:checked')?.value === "yes";
  const weeks = pregnant ? Number(document.getElementById("weeks").value) : 0;
  const immuno = document.querySelector('input[name="immuno"]:checked')?.value || "no";
  const conds = [...document.querySelectorAll('input[name="cond"]:checked')].map(c => c.value).filter(v => v !== "none");
  const circs = [...document.querySelectorAll('input[name="circ"]:checked')].map(c => c.value).filter(v => v !== "none");
  const work  = [...document.querySelectorAll('input[name="work"]:checked')].map(c => c.value).filter(v => v !== "none");

  /* recs: key -> {vax, group, reasons:[{label,type}], notes:[]} */
  const recs = new Map();
  const add = (key, vaxKey, group, reason, type = "cond", note = null) => {
    if(!recs.has(key)) recs.set(key, {vax: VAX[vaxKey], group, reasons: [], notes: []});
    const r = recs.get(key);
    if(!r.reasons.some(x => x.label === reason)) r.reasons.push({label: reason, type});
    if(note && !r.notes.includes(note)) r.notes.push(note);
    return r;
  };
  const G = {AGE:"Routine for your age", HEALTH:"Because of your health answers", PREG:"Pregnancy", OCC:"Through work — speak to occupational health"};

  /* --- age-based (adults) --- */
  if(age >= 65){
    add("flu","flu",G.AGE,"Aged 65+","age");
    add("pneumo","pneumo",G.AGE,"Aged 65+","age");
  }
  if((age >= 65 && age <= 66) || (age >= 70 && age <= 79)){
    add("shingles","shingles",G.AGE, age <= 66 ? "Turned 65 recently" : "Aged 70 to 79","age");
  } else if(age >= 67 && age <= 69){
    add("shingles","shingles",G.AGE,"Aged 65+","age",
      "Eligible if you turned 65 on or after 1 September 2023 — otherwise you'll be invited from 70.");
  }
  if(age >= 75){
    add("rsv","rsv",G.AGE,"Aged 75+","age");
    add("covid","covid",G.AGE,"Aged 75+","age");
  }
  if(age < 18){
    add("childSchedule","mmr",G.AGE,"Under 18","age",
      "Under-18s follow the routine childhood schedule (6-in-1, MMRV, HPV at 12 to 13, teenage boosters at 14, and yearly flu until Year 11). Check with your GP that you're up to date.");
    recs.get("childSchedule").vax = {name:"Routine childhood schedule check", link:NHS+"/vaccinations/nhs-vaccinations-and-when-to-have-them/", detail:"A quick check with your GP surgery will confirm whether any doses were missed."};
  }

  /* --- pregnancy --- */
  if(pregnant){
    add("fluPreg","fluPreg",G.PREG,"Pregnant","preg");
    const wc = add("whooping","whooping",G.PREG,"Pregnant","preg");
    if(weeks >= 16) wc.notes.push(`At ${weeks} weeks, this is due now if you haven't had it.`);
    else wc.notes.push(`Offered around 20 weeks — coming up for you.`);
    const rp = add("rsvPreg","rsvPreg",G.PREG,"Pregnant","preg");
    if(weeks >= 28) rp.notes.push(`At ${weeks} weeks, you can have this now.`);
    else rp.notes.push(`Offered from 28 weeks — around ${28 - weeks} week${28-weeks===1?"":"s"} away for you.`);
  }

  /* --- weakened immune system --- */
  if(immuno === "yes" || immuno === "unsure"){
    const t = immuno === "unsure" ? "check" : "cond";
    const label = immuno === "unsure" ? "Possible weakened immune system — confirm with GP" : "Weakened immune system";
    const fluKey = age < 18 ? "fluChild" : "flu";
    add("flu", fluKey, G.HEALTH, label, t);
    add("pneumo","pneumo",G.HEALTH,label,t);
    add("covid","covid",G.HEALTH,label,t);
    if(age >= 18) add("shingles","shingles",G.HEALTH,label,t);
  }

  /* --- long-term conditions --- */
  const condMap = {
    spleen:["menACWY","menB","pneumo","flu"],
    cochlear:["pneumo"],
    resp:["pneumo","flu"],
    neuro:["pneumo","flu"],
    diabetes:["pneumo","flu"],
    kidney:["pneumo","flu","hepB"],
    liver:["pneumo","flu","hepA","hepB"],
    haemo:["hepA","hepB"],
    complement:["menACWY","menB","pneumo","flu"]
  };
  conds.forEach(c => {
    (condMap[c] || []).forEach(v => {
      const vaxKey = (v === "flu" && age < 18) ? "fluChild" : v;
      add(v, vaxKey, G.HEALTH, CONDITION_LABELS[c], "cond");
    });
  });

  /* --- circumstances --- */
  if(circs.includes("carehome")){
    add("covid","covid",G.HEALTH,"Lives in a care home for older adults","cond");
  }
  if(circs.includes("uni")){
    if(age < 25) add("menACWY","menACWY",G.HEALTH,"Starting university or college","cond","Available from your GP until your 25th birthday.");
    add("mmr","mmr",G.HEALTH,"Starting university or college","cond");
    add("hpv","hpv",G.HEALTH,"Starting university or college","cond");
    if(age <= 24) add("menB","menB",G.HEALTH,"Starting university or college","cond","Available from 20 July 2026 if you're 24 or under and starting for the first time.");
  }

  /* --- occupational (indicative only) --- */
  if(work.includes("healthcare")){
    add("occFlu","flu",G.OCC,"Frontline health / social care","occ","Offered free each year to frontline workers, usually via your employer.");
    add("occHepB","hepB",G.OCC,"Frontline health / social care","occ","Recommended where work involves exposure to blood or body fluids.");
  }
  if(work.includes("lab")){
    add("occHepB","hepB",G.OCC,"Laboratory / pathology work","occ","Recommended where work involves handling clinical specimens.");
    add("occBcg","bcg",G.OCC,"Laboratory / pathology work","occ");
  }
  if(work.includes("contact")){
    add("occBcg","bcg",G.OCC,"Prison / homelessness / asylum support work","occ");
    add("occFlu","flu",G.OCC,"Higher-risk close-contact setting","occ");
  }

  render(recs, {age, pregnant, work});
}

function render(recs, ctx){
  const order = ["Routine for your age","Pregnancy","Because of your health answers","Through work — speak to occupational health"];
  const byGroup = {};
  recs.forEach(r => { (byGroup[r.group] ||= []).push(r); });

  const container = document.getElementById("results");
  let html = "";
  let total = 0;

  order.forEach(group => {
    const items = byGroup[group];
    if(!items) return;
    total += items.length;
    const isOcc = group.startsWith("Through work");
    html += `<div class="group"><div class="group-title">${group}</div>`;
    if(isOcc){
      html += `<div class="callout"><strong>Heads up:</strong> occupational vaccinations aren't covered by the NHS schedule page this tool is built on. What's below is indicative — your employer's occupational health service decides what applies to your role.</div>`;
    }
    items.forEach(r => {
      html += `<div class="vax${isOcc ? " occ" : ""}">
        <h3><a href="${r.vax.link}" target="_blank" rel="noopener">${r.vax.name}</a></h3>
        <p>${r.vax.detail}${r.notes.length ? " " + r.notes.join(" ") : ""}</p>
        <div class="chips">${r.reasons.map(x => `<span class="chip ${x.type}">${x.label}</span>`).join("")}</div>
      </div>`;
    });
    html += `</div>`;
  });

  if(total === 0){
    html = `<div class="empty"><p><strong>Nothing extra flagged from your answers.</strong> Based on what you've told us, you're likely covered by the routine schedule for now. Two things still worth doing:</p>
    <p style="margin-top:.5rem">• Check you've had 2 doses of the <a href="${VAX.mmr.link}" target="_blank" rel="noopener">MMR vaccine</a> — you can catch up at any age<br>
    • Come back to this when your circumstances change (age milestones, pregnancy, new diagnoses, new job)</p></div>`;
    document.getElementById("results-summary").textContent = "No specific vaccinations flagged based on your answers.";
  } else {
    document.getElementById("results-summary").textContent =
      `Based on your answers, ${total} vaccination${total===1 ? "" : "s"} came up. Each one links to the NHS page, and the tags show which of your answers triggered it.`;
  }

  container.innerHTML = html;
  go(7);
}
