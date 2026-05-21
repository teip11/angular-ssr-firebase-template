# Gehrke Studio — Redesign handoff context

Paste this into a fresh Claude Code session to continue the redesign without re-explaining everything.

---

## Project

- **Stack:** Angular 19 + SSR (Express) + Tailwind, deployed via **Firebase App Hosting**
- **Working directory:** `/Users/pietgehrke/Documents/Business/Webdev/eigene Website/make it mobile`
- **Repo:** `origin` = `teip11/angular-ssr-firebase-template` (push target)
- **Live domain:** `gehrkestudio.com`

## Critical safety rules

- **`main` auto-deploys to production within minutes** via Firebase App Hosting (`apphosting.yaml` connects GitHub → live). NEVER push to `main` without explicit user confirmation.
- All redesign work happens on the `redesign` branch. Push there freely — nothing auto-deploys from it.
- Hot-fixes to live: branch from `main`, fix, push to `main`, then `git merge main` into `redesign`.
- Going live moment (only when user explicitly says): `git checkout main && git merge redesign && git push origin main`.

## Redesign workflow ("Claude Design drops")

- User designs in Claude Design (claude.ai artifacts) and drops a single growing `Hero.html` file into `design-drops/`.
- Each drop contains markup + CSS + scripts for every section designed so far.
- When user says "I dropped the new version" or similar → diff what's new, integrate into Angular.
- Copy in the drop is the source of truth (Claude Design sometimes rewrites copy — that's intentional).
- Refinement happens at the end; current focus is getting sections in.

## Architecture conventions

- Each redesigned section is wrapped in `<section class="X-new">` (`.hero-new`, `.value-new`, `.process-new`, `.qbridge-new`, `.showcase-new`, `.honest-new`, `.faq-new`, `.final-new`). The Leistungen page introduces its own family (`.lst-hero-new`, `.lst-pillar-new` + per-pillar variants, `.lst-process-new`, `.lst-final-new`).
- All CSS for that section is scoped under `.X-new` so cross-section class collisions (`.card`, `.bar`, `.eyebrow`, `.guides`, etc.) don't matter.
- **`DESIGN_SYSTEM.md` (repo root) is the canonical reference** — every new page must conform to it. When the doc and the homepage disagree, the homepage wins until the disagreement is reconciled in a commit. Always update §7 / §9 when adding new components or keyframes.
- **Fonts loaded** in `src/index.html`: Manrope + Sacramento (redesign) + Inter + Playfair (legacy, still used by unredesigned pages).
- **CSS budget bumped** in `angular.json` to 200kb warn / 300kb error during transition (legacy CSS still in component file, will shrink as cleanup happens).
- Angular's emulated view encapsulation scopes component CSS via attribute selectors. For rules that need to beat that, put them in global `src/styles.css`.
- **Fragment scrolling is enabled** in `app.config.ts` (`withInMemoryScrolling({ anchorScrolling: 'enabled' })`). Pages with anchor targets must set `scroll-margin-top` on the target sections (~100px desktop, ~72px mobile) so the floating nav doesn't cover them.

## What's done

### Initial redesign (commit `d9f4385`)

- Full homepage redesign, all 7 sections + footer (hero, value, process, quote bridge, showcase, honesty, FAQ, final)
- Global navbar: static top + floating pill (auto-appears after ~80vh scroll)
- Cookie consent banner
- Site footer
- Favicons (`public/Favicon.png`), logo (`public/logo.png`), OG image (`public/OG_image.png`)
- Showcase cards now use real screenshots from `public/showcase/*.png`

### Mobile + nav + CTA polish (commit `1ef249c`)

- **Mobile homepage (≤ 480px)** — full `@media` block in `home.component.css` covering every section, prefixed with the matching `.X-new` wrapper. Hero cluster → 2-col grid, CTAs stack full-width, process filmstrip becomes touch-swipe with scroll-snap, value/showcase/honest/faq/final all reflowed.
- **Mobile footer overrides** in `footer.component.css`.
- **Mobile nav drawer** — burger button (static + floating pill), full-screen overlay drawer. Closes on link tap, route change, backdrop tap, Esc. Body scroll-lock via global `body.drawer-open` class in `src/styles.css`.
- **Navbar polish** — per-letter wave-flip hover on every nav link (static + floating). Brand letters have clip-box padding so cap-tops aren't cropped. Uniform 18px gap between floating-pill entities (brand, sep, links, CTA). Static brand center-aligned (was baseline).
- **CTA hover effect** — diagonal shine sweep + arrow send-off (original flies top-right out, duplicate slides in from bottom-left) + stronger lift with subtle overshoot. Applied to hero `.btn-primary`, `.sn-cta`, `.fn-cta`.

### Value section split + hand-drawn arrow (commit `e8e322a`)

- **Homepage `.value-new` split into two same-palette stanzas** (`.value-statement-new` + `.value-cards-new`) so the statement and the cards each get their own viewport moment. Seam treated via `.guides` mask split + dropped duplicate radial wash.
- **Diagonal 12-col layout** in the statement: headline cols 1–8 top-left, sub cols 6–12 bottom-right; the empty diagonal between them is the visual tension the arrow exploits.
- **Hand-drawn arrow** (`.vh-arrow`, alias for `.drawn-arrow`) — first appearance of the §7.13 pattern, gesturing from the sub down to the first card.
- **Value cards redesigned** as dark click-throughs to `/leistungen` (with fragment anchors — see Leistungen redesign below). New dark-card palette, conic-gradient energy-border on hover via the dual-mask trick.
- **Per-element IntersectionObservers** (`setupValueReveal`) replace section-level reveals; each card observes itself for L→R cadence.

### Canonical DESIGN_SYSTEM.md (uncommitted, bundles with leistungen)

- New `DESIGN_SYSTEM.md` at repo root — 1213 lines covering color, type, layout, section namespacing, components, states, motion, responsive.
- `design-drops/DESIGN_SYSTEM-additions.md` merged into it as §7.13 (`.drawn-arrow`) and removed.
- Voice + structure: indices stay stable (§3.3 = cursive accent forever, §7.13 = hand-drawn arrow forever); new components get the next free §7 index; new keyframes append to §9.4.

### Leistungen page redesign (uncommitted)

- Full redesign of `/leistungen` matching the homepage vocabulary. Six sections:
  1. **Hero** (`.lst-hero-new`) — warm graphite, mirrors home hero; with chip-nav linking to the three pillars.
  2. **Pillar 1 — Anfragen & Kunden** (`.lst-pillar-1-new`, anchor `#anfragen`) — cream, ports the existing Webdesign content reframed for conversion.
  3. **Pillar 2 — Abläufe & Automatisierung** (`.lst-pillar-2-new`, anchor `#ablaeufe`) — terracotta; new copy (was not covered on legacy page).
  4. **Pillar 3 — Sichtbarkeit & Performance** (`.lst-pillar-3-new`, anchor `#sichtbarkeit`) — paper-light, merges legacy SEO + Performance content.
  5. **Prozess** (`.lst-process-new`) — graphite-deep; 4-step grid with Sacramento numerals.
  6. **Final CTA** (`.lst-final-new`) — graphite, same diagonal-shine + arrow-send-off `.btn-primary` as homepage hero.
- **Homepage value cards updated** to deep-link via `fragment="anfragen"` / `ablaeufe` / `sichtbarkeit`. Fragment scrolling is wired via the router config (already enabled).
- **Per-element IntersectionObservers** (`setupReveal()` in `leistungen.component.ts`) — every animatable element gets its own observer; thresholds follow DESIGN_SYSTEM §9.3.
- **Visuals are placeholder boxes** (4:5 ratio, sectional gradient, "Bild folgt" label) — real images to follow.

## Where things live

| Thing | Location |
|---|---|
| **Canonical design reference** | `DESIGN_SYSTEM.md` (repo root) |
| Homepage all sections | `src/app/pages/home/home.component.{html,css,ts}` |
| Leistungen (redesigned) | `src/app/pages/leistungen/leistungen.component.{html,css,ts}` |
| Navbar (static + floating) | `src/app/components/navbar/` |
| Footer | `src/app/components/footer/` |
| Cookie banner | `src/app/components/cookie-consent/` |
| Global styles + font links | `src/styles.css`, `src/index.html` |
| Design intake | `design-drops/Homepage-Mobile.html` (latest drop — includes mobile + desktop) |
| Routes | `src/app/app.routes.ts` |

## What's still blocking publish

### Blockers (must do)

1. **7 pages still on legacy design** — Projekte, Über uns, Blog, Kontakt, Demo, plus Impressum, Datenschutz, 404. Leistungen ✓ done. Either redesign the rest or accept the jarring inconsistency.
2. **Leistungen visuals are placeholder boxes** — 4:5 boxes labelled "Bild folgt" sit where the pillar visuals should go. Need either real product screenshots (lead-form, CRM flow, search results) or designed mockups.
3. **4 hero tiles still show striped placeholders** — need real images at `public/hero/` (t1, t3, t4, t5). Specs: 800–1200px long side, JPG/PNG/WebP. See earlier image-spec section.
4. **Static nav contrast on legacy pages** — transparent bg + light text only works on dark hero. Other pages need either redesign or a dark fallback bg on the static nav. Leistungen's hero is dark warm graphite so it's fine there.
5. **Test `/demo` and `/kontakt` forms end-to-end** — they're the primary CTAs. Verify EmailJS + reCAPTCHA still fire.
6. **404 page** — currently legacy, anyone with a wrong URL sees it.

### High priority

6. Mobile QA on real devices — hero + nav are reviewed and approved; sections 2–8 (value, process, qbridge, showcase, honest, faq, final) had their mobile @media rules ported from the drop but haven't been visually verified per-section yet. **Next session starts here.**
7. Cross-browser smoke (Safari ✓ so far, Chrome + Firefox pending; `backdrop-filter` renders differently across engines).
8. Confirm cookie banner still fires GTM/GA correctly after redesign.
9. Per-page SEO meta via `SeoService` — home was updated, other pages weren't.
10. `sticky-cta` component (`src/app/components/sticky-cta/`) — check if still in use or clashes with floating nav.
11. Mystery `src/app/pages/bundle/` — no route, possibly dead.

### Medium

12. **Global focus color is still legacy cyan** (`--color-accent-primary: #22D3EE` in `src/styles.css`). Should be orange `#f26b1f` to match brand. There's already an override for `.honest-new .seal` because of this.
13. **Dead CSS** in `home.component.css` — old hero/value/process/FAQ styles still in file, hundreds of lines, padding bundle.
14. **Showcase template pages** (`public/showcase/trattoria-marconi/index.html`, etc.) — static HTML, still legacy design. Click any showcase card → opens these.
15. Performance / Lighthouse pass.

### Nice to have

- Smooth color transitions between sections (currently hard cuts hero-dark → value-cream → process-terracotta).
- Polish hero entry animations.
- Remove `design-drops/` from repo when redesign closes.
- Cleanup the redesign-active memory files when merged.

## Memory files (persist across sessions)

Two project-memory files at `~/.claude/projects/-Users-pietgehrke-Documents-Business-Webdev-eigene-Website-make-it-mobile/memory/`:

- `redesign-branch-active.md` — push-to-`redesign` default, never `main` without confirm
- `redesign-workflow-design-drops.md` — how design drops work

Both are still relevant. Remove once redesign is merged and live.

## How to start work in a new session

1. Read this file first.
2. Check git: `git branch --show-current` should be `redesign`. If not, `git checkout redesign`.
3. To preview locally: `npx ng serve --port 4201` (4200 sometimes in use). Open `http://localhost:4201`.
4. Hot-reload picks up CSS/HTML/TS changes automatically.

## Next session — pick the next legacy page

Leistungen ✓ done and approved. Seven pages still on the legacy cyan/SaaS look. Suggested order (by impact + risk):

1. **Projekte** — heavy visual page (showcase grid). Sets the tone for case-study pages. Vocabulary from homepage `.showcase-new` can be reused.
2. **Über uns** — content-heavy, low interactivity. Safe to redesign once design language is set.
3. **Kontakt** — form risk. Must verify EmailJS + reCAPTCHA after redesign.
4. **Demo** — form risk. Same caveats as Kontakt.
5. **Blog** — content. Likely needs its own card/list pattern in DESIGN_SYSTEM.
6. **Impressum / Datenschutz** — legal, low priority but easy: typography-only pages on the paper-light palette.
7. **404 (not-found)** — small, single-screen, can be quick.

For each, the recipe is in `DESIGN_SYSTEM.md` §12. After each page lands, **update DESIGN_SYSTEM.md** with any new §7 component or §9.4 keyframe — don't let the doc drift.

### Backlog: mobile section-by-section QA (deferred from prior session)

Hero + navbar mobile are signed off. The other homepage sections (value, process, qbridge, showcase, honest, faq, final) had their mobile @media rules ported from the drop but haven't been visually verified per-section yet. Re-pick this up once the page sweep is further along.

## Open question (kept for reference)

Pick one before final launch:
- **Ship homepage only** — fastest path, accept that nav links lead to legacy pages.
- **Redesign all pages first** — bigger lift, consistent UX before launch.
