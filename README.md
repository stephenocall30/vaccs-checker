# NHS Vaccination Eligibility Checker (Prototype)

A quick self-serve tool that asks 6 questions and tells you which NHS vaccinations might be worth looking into, with links to the relevant NHS pages.

**[Try it here](https://YOUR-USERNAME.github.io/YOUR-REPO/)** *(update this link)*

⚠️ **This is a prototype, not an NHS service.** It's not medical advice. Talk to your GP about anything it flags.

## What it does

- Asks about age, pregnancy, immune status, long-term conditions, circumstances, and work
- Maps answers against the eligibility rules on the [NHS vaccinations schedule page](https://www.nhs.uk/vaccinations/nhs-vaccinations-and-when-to-have-them/)
- Shows results grouped by *why* they apply — routine for your age, pregnancy, health answers, or occupational
- Every recommendation carries tags showing exactly which answer triggered it, so the logic is traceable rather than a black box

## Design decisions worth knowing

- **Pregnancy timing is calculated** — enter your weeks and it tells you what's due now vs coming up
- **"Not sure" is a valid answer** for immune status — relevant vaccines still show, flagged as "confirm with GP" instead of pretending certainty
- **Occupational recommendations are indicative only** — real eligibility sits with employer occupational health and the Green Book, and the tool says so rather than faking authority
- **Under-18s get a schedule-check prompt** rather than full per-dose childhood logic — deliberate scoping call for a high-level tool

## Tech

- `index.html` / `styles.css` / `script.js` — plain three-file split, zero dependencies, no build step
- Vanilla JS rules engine — each recommendation is `{vaccine, group, reasons[], notes[]}`, deduped so one vaccine triggered by multiple answers shows once with all its reasons
- CSS transitions only, `prefers-reduced-motion` respected
- NHS design system colours, keyboard focus states throughout

## Running it

Open `index.html` in a browser, or serve the folder. No build step, no npm install.

## Caveats

- Built from a snapshot of the NHS schedule page (July 2026) — eligibility rules change, this file doesn't update itself
- England-focused; schedules differ slightly in Scotland, Wales and NI
- Some rules can't be derived from age alone (e.g. the shingles "turned 65 on or after 1 Sept 2023" cutoff) — the tool caveats these inline rather than guessing
