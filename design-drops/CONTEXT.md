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

- Each redesigned section is wrapped in `<section class="X-new">` (`.hero-new`, `.value-new`, `.process-new`, `.qbridge-new`, `.showcase-new`, `.honest-new`, `.faq-new`, `.final-new`).
- All CSS for that section is scoped under `.X-new` so cross-section class collisions (`.card`, `.bar`, `.eyebrow`, `.guides`, etc.) don't matter.
- **Fonts loaded** in `src/index.html`: Manrope + Sacramento (redesign) + Inter + Playfair (legacy, still used by unredesigned pages).
- **CSS budget bumped** in `angular.json` to 200kb warn / 300kb error during transition (legacy CSS still in component file, will shrink as cleanup happens).
- Angular's emulated view encapsulation scopes component CSS via attribute selectors. For rules that need to beat that, put them in global `src/styles.css`.

## What's done (committed in `d9f4385` on `redesign` branch)

- Full homepage redesign, all 7 sections + footer (hero, value, process, quote bridge, showcase, honesty, FAQ, final)
- Global navbar: static top + floating pill (auto-appears after ~80vh scroll)
- Cookie consent banner
- Site footer
- Favicons (`public/Favicon.png`), logo (`public/logo.png`), OG image (`public/OG_image.png`)
- Showcase cards now use real screenshots from `public/showcase/*.png`

## Where things live

| Thing | Location |
|---|---|
| Homepage all sections | `src/app/pages/home/home.component.{html,css,ts}` |
| Navbar (static + floating) | `src/app/components/navbar/` |
| Footer | `src/app/components/footer/` |
| Cookie banner | `src/app/components/cookie-consent/` |
| Global styles + font links | `src/styles.css`, `src/index.html` |
| Design intake | `design-drops/Hero.html` (latest drop) |
| Routes | `src/app/app.routes.ts` |

## What's still blocking publish

### Blockers (must do)

1. **8 pages still on legacy design** — every nav link (Projekte, Leistungen, Über uns, Blog, Kontakt) plus Impressum, Datenschutz, 404. Either redesign them or accept the jarring inconsistency.
2. **4 hero tiles still show striped placeholders** — need real images at `public/hero/` (t1, t3, t4, t5). Specs: 800–1200px long side, JPG/PNG/WebP. See earlier image-spec section.
3. **Static nav contrast on legacy pages** — transparent bg + light text only works on dark hero. Other pages need either redesign or a dark fallback bg on the static nav.
4. **Test `/demo` and `/kontakt` forms end-to-end** — they're the primary CTAs. Verify EmailJS + reCAPTCHA still fire.
5. **404 page** — currently legacy, anyone with a wrong URL sees it.

### High priority

6. Mobile responsive sweep (process filmstrip + quote bridge most likely to misbehave).
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

## Open question for next session

Pick one before starting:
- **Ship homepage only** — fastest path, accept that nav links lead to legacy pages.
- **Redesign all pages first** — bigger lift, consistent UX before launch.
