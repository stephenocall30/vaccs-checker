# Vaccs: vaccination checker

A static, dependency-free prototype. You answer a few questions and get a list of vaccinations to raise with a health professional. England only. Answers stay in the browser tab: no analytics, cookies, storage or external calls.

**Prototype. Not clinically reviewed and not an NHS service.**

## Run and test

Open `dist/index.html` or serve `dist/` with any static server. There is no build step. Tests need Node 18+:

```sh
node --test tests/*.test.cjs
```

## Files

| Path | Purpose |
|---|---|
| `dist/index.html` | Shell, header, footer, CSP meta tag |
| `dist/app.js` | Pages, question flow, validation, results, print |
| `dist/rules.js` | Rule logic, content and source references |
| `dist/changes.js` | Programme tracker data (hidden, see below) |
| `dist/sources.json` | Register of sources the monitor checks |
| `dist/styles.css` | Design tokens, components, print styles |
| `dist/logo.svg`, `dist/favicon.svg` | Brand. Export with fill attributes: the CSP blocks `<style>` |
| `dist/_headers` | Cloudflare-style security headers. Other hosts ignore it |
| `scripts/monitor-sources.py` | Detects source and PDF changes. Never edits rules |
| `.github/workflows/` | Tests, Pages deploy, monthly source review |

## Programme tracker

Hidden with `FEATURES.tracker=false` at the top of `dist/app.js`. To re-enable: set the flag to `true`, remove `"paused": true` from the four tracker entries in `sources.json`, restore the nav and footer links in `index.html`, and review every entry against its source.

## Clinical boundaries

- Children get official schedule signposting, with no calculated dosing or catch-up advice.
- Work alone does not assert COVID entitlement.
- The student MenB rule is disabled until someone verifies it.
- Shingles for immunosuppressed adults is a discussion prompt from 18.
- Results never promise availability or booking.

Before anyone relies on this as a health tool it needs: source-section mapping for the adult rules, effective-date validation, a review of medical exclusions, independent clinical approval, a medical-device assessment, and accessibility, legal and privacy review. Links to NHS pages are not evidence of sign-off.

## Changing rules

1. Keep rule IDs stable. Results cite them.
2. Record source version and section, effective dates, reviewer and review date for each rule.
3. Keep JCVI recommendations separate from implemented programmes and live availability.
4. Add a regression test for every correction and every age or date boundary.
5. Get an independent review. Never approve a clinical rule from an LLM or scraper output.

## Source monitoring

`source-review.yml` runs on the 1st of each month. It compares source text and linked PDF hashes against `sources-baseline.json` and opens an issue when something changed.

```sh
python scripts/monitor-sources.py                    # writes source-review.md and a candidate snapshot
python scripts/monitor-sources.py --accept-baseline  # run only after you have read the report
```

Accepting a baseline is not clinical approval. Reformatted pages cause false positives, and the monitor can miss changes, so keep reading the programme newsletters.

## Deploy

`pages.yml` publishes the contents of `dist/` to GitHub Pages on every push to `main`. GitHub Pages ignores `_headers`, so the CSP meta tag is the only policy there and it cannot set `frame-ancestors`. Check response headers when you change host.
