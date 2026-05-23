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

### Homepage value section → poster bands (commit `b2f1a29`)

- **Replaces `.value-statement-new` + `.value-cards-new`** with a single `.value-bands-new` layout.
- New header: "Was Ihre Website für Sie *leistet*" (cursive accent on "leistet").
- Three alternating-direction bands (5fr/7fr → 7fr/5fr → 5fr/7fr); demo placement flips with the columns each row.
- Each band is a plain `<article>`; the inner "Mehr erfahren" link is the only clickable element and routes to `/leistungen` with the matching fragment (`#anfragen`, `#ablaeufe`, `#sichtbarkeit`).
- Numerals carry a clipped vertical gradient (warm-gray → near-transparent) modeled on the footer wordmark — architectural markers, not competing with the band h3.
- Demos retuned to a **light theme** so they blend with the cream section (previously dark cards punching out).
- Section background shifts cream → warm-cream (`#e6c9ad`) at the bottom, previewing the terra of the following Process section so the seam reads as a continuation, not a cut.
- **Removed**: `vhArrow` ViewChild + observer (no longer in template). The `.drawn-arrow` / `.vh-arrow` component (DESIGN_SYSTEM §7.13) is currently NOT in use anywhere — it exists as a documented pattern only.

### Projekte page redesign

- Full visual redesign of `/projekte` matching the homepage vocabulary. Five sections, all scoped under `.prj-*-new` wrappers:
  1. **Hero** (`.prj-hero-new`) — warm graphite, mirrors home hero.
  2. **Projekt-marquee** (`.prj-grid-new`) — graphite-deep section housing the new `.prj-marquee` auto-scrolling row (DESIGN_SYSTEM §7.14). 3 real cards (Trattoria, Schreinerei, Praxis) + 9 placeholder slots ("Weitere Projekte folgen" with category tags).
  3. **Case study 01** (`.prj-case-1-new`) — cream, vorher/nachher placeholder boxes with red/green tag chips.
  4. **Case study 02** (`.prj-case-2-new`) — paper-light, alternating layout.
  5. **Final CTA** (`.prj-final-new`) — graphite, same shine + arrow-send-off `.btn-primary` as homepage hero.
- **`.prj-marquee` is JS-driven** — a `requestAnimationFrame` loop increments `scrollLeft` at 35px/s. Native horizontal scroll (overflow-x: auto) lets the user wheel or swipe through the cards; auto-scroll pauses 1.5s after horizontal input. Only horizontal gestures pause (vertical wheel/touch over the marquee is ignored). Keyboard `:focus-visible` also pauses for a11y. Loop wraps invisibly via duplicate card sets and scrollLeft normalization. Full spec in DESIGN_SYSTEM §7.14.
- **Cards use "Echt" label** (not "Real") in the foot of real cards. Card direction-of-content flow is left-to-right to match German LTR reading.
- **Case-study content stayed fictional** (Elite Real Estate, GreenTech Solutions) per user direction — redesigned scaffold with placeholder vorher/nachher boxes ready for real images.

### Über uns redesign

- Four sections, `.abt-*-new` family: hero (warm graphite) → bio (paper-light, 2-col with portrait placeholder + Sacramento signature) → values (cream, 3 cards with Sacramento numerals carrying the three "vor"-principles) → final CTA (warm graphite).
- Dropped the legacy "Vorgehen / 4-step process" section because that content already lives on Leistungen `.lst-process-new` and duplicating it on Über uns read as padding.
- Bio uses the same `.lst-visual-placeholder` vocabulary (4:5 aspect, gradient + "Portrait folgt" label) — drop a real photo into `public/portrait.jpg` later and the placeholder becomes the photo.

### Kontakt redesign (with reCAPTCHA wiring)

- Two sections, `.knt-*-new` family: hero (warm graphite) → form (paper-light, 2-col with light form card + sticky side info card containing direct mailto + Sacramento "24h / 0€" promise rows + signature).
- Form contract preserved exactly: same `form.name/email/message` ngModel bindings, same `TEMPLATE_CONTACT` + `TEMPLATE_AUTO_REPLY` EmailJS template IDs, same fire-and-forget auto-reply pattern. Only addition is the `'g-recaptcha-response'` token field in the templateParams.
- Inputs are **underline-only on cream** (1px bottom border → 2px orange on focus + 1px box-shadow). Submit button uses the full `.btn-primary` shine + arrow effect on a `<button>` (first time the effect lives on a button rather than an anchor — required `border: 0`, `cursor: pointer`, `:disabled { cursor: progress; opacity: .82 }`).

### Demo redesign (with reCAPTCHA wiring, header aligned to canonical CTA)

- Two sections, `.dmo-*-new` family: hero (warm graphite) → form (paper-light, centered ~920px single column with the 4 steps stacked).
- All 11 ngModel field names preserved (`name`, `email`, `company`, `description`, `hasWebsite`, `goalKunden/Anfragen/Online`, `detailedGoals`, `inspiration`, `wishes`). `TEMPLATE_DEMO` payload field names untouched (`from_name`, `from_email`, `beschreibung`, `hat_website`, `ziele`, `detaillierte_ziele`, `inspiration`, `sonstige_wuensche`, `form_type: 'Demo-Anfrage'`). Added `'g-recaptcha-response'`.
- **Hero copy realigned to the site-wide canonical CTA.** All conversion-facing text now uses "Vorlage" not "Demo": eyebrow `01 · Kostenlose Vorlage`, h1 `Ihre individuelle Website-Vorlage. <accent>Kostenlos.</accent>`, form h2 `Ein paar Fragen — und Sie bekommen Ihre <accent>Vorlage.</accent>`, submit button `Kostenlose Vorlage anfordern` (identical to nav + every other page CTA). Internal `form_type` stayed as `'Demo-Anfrage'` to not break EmailJS template logic.
- Each form step has a Sacramento numeral 01–04 with rotated -3deg, matching the value-card and process-step pattern.
- New patterns introduced (not yet in DESIGN_SYSTEM.md §7): toggle switch on paper-light (`.dmo-toggle`), multi-select pill with check badge (`.dmo-pill`), trust-row item with orange bar (`.dmo-trust`).

### reCAPTCHA v2 invisible service (live, migrated from v3 on 2026-05-23)

- `src/app/services/recaptcha.service.ts` — lazy-loads `https://www.google.com/recaptcha/api.js?render=explicit`, lazily renders a hidden invisible widget on first `execute()` call, returns the verification token via the widget's callback. SSR-safe (no DOM access in constructor). API surface kept (`execute(action)`, `preload()`) for call-site compatibility — the `action` arg is unused in v2.
- Site key (v2 invisible) in `recaptcha.service.ts:33`. Secret key configured by user inside EmailJS template `template_ok970si` → Settings → reCAPTCHA Secret Key.
- Disclaimer text rendered above each submit button: *"Geschützt durch reCAPTCHA — Datenschutz & Nutzungsbedingungen von Google gelten."*
- Floating badge hidden globally via `.grecaptcha-badge { visibility: hidden !important; }` in `src/styles.css`. Hiding is compliant because the disclaimer text is shown near each form (Google's policy). **The attribution text is now load-bearing — don't remove it without un-hiding the badge first.**
- **Domain allowlist:** add `localhost` AND `gehrkestudio.com` at https://www.google.com/recaptcha/admin → key settings → Domains. Missing entries cause silent verification failures.
- **Why v2 not v3:** EmailJS only supports v2 server-side verification in its dashboard. v3 tokens validated against a v2 secret return `reCAPTCHA: browser-error` and the send fails. Migration loses per-action scoring (v2 is pass/fail) — fine for a low-traffic contact form.
- **Auto-reply template (`template_yxsrs34`) must NOT have reCAPTCHA enabled** — it fires after the main template already cleared verification; toggling it on silently blocks delivery (no History entry created).

### Blog redesign (filter pills + newsletter dropped)

- Four sections, `.blg-*-new` family: hero (warm graphite) → featured (cream, 2-col: 4:5 placeholder cover with orange "Featured" badge + lead story) → articles grid (paper-light, 3-col, 5 cards with the last spanning 2 cols) → final CTA (warm graphite).
- **Dropped the legacy filter pills** (Alle / Webdesign / SEO / Performance / Strategie) — they were non-functional in legacy. When a real blog with categories grows, add a working `[ngClass]` filter at that point.
- **Dropped the legacy newsletter signup form** — the legacy `<form>` had no submit handler, no service binding, no backend. Replaced with the canonical final CTA (Vorlage anfordern + Kontakt ghost link). If you ever want a real newsletter signup, wire it to EmailJS + reCAPTCHA as a separate decision.
- Each article card carries a small orange-tinted **"Demnächst" pill** — articles aren't written yet, cards render as visible-but-non-linked `<article>` elements with hover lift. When real posts land, add a `/blog/:slug` route and wire each card to a `routerLink`.
- Article covers use **6 palette-rotating gradient variants** (warm, deep-graphite, paper-light, terracotta, cream, near-black) so placeholder boxes don't visually flatten. Drop real cover images in and the gradient classes can go.
- Copy tweak: legacy SEO article was titled "SEO-Trends 2024" — already dated. Changed to "SEO heute" for shelf life.

### Impressum / Datenschutz / 404 redesigns

- All three on the same vocabulary: paper-light palette (graphite for 404), reading column (~720–800px), per-page wrappers (`.imp-page-new`, `.dts-page-new`, `.nf-page-new`).
- **Impressum** — single section, 7 blocks with horizontal rules between major sections, all legal text preserved verbatim. **Fixed a silently-broken `routerLink="/kontakt"`** that was using the directive without `RouterLink` in the component's `imports:` array.
- **Datenschutz** — 6 numbered sections with Sacramento numerals as the visual spine. Cookie reset button (`(click)="resetConsent()"`) preserved with new ghost-button styling. **Added a new clause about reCAPTCHA v3** (§4 inside the "Datenerfassung" section) since the service is now live and DSGVO Art. 13 requires disclosure.
- **404** — single-section full-viewport hero on warm graphite. Giant Sacramento "404" numeral rotated -3deg, "Verirrt? *Kein Problem.*" headline, Vorlage CTA + Startseite ghost link. Replaced the legacy 🔍 emoji + `.section-title` / `.btn--primary` global classes.

### Homepage Process section rebuild + Showcase auto-marquee (uncommitted, 2026-05-21/22)

- **Process section restructured** in `.process-new`:
  - Old 4-card scroll-jacked filmstrip (Briefing → Konzept → Gespräch → Entscheidung) replaced with **sticky scroll-stack of 3 cards** (Konzept → Umsetzung → Übergabe). The "Anfrage" step was dropped on purpose: the hero CTA *is* the inquiry, so making it a process step put the conversion behind a procedural gate.
  - Cards are `position: sticky; top: 120px` siblings; all 3 share the same `top` value so they release together as one unit. Staircase look comes from `transform: translateY(20px/40px)` on cards 1/2, which doesn't affect sticky math. Pure-CSS, no scroll-jacking.
  - **Sticky rail on the left** (240px wide, also sticky) marks the active step; JS-driven `updateProcess` tracker fires when a card crosses 45% of viewport. After card 3 has scrolled ~38vh out, the rail follows up at 1:1 with the cards via a JS-applied `translateY`, so the section reaches the breather without dead scroll.
  - **Layout inside each card is flipped** from the original spec: `.meta` (eyebrow → header → cursive sub → description) is on top, browser-chrome preview (`.pvx-*`) is on the bottom 60%. Reading order: eye lands on the headline first, then drops to the visual as evidence.
  - **Card palette is cream** (`#fbf4ea` + `var(--ink-dark)` text + warm cream-gradient preview backdrop). All three previews — `.pvx-site` (homepage mockup), `.pvx-code` (build editor), `.pvx-live` (success dashboard) — render as white "screenshot" cards on the cream backdrop with subtle shadows.
  - **Active-card glow** is an orange ring (`rgba(242, 107, 31, 0.4)` border + warm halo) — gold disappears on cream, orange pops.
  - **Card 1 (Konzept) is `.is-hl`** with an orange "Kostenlos" badge top-left and orange corner button. The card chrome itself is identical to cards 2 + 3 — the "kostenlos" identity lives in the badge + accent button, not in the border.
  - **Copy realigned to actual workflow:**
    - Card 1: "Eine vollständige Designvorschau Ihrer **Startseite** — Stil, Typografie, Farbwelt. Überzeugt Sie das Konzept nicht? Kein Problem — Sie sind zu nichts verpflichtet."
    - Card 2: "**Sind Sie überzeugt, geht's los.** Design, Entwicklung, SEO, Performance, Hosting — Sie wählen, was Sie brauchen. Klarer Festpreis, keine Überraschungen."
    - Card 3: "Wir schalten live, übergeben Zugänge, Code und eine persönliche Anleitung. Sie können alles selbst pflegen — Wartung gibt's nur auf Wunsch."
  - Header type: 28px, weight 800, `#2a2520` (warm dark gray), letter-spacing -0.03em. Cursive sub: 22px orange Sacramento.
- **Showcase section converted to auto-marquee** in `.showcase-new`:
  - Was a 3-up static grid; now a horizontal carousel of 6 unique real cards duplicated to 12 for seamless loop (no more placeholders — see "Showcase wheel — 3 new templates integrated" below).
  - JS-driven `scrollLeft` increment (0.6 px/frame ≈ 36 px/s) via `requestAnimationFrame` in `startShowcaseAutoScroll`. Native horizontal scrolling on the same track (overflow-x: auto) means trackpad swipe / wheel still works.
  - Pauses on hover (`showcasePaused`), edges fade via CSS mask, scrollbar hidden cross-browser.
- **Final CTA + Showcase CTA formatting fixes** — both had `.label`/`.final-trust` set to `display: inline-flex`, which made the eyebrow and trust pills render on the same line as the buttons instead of stacking. Both flipped to `display: flex` with `justify-content: center`. Worth a sweep through the other sections (`honest-new`, `faq-new`) for the same pattern.
- **TS cleanup:** removed `processTrack`/`filmstrip`/`railFill`/`processBeams`/`ticker1` refs + `updateProcess` filmstrip math + `beamPositions` + `progressPercent` + `isNear` + `goToStep`. Process section is now ~12 lines of scroll handling instead of ~70.

### Hero rebuilt → isometric editorial (uncommitted, 2026-05-22)

Full redesign of the hero's right-side cluster based on `design-drops/new-hero.html` (variant 08, "Isometric editorial" from Claude Design). Replaces the previous flat three-storytelling-cards layout — no longer uses any real screenshots.

**Layout: `.stage3d`** replaces `.cluster`. Three numbered "frames" arranged as a triangle:
- **01 — `.frame--site`** (full width, top): typography-driven mockup of `trattoria-marconi.de` (no screenshot — hand-typeset with `.ms-eyebrow` / `.ms-title` "Pasta wie / in Bologna" / `.ms-script` "— Buongiorno" / `.ms-body` / `.ms-cta` "Tisch reservieren" + warm-gradient `.ms-art` panel on the right).
- **02 — `.frame--traffic`** (bottom-left): `.tk-traffic` GA-style dashboard. Larger graph (220×70 viewBox + endpoint dot) than the previous variant. Active card on hover bumps to `translateZ(140px)` to clear card 03's resting `translateZ(60px)`.
- **03 — `.frame--konv`** (bottom-right): `.tk-konv` multi-item Anfragen feed (active item + muted item) plus `.stat` "24 / Monat" block underneath. Resting state sits at `translateZ(60px)` to be in front of card 01.

**Frame anatomy** — every frame has three nested layers, by design:
1. `.frame.frame--X` — outer positioning shell, position absolute, no styling
2. `.frame-float` — owns the continuous floating animation (translateY oscillation only). Lives on its own layer so the float and the hover transform never compete for the `transform` property.
3. `.frame-tilt` — orange chrome (background, padding, border-radius, shadow), 3D rotation, hover lift. Has its own `transition: transform .5s cubic-bezier(.2,.8,.2,1)`.
4. `.inner` — cream content area.

**Cap-strip footer** on every frame — orange band at the bottom, naming the value point:
- `01 · Design / unverwechselbar`
- `02 · Sichtbarkeit / messbar`
- `03 · Anfragen / planbar`

The `.tag` is uppercase 800-weight Manrope; the `.desc` is cursive Sacramento. Pattern is shared via `.frame .cap-strip` (smaller padding/font on `.frame--card .cap-strip` for the narrower bottom cards).

**Decorative wordmark — `.wordmark`** runs vertically along the left rail of the stage. Two stacked vertical-rl spans: `.vtxt` ("DESIGN", outlined in orange via `-webkit-text-stroke`) + `.vtxt.solid` ("STUDIO", solid cream). Sits at `translateZ(-120px)` so it visibly recedes behind the cards in 3D space. `left: -85px`, `width: 90px`.

**3D scene**:
- `.stage3d` provides `perspective: 1800px` and `transform-style: preserve-3d`.
- All `.frame-tilt` elements use `rotateY()` (-12° site, -16° traffic, -14° konv) + `rotateX()` (3° / 2° / 2°) for the isometric tilt.
- All hovered cards lift to `translateZ(140-180px)` — clears every other card's resting Z, so the hovered card is always foremost. (z-index alone doesn't work in 3D contexts where `transform-style: preserve-3d` is active — stacking is purely 3D-position-based.)
- Hover removes the heavy box-shadow (drops to `0 0 0 1px` hairline) so the lifted card doesn't cast a downward shadow onto the cards below it.

**Floating animation** — three offset keyframes `hn-float-site` / `hn-float-traffic` / `hn-float-konv`, all `ease-in-out infinite` with different durations (8s / 7s / 9s) and negative delays (0 / -2.5s / -5s) so the cards drift out of sync over time, reading as organic rather than synchronized. Disabled on mobile and via `prefers-reduced-motion`.

**Scarcity badge** ("Aktuell 2 freie Plätze · Mai") — moved out of the cluster entirely. Now sits in `.copy` between `.cta-row` and `.trust` as a `.badge.badge--inline` (orange pulse dot + pill chrome). Lives in the conversion zone rather than fighting the visual cluster.

**Hero CSS budget** in `angular.json` bumped to 200kb warn / 300kb error covers this — the hero CSS grew by ~250 lines for the new typography mockup + 3D wrappers.

### Showcase wheel — 3 new templates integrated (uncommitted, 2026-05-22)

All three placeholder cards in the homepage marquee replaced with real templates from `~/Documents/Business/Webdev/Templates/Website Templates/`. Source templates were edited before copying — the in-repo copies under `public/showcase/[slug]/` are the patched versions, not the originals.

**Cards now in `.showcase-new` (6 unique, no placeholders):**
- 01 Trattoria Marconi · Restaurant & Gastronomie *(unchanged)*
- 02 Schreinerei Hollmann · Handwerk *(unchanged)*
- 03 Praxis Lindner · Physio *(unchanged)*
- 04 **Altstahl Velomanufaktur** · Manufaktur & Handwerk *(replaced Friseur)*
- 05 **Bredow & Partner** · Recht & Beratung *(replaced Kanzlei)*
- 06 **Werft 11 Brauwerk** · Brauerei & Gastronomie *(replaced Café)*

Selected on design quality from the templates folder: bredow → maps onto the navy professional-services register the Kanzlei placeholder was built to evoke; werft-11 → fills the F&B lane formerly held by the Café placeholder; altstahl → adds a Manufaktur / cinematic-dark register not covered by any existing card.

**Per-card setup (each):**
- HTML copied to `public/showcase/[slug]/index.html`
- Screenshot at `public/showcase/[slug].png` (1440×900, matches the trattoria/schreinerei/praxis convention)
- Both the primary card AND the duplicated card in the marquee loop updated in `home.component.html` — the loop only stays seamless if both sets match.

**Screenshots generated via headless Chrome** (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --headless --disable-gpu --hide-scrollbars --window-size=1440,900 --screenshot=... file://...`). Werft-11 specifically needed `--virtual-time-budget=4000` because its `.draw-mask` headline reveal animation hadn't fired in the first capture — the headline rendered as empty bars until the JS reveal ran. Re-screenshotting any of these after a template edit needs the same flag for werft-11; altstahl + bredow render synchronously and don't need it.

**Template-side fixes applied before copying** (all in the templates folder originals; the showcase copies inherit them):

*werft-11-brauwerk:*
- Mobile-menu `.mobile-menu` (`position: fixed; inset: 0` with only `transform: translateY(-100%)` to hide) was leaking through to desktop — its `.m-foot` (Direkt / phone / Wilhelmsburg) sat at exactly `y=0` after the translate. Added `display: none` default + `display: flex` only at `≤720px`.
- Ticker `.ticker` was `position: fixed; top: 70px` and overlapped with the navbar. Changed to `position: relative; margin-top: 78px` so it sits in normal flow above the hero — only the navbar stays pinned to the viewport top.
- Removed `.nav.scrolled` padding-shrink (desktop + mobile) so a gap never reopens between nav and the now-static ticker.
- 3 broken Unsplash 404s replaced (weizen bier, dock stout, founder portrait at the brewery).

*altstahl-velomanufaktur:*
- Same mobile-menu leak — same fix.
- Removed `on-hero` class from the nav, made nav background opaque (`var(--bg)` + solid `var(--line)` border-bottom), removed `.nav.scrolled` shrink — the cinematic-overlay design was making white nav text on cream body unreadable once the hero was no longer behind it.
- Added `margin-top: 55px / 62px` (desktop/mobile) to `.hero` + `min-height: calc(100dvh - 55px / -62px)` so the hero sits cleanly below the nav and still fills the viewport exactly.
- Added `padding-top: 96px / 64px` (desktop/mobile) inside `.hero` so the headline can never butt up against the navbar even on tall hero-content layouts.
- Slimmed navbar (padding `16px → 10px`), removed DE/EN `.nav-lang` element entirely, added `white-space: nowrap` on `.nav-phone` so the workshop phone number doesn't wrap.
- Removed the entire `.hero-meta` row (MODELL №04 / Werkstatt-Nr. / BERLIN · KREUZBERG · DE) and the three `.chips` (Chromoly · Reynolds 853, Hand-built · Berlin-Kreuzberg, Lebenslange Rahmen­garantie) — both were cluttering the hero per user direction.
- 5 broken Unsplash 404s replaced (mountainbike, gravel bike, Brooks saddle, Pinion drivetrain, Shimano brake lever).

*bredow-partner:* no edits required before copying.

### AGB page (new — created during this session)

- **Page didn't exist before.** Built from scratch following the user's own [Website MVP Agreement](../design-drops/website-mvp-agreement.pdf) framework — B2B-only, Integration-only on legal text, 30-day bugfix window, pre-existing framework stays with Developer.
- 16 numbered sections (`.agb-page-new`) with Sacramento numerals matching the Datenschutz spine, paper-light palette, reading column ~820px.
- Key clauses worth knowing about for future edits:
  - **§ 2 Leistungsumfang** — categorical scope listing (Frontend / Backend / SEO-Grundlagen / Rechtliche Seiten / Infrastruktur) with explicit "Made by Gehrke Studio" footer attribution as standard.
  - **§ 3 Nicht enthalten** — 13 explicit exclusions including "Verfassen oder Prüfen rechtlicher Texte" and "Drittanbieter-Gebühren".
  - **§ 8 Nutzungsrechte** — the load-bearing IP split. Client owns the final delivered website; the pre-existing framework/template/components stay with the developer; client gets a perpetual non-exclusive license. Portfolio rights + footer attribution preserved.
  - **§ 10 Post-Launch** — explicit Bug-Definition + 30-day free bugfix window + 5-item list of what's NOT a bug (third-party changes, browser/OS updates, content changes, new features, changes to client-provided text).
  - **§ 11 Haftung** — three explicit exclusions: bereitgestellte Inhalte, Drittanbieter, mittelbare Schäden. Cap at Auftragswert.
- Route added at `/agb`. SEO config added in `seo.service.ts`. Footer link added next to Impressum + Datenschutz.
- **Stand-Datum is `21. Mai 2026`** — update it whenever the text changes.
- **Not yet legally reviewed.** Marked as DRAFT in the HTML comment at the top of the file. Pricing intentionally absent per user direction (always per-Angebot). User wants lawyer review before publication.

### Angular framework: 19.2 → 21.2 upgrade (committed 2026-05-23)

Sequential upgrade via `ng update` schematics in two clean commits:
- **19.2 → 20.3** (`18a9845`): `provideServerRendering` moved from `@angular/platform-server` to `@angular/ssr`; `provideServerRoutesConfig` replaced with `withRoutes()` arg; `DOCUMENT` moved from `@angular/common` to `@angular/core` (seo + recaptcha services); TypeScript bumped 5.7 → 5.9.
- **20.3 → 21.2** (`fa8dc33`): control-flow migration ran as **mandatory** in v21 — `*ngIf`/`*ngFor`/`*ngSwitch` converted to `@if`/`@for`/`@switch` across 8 files (home, contact, demo components + navbar + cookie-consent); deprecated bootstrap options in `main.server.ts` migrated to providers.

Optional migrations verified no-op for this codebase: `use-application-builder` (already on `@angular-devkit/build-angular:application`), `router-current-navigation` (no usages of `Router.getCurrentNavigation()`).

**Heads-up for future sessions:** Node 24.14.1 is flagged "Unsupported" by Angular CLI. Build works today (5.0s, all 11 routes prerendered) but Angular 21's officially supported Node versions are 20.x and 22.x LTS. If you hit weirdness, downgrade Node first.

### Forms hardening + reCAPTCHA v3 → v2 invisible migration (uncommitted, 2026-05-23)

End-to-end test of `/demo` and `/kontakt` revealed `reCAPTCHA: browser-error` once the EmailJS template's V2 verification toggle was enabled — cross-version mismatch (v3 token validated against v2 secret). EmailJS only supports v2 server-side verification natively, so the frontend was migrated to v2 invisible. See `### reCAPTCHA v2 invisible service` above for the keeper details.

Bundled into the same session:
- **Demo + Kontakt success states** now hide the eyebrow + h2 + lead via `@if (!sent)` so the green-tick + title + thank-you text stand alone. (`demo.component.html`, `contact.component.html`)
- **Demo submit `scrollIntoView({ block: 'center' })`** on the form card via `setTimeout(0)` after `sent = true` — the form-height collapse on success was dumping the viewport into the footer. Kontakt didn't need it (form shorter, success state stays in view). (`demo.component.ts`)
- **Both submit `catch` blocks** and both auto-reply `catch` chains now log the actual error (`console.error('[demo|contact] submit failed:', err)` / `console.warn('[demo|contact] auto-reply failed:', err)`) instead of swallowing silently. Critical for debugging EmailJS failures since they're otherwise invisible.
- **Auto-reply payload** gained a `to_email: this.form.email` field — `template_yxsrs34` can route by either `{{from_email}}` or `{{to_email}}`.
- **Auto-reply template (`template_yxsrs34`) config** finalized in EmailJS dashboard: subject `Ihre Anfrage ist bei uns eingegangen, {{from_name}}!`; To Email `{{from_email}}`; reCAPTCHA verification toggle **disabled** (mandatory — toggling it on silently blocks delivery with no History entry).

**Known issue, deferred:** one test run produced two main-template sends 2 seconds apart (one populated, one empty payload). Couldn't reproduce on retry. Possibly a missed-click on the invisible recaptcha challenge popup, possibly hydration-related double-fire. Re-verify in production after deploy.

### Navbar Safari clip fix + showcase eyebrow tweak (uncommitted, 2026-05-23)

- **`.fn-brand .word` `overflow: hidden` → `clip-path: inset(0 -1em)`**: floating navbar's per-letter slide-up animation clipped the rightmost glyph in Safari ("Gehrk Studi" instead of "Gehrke Studio") — kerning/subpixel overhang past the inline-flex content-box. Chrome rendered fine. Fix keeps `inline-flex` layout (chars on one line, parent sizes to content) but swaps `overflow: hidden` (clips both axes) for `clip-path: inset(0 -1em)` (vertical only, horizontal bleeds). (`navbar.component.css:319`)
- **Homepage showcase eyebrow:** "Drei Branchen · Ein Maßstab" → "Jede Branche · Ein Maßstab". Wheel now has 6 unique cards (not 3), and dropping the number future-proofs the line. (`home.component.html:510`)

## Where things live

| Thing | Location |
|---|---|
| **Canonical design reference** | `DESIGN_SYSTEM.md` (repo root) |
| Homepage all sections | `src/app/pages/home/home.component.{html,css,ts}` |
| Leistungen (redesigned) | `src/app/pages/leistungen/leistungen.component.{html,css,ts}` |
| Projekte (redesigned) | `src/app/pages/projekte/projekte.component.{html,css,ts}` |
| Über uns (redesigned) | `src/app/pages/about/about.component.{html,css,ts}` |
| Kontakt (redesigned + reCAPTCHA) | `src/app/pages/contact/contact.component.{html,css,ts}` |
| Demo (redesigned + reCAPTCHA) | `src/app/pages/demo/demo.component.{html,css,ts}` |
| Blog (redesigned) | `src/app/pages/blog/blog.component.{html,css,ts}` |
| Impressum (redesigned) | `src/app/pages/impressum/impressum.component.{html,css,ts}` |
| Datenschutz (redesigned) | `src/app/pages/datenschutz/datenschutz.component.{html,css,ts}` |
| AGB (new this session) | `src/app/pages/agb/agb.component.{html,css,ts}` |
| 404 (redesigned) | `src/app/pages/not-found/not-found.component.{html,css,ts}` |
| reCAPTCHA v3 service | `src/app/services/recaptcha.service.ts` |
| EmailJS service | `src/app/services/emailjs.service.ts` |
| Navbar (static + floating) | `src/app/components/navbar/` |
| Footer | `src/app/components/footer/` (Rechtliches column: Impressum / Datenschutz / AGB) |
| Cookie banner | `src/app/components/cookie-consent/` |
| Global styles + font links | `src/styles.css`, `src/index.html` |
| Design intake | `design-drops/Homepage-Mobile.html` (homepage drop) + `design-drops/new-hero.html` (variant 08 isometric editorial — current hero source of truth) |
| Routes | `src/app/app.routes.ts` |

## What's still blocking publish

### Visual assets — consolidated checklist (confirmed status as of 2026-05-22)

| Area | Item | Status |
|---|---|---|
| Hero cluster | All three frames (01 Design / 02 Sichtbarkeit / 03 Anfragen) | ✓ Self-contained — typography mockup + UI mockups, no real images needed |
| Showcase carousel | Friseur slot → Altstahl Velomanufaktur | ✓ Replaced — screenshot + `/public/showcase/altstahl/index.html` |
| Showcase carousel | Kanzlei slot → Bredow & Partner | ✓ Replaced — screenshot + `/public/showcase/bredow-partner/index.html` |
| Showcase carousel | Café slot → Werft 11 Brauwerk | ✓ Replaced — screenshot + `/public/showcase/werft-11/index.html` |
| Leistungen | 3 pillar visuals (`.lst-visual-placeholder`) | ✗ "Bild folgt" boxes |
| Projekte | Case study 01 vorher/nachher | ✗ 3:4 placeholder boxes |
| Projekte | Case study 02 vorher/nachher | ✗ 3:4 placeholder boxes |
| Projekte | 9 marquee placeholder slots | ✗ "Weitere Projekte folgen" cards |
| About | Portrait of Piet (`.abt-portrait-placeholder`) | ✗ "Portrait folgt" box |
| Blog | 6 article covers (`.blg-article-cover`/`.blg-featured-cover`) | ✗ "Cover folgt" gradient placeholders |
| Site-wide | OG image (`/public/OG_image.png`) | ✓ Confirmed final |
| Site-wide | Favicon (`/public/Favicon.png`) | ✓ Confirmed final |

Net new assets needed: ~**3 leistungen visuals + ~10 projekte visuals + 1 portrait + 6 blog covers ≈ 20 net images** (a few may be illustrations rather than photography). The hero is now image-free; the showcase wheel is fully populated with real templates.

### Blockers (must do)

1. **Leistungen visuals are placeholder boxes** — 4:5 "Bild folgt" boxes sit where the pillar visuals should go. Need real product screenshots (lead-form, CRM flow, search results) or designed mockups.
2. **Projekte case-study visuals are placeholder boxes** — vorher/nachher 3:4 boxes with red/green tag chips on both case studies, plus 9 marquee placeholder cards. Real before/after images don't exist for any of the 3 real showcase sites; either generate mockups or replace case studies with a different structure. **This is the focus of the next session — see "Next session" below.**
3. **About — portrait of Piet** needs to land at the `.abt-portrait-placeholder` slot. The placeholder already has the right shape (4:5 gradient + "Portrait folgt" label) — drop a real photo into `public/portrait.jpg` and swap the placeholder for an `<img>`.
4. **Blog — 6 article covers** (`.blg-article-cover` variants 1–6). Until real covers exist, the palette-rotating gradients give visual variety; replace with real cover photography/illustrations when articles are written.
5. ~~End-to-end test of `/demo` and `/kontakt` forms~~ — **Done 2026-05-23 on localhost.** Both forms verified end-to-end: lead email arrives, customer auto-reply delivers, reCAPTCHA verifies. Required v3 → v2 invisible migration (see "Forms hardening + reCAPTCHA migration" above) because EmailJS only supports v2 server-side. **Re-verify in production after deploy** — one test run produced a duplicate main-template send (one empty payload) that didn't reproduce on retry. Could be a missed-click on the recaptcha challenge popup or a hydration double-fire; worth confirming in the live environment.
6. **AGB needs lawyer review before publication** — drafted on the Gehrke Studio MVP Agreement framework. Stand-Datum currently `21. Mai 2026`. Specific clauses to confirm with counsel: §7 (payment), §8 (IP split / perpetual non-exclusive license language), §10 (30-day bugfix window vs statutory Gewährleistung), §11 (Auftragswert cap).
7. **Bild- und Drittanbieter-Nachweise** — once real images, stock photos, or third-party assets land on the site, add a Bildnachweise/Quellen subsection (Impressum or a separate Credits page). Note: the 3 new showcase templates (altstahl, bredow, werft-11) use external Unsplash photography — log credits when this page is created.
8. **Re-deploy + Search Console re-indexing** — the canonical-tag bug from a prior deployment caused `/demo`, `/kontakt`, `/leistungen`, `/ueber-uns` to be reported as duplicates of `/`. The current build has correct self-canonicals. After the next deploy: URL-Inspection + "Indexierung beantragen" on each of those 4 URLs, plus resubmit the sitemap.

### Resolved during the redesign sweep

- ~~6 pages on legacy design~~ → **all pages redesigned.** Über uns, Kontakt, Demo, Blog, Impressum, Datenschutz, 404 all on the new design language.
- ~~Static nav contrast on legacy pages~~ → no legacy pages left, every hero is either warm graphite or paper-light with the new vocabulary.
- ~~404 page~~ → redesigned as `.nf-page-new`.
- AGB page added (didn't exist before).
- ~~Hero cluster needs 4 real images~~ → hero rebuilt as `.stage3d` (variant 08). Three frames are self-contained (typography mockup + UI mockups), zero real images required.
- ~~Showcase carousel 3 placeholder cards (Friseur/Kanzlei/Café)~~ → all three replaced with real templates (Altstahl, Bredow & Partner, Werft 11) from the templates folder. Wheel is now 6 unique real cards, fully populated. See "Showcase wheel — 3 new templates integrated" above for the template-side fixes applied before copying.
- ~~Angular 19.2 framework~~ → upgraded to 21.2 via sequential `ng update` schematics (commits `18a9845`, `fa8dc33`). Control-flow migration ran as mandatory in v21.
- ~~Safari floating-navbar brand clip~~ → fixed via `clip-path: inset(0 -1em)` on `.fn-brand .word`.

### High priority

6. Mobile QA on real devices — hero + nav are reviewed and approved; sections 2–8 (value, process, qbridge, showcase, honest, faq, final) had their mobile @media rules ported from the drop but haven't been visually verified per-section yet. **Next session starts here.**
7. Cross-browser smoke (Safari ✓ so far, Chrome + Firefox pending; `backdrop-filter` renders differently across engines).
8. Confirm cookie banner still fires GTM/GA correctly after redesign.
9. ~~Per-page SEO meta via `SeoService`~~ — **Done.** All 12 page components call `seo.setPageSEO(...)` in `ngOnInit`.
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

## Next session — rework the Projekte showcase

**The page sweep is done. The next focus is making the Projekte page the strongest showcase on the site — clearly better than the homepage showcase.** User direction: "the showcase there should be better than on the homepage".

Current state of `/projekte` (commit reference: Projekte page redesign, summarised earlier in this file):

- 5 sections under `.prj-*-new`: hero → marquee (`.prj-grid-new`, with the auto-scrolling `.prj-marquee` row of 12 cards, 3 real + 9 placeholder) → case study 01 (`.prj-case-1-new`, cream) → case study 02 (`.prj-case-2-new`, paper-light) → final CTA.
- Real cards: Trattoria Marconi, Schreinerei, Praxis. Their screenshots live at `public/showcase/*.png`.
- Case studies are still **fictional** (Elite Real Estate, GreenTech Solutions) with placeholder vorher/nachher 3:4 boxes.

Homepage showcase (`/`, `.showcase-new` section in `home.component.{html,css,ts}`) currently uses the same `public/showcase/*.png` screenshots in a simpler grid of cards. **It's the visual bar to beat on Projekte.**

### What "better than home" probably means

Things the home showcase deliberately keeps simple (because it's one section of many on a long page) but the Projekte page can do more with, since it's the dedicated portfolio page:

- **Larger, scroll-told case studies** — each real project gets a full vorher/nachher narrative with a problem statement, the move, the result; not just a card.
- **Real before/after imagery** — Projekte blocker #2 is also a content blocker, but the *layout* should be ready for real assets when they arrive. Right now both case studies are fictional companies, which is the wrong direction.
- **A stronger marquee or replacement** — the auto-scrolling 12-card marquee is dense but undifferentiated. Possible directions: replace with a curated 3-up "featured projects" row + a separate marquee of upcoming/teaser slots, or interactive hover states that reveal a project preview.
- **Project taxonomy** — categories (Webdesign / Webentwicklung / SEO) as visible chips on each card, so a Projekte visitor can scan "what kind of work do they do" at a glance.
- **A "what we built and why" voice** — long-form prose under each case study, similar to how leistungen pillars carry copy. Currently Projekte case studies are placeholder structure only.

### Constraints

- Stay on the `.prj-*-new` wrapper family. Don't break the existing routes or the `public/showcase/*.png` paths.
- `DESIGN_SYSTEM.md §7.14` documents the `.prj-marquee` JS-driven auto-scroll behavior — if you replace or restructure the marquee, update §7.14 to reflect the new component.
- Real screenshots only exist for the 3 real projects today; case studies must work with placeholders for vorher/nachher imagery until real before/after assets exist.
- Per the design system, after the page lands update DESIGN_SYSTEM.md with any new §7 component or §9.4 keyframe.

### Where to start

1. Open `/projekte` and `/` side-by-side in the browser at `http://localhost:4201`. Compare what each section does.
2. Read `src/app/pages/projekte/projekte.component.{html,css,ts}` and `src/app/pages/home/home.component.{html,css,ts}` (the `.showcase-new` section specifically).
3. Sketch the differential: what would make Projekte unambiguously the strongest portfolio view on the site? Discuss with the user before rewriting.

### Backlog still relevant after the sweep

- **Mobile section-by-section QA** on the homepage (value, process, qbridge, showcase, honest, faq, final) — mobile rules were ported but not visually verified per-section. Re-pick this up once Projekte is settled.
- **DESIGN_SYSTEM.md doc drift** — the redesign sweep introduced several new patterns that aren't documented yet:
  - `.dmo-toggle` (toggle switch on paper-light)
  - `.dmo-pill` / `.knt-pill` (multi-select pill with check badge)
  - `.dmo-trust` (orange-bar + uppercase label trust signal row)
  - `.recaptcha-note` style disclaimer
  - per-page hero/header reveal patterns
  - These should become §7.15 / §7.16 / §7.17 entries when the design feels settled.

### Backlog: mobile section-by-section QA (deferred from prior session)

Hero + navbar mobile are signed off. The other homepage sections (value, process, qbridge, showcase, honest, faq, final) had their mobile @media rules ported from the drop but haven't been visually verified per-section yet. Re-pick this up once the page sweep is further along.

## Currently in progress — mobile process section (2026-05-23)

**What we're doing:** iterating on the mobile version of the homepage `process-new` section. The user wants the desktop sticky-scroll-stack mechanic on phone too (cards pull onto each other as you scroll), with the progress indicator (`.ps-rail`) above and a "Bereit für Ihre Vorlage" CTA after.

**Where the code lives:**
- HTML: `home.component.html` lines ~345–485 (process section). The new `.ps-cta` block sits inside `.ps-stage` after `.ps-grid`.
- CSS: `home.component.css`. Mobile rules in `@media (max-width: 480px)` starting around line ~2250. Search for `=== PROCESS (sticky scroll-stack on phone`.
- TS: `home.component.ts` — `updateProcess()` handles `activeStep` tracking (when a card's `rect.top` crosses 45% of viewport) + smooth-scrolls the rail to center the active step on mobile.

**Current layout state (as of the last iteration):**
- `.ps-rail` → `position: relative` (in normal flow, scrolls away naturally with the page like the intro text above it). Each step is a text-only chip with a gold underline `::after` bar for the active state. No per-step pill border or background.
- `.ps-card` → `position: sticky !important; top: 185px !important` for all three. Card 1 has `transform: translateY(20px)`, card 2 has `translateY(40px)` (mirroring desktop staircase peek). `margin-bottom: 20vh` between cards.
- `.ps-cta` → new CTA block after the cards, "Bereit für Ihre / Kostenlose Website Vorlage anfordern / Individuell für Ihr Unternehmen erstellt". Orange button on the terra orange section. Pattern modeled after `.show-cta` in the showcase section. Appears on desktop too (not gated mobile-only).

**Iteration history (so future-you doesn't repeat what was already tried):**
- v1: horizontal swipe filmstrip → user wanted desktop sticky-stack mechanic on phone instead.
- v2: rail sticky at top:78, cards sticky at top:148 → user complained the rail "becomes sticky" and wanted it static.
- v3: rail static at relative, cards sticky at top:185 → user complained "the viewport doesn't get static in the right place", wanted rail visible during card-stack.
- v4: rail sticky again → user said "make it behave like the text above it on scroll" (i.e. static).
- v5 (current): rail static, cards sticky at top:185. User keeps oscillating; commit current state and let them validate.

**Open questions for next session:**
- The user repeatedly asks for the rail to be both "static" AND "stay visible while cards stack" — these are contradictory with the current document layout (rail above cards in flow → rail must scroll away when cards stick). Worth asking them to clarify which they value more, or proposing an HTML restructure (e.g. nest rail INSIDE `.ps-stack` so they share a release point).
- Card 3's dwell time was set to 20vh (matching cards 0/1) so it "fully covers card 2" with the same scroll duration, but the user also wants the CTA "pretty close behind card 3" — these are in tension. Current compromise favors card-3 dwell; user may want to tune.
- The `updateProcess()` JS still applies a `translateY` to the rail for the desktop rail-follow effect — overridden via CSS `transform: none !important` on mobile. If we restructure the layout, this override might need to go.

**Watch out for:**
- `position: sticky` on `.ps-card` only works because `.ps-stack`'s parent `.ps-grid` has `overflow: visible`. Don't accidentally add `overflow: hidden` anywhere up the tree.
- The tablet `@media (max-width: 1080px)` rule sets `.ps-card { position: relative; top: 0 !important; margin-bottom: 32px }`. The phone `@media (max-width: 480px)` rule has to use `!important` to override it since both have the same specificity and source order favors the later (phone) rule but the `!important` on top: 0 in the tablet rule is matched by `top: 185px !important` in mobile.

## Open question (kept for reference)

Pick one before final launch:
- **Ship homepage only** — fastest path, accept that nav links lead to legacy pages.
- **Redesign all pages first** — bigger lift, consistent UX before launch.
