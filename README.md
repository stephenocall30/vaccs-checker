# Vaccs — vaccination checker

A complete dependency-free vaccination discussion prototype, redesigned from `stephenocall30/vaccs-checker` at `382d350`. Independent mint, forest-green and teal visual identity; no NHS styling or logo. `config.html` is excluded.

**Not clinically approved. This build is for private design review, not a public clinical service.**

## Run

Open `dist/index.html`, or serve the `dist/` directory using any static web server. No npm install or build step is required. Tests use Node 18+:

```sh
node --test tests/*.test.cjs
```

## Files

- `dist/index.html`: semantic shell, header and footer.
- `dist/styles.css`: responsive design tokens and components, print layout, focus and reduced-motion styles.
- `dist/app.js`: landing page, England scope gate, branching questions, validation, answer editing, results, print, privacy and source pages.
- `dist/changes.js`: selected, dated programme updates; audience/search/status filters and review warnings.
- `dist/rules.js`: fixed rule logic, content, source references and explicit unreviewed status.
- `dist/sources.json`: source-monitoring register. Includes checker references and exact tracker documents. Keep checker references aligned with SOURCE_REGISTER and tracker documents aligned with changes.js.
- `dist/_headers`: suggested Cloudflare-compatible security headers. Other hosting platforms need equivalent configuration.
- `tests/rules.test.cjs`: boundary, child-scope, deduplication and regression checks.
- `scripts/monitor-sources.py`: source/PDF change detector; never rewrites clinical logic.
- `.github/workflows/`: test and daily source-review workflows, usable after copying the project into a GitHub repository and enabling Actions.

## Programme tracker (hidden at launch)

The tracker is switched off with `FEATURES.tracker=false` at the top of `dist/app.js`. `changes.js` and its tests stay in the repo. The four tracker documents in `sources.json` carry `"paused": true`, so the source monitor skips them. To re-enable: set the flag to `true`, remove `paused` from those entries, restore the nav and footer links in `index.html`, and review every entry against its source.

## Included behaviour

- Refreshed v0.3 interface across the landing page, checker, results and information pages; rule engine remains v0.2.0.
- Searchable programme tracker with audience/status filters, source links, before/after explanations and edit history.
- Recommendations, confirmed programme starts and introduced changes have distinct labels. Passing a date never automatically promotes a status.
- Home page and clear independent-prototype status.
- Country gate; directs people outside England to their relevant health service.
- Self / another adult / child flows; age, pregnancy, immune status, conditions, work and student questions.
- Form validation, back navigation, review and change answers, branch pruning and reset.
- Reason-linked discussion cards with official guidance and rule IDs; no unsupported booking promises.
- PDF via browser Print / Save as PDF. Printed results retain prototype status, generation date and rules version.
- Source register, explanation of limitations, privacy information and error-report link.
- No external assets, analytics, cookies or answer storage. Generic route names only in URLs; answers are in page memory. Refresh or reset clears application memory; browser autofill/tab restoration remains browser-controlled.

## Deliberate clinical boundaries

Children receive official schedule signposting, not calculated infant dosing or catch-up instructions. Generic catch-up wording was removed from this flow. Work alone does not assert COVID campaign entitlement. The unverified student MenB rule is disabled. Shingles for immunosuppressed adults is a qualified discussion prompt from 18, not a judgement of severity. Seasonal calendar arrays are not used to assert availability. The misleading “already had” whole-course completion control is removed.

These changes do **not** constitute a complete clinical audit. The original adult rules still need source-section mapping, programme/effective-date validation, review of medical exclusions and independent clinical approval. Do not treat links to public NHS pages as evidence of clinical sign-off. Publication as a reliable health tool also needs medical-device applicability assessment, operational ownership, accessibility/browser QA, and legal/privacy review.

## Maintaining rules

1. Give each active rule a stable ID. Preserve IDs in result explanations.
2. Record exact source version and section, nation/programme, effective dates, reviewer, approval date, review due date and tests. `metadataForRule()` currently makes missing approval explicit; complete this record during clinical review.
3. Keep JCVI recommendations separate from implemented programme policy and live availability.
4. Add a regression test for every correction and relevant age/date boundary.
5. Have the change independently reviewed; publish a version and changelog. Never auto-approve clinical rules using an LLM or scraper.

### Source monitoring setup

The private hosted preview does not run GitHub Actions. To enable:

1. Copy the source into the intended GitHub repo (preserving its own remote), enable Actions and review workflow permissions. Do not publish `.openai/` from this Site into an unrelated repository.
2. Run `python scripts/monitor-sources.py`. The initial run creates a report and candidate snapshot; absent baselines and fetch errors are reported.
3. Read the report and source documents. Then run `python scripts/monitor-sources.py --accept-baseline` and commit `sources-baseline.json` **only after review**. Accepting a content baseline is not clinical approval.
4. The daily workflow compares normalised source text and directly linked PDF hashes. It opens one issue if attention is required, stores the full report as an artifact and fails visibly. An existing issue is not silently closed by the workflow.
5. Review differences, update affected rules and tests, and accept a new baseline deliberately. Source reformatting can produce false positives. Newsletters and programme-owner oversight remain necessary; this is not a guaranteed complete change feed.

## Deployment

Serve `dist/` over HTTPS. The Sites copy is private. The build is indexable: the noindex tag was removed on 27 Oct 2026 ahead of public launch. A CSP `<meta>` tag in `index.html` backs up `_headers` on hosts that ignore it (it cannot set `frame-ancestors`). `_headers` is host-specific: verify actual response headers when moving platforms. No database or environment secrets are needed.

For GitHub Pages, deploy the **contents of `dist/`**, not the project root; use a deployment branch or Pages artifact workflow. Keep tests and monitoring scripts in the source repository. Retain the original project's licence/ownership terms: no new licence is asserted here.

## Verification

Node syntax checks, rule regression tests and tracker filtering/date-boundary tests are included. Browser QA in the build environment was blocked by the browser URL security policy, so visual rendering, keyboard interaction, mobile layout and print preview need human verification before wider use.
