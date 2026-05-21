# DESIGN_SYSTEM — Gehrke Studio

Canonical reference for the redesigned site at gehrkestudio.com. Everything
below is extracted from the redesigned homepage, which is the source of
truth. When a new page is built, it must conform to what's documented
here — and when this doc and the homepage disagree, **the homepage wins
until the disagreement is reconciled in a commit**.

The doc is organised so that the indices stay stable: §3.3 means the cursive
accent forever, §7.13 means the hand-drawn arrow forever. New components
get the next free index in §7. New keyframes get appended to §9.

---

## §1. Foundation

### §1.1 Voice

The visual voice is **warm-confident**: dark warm grounds (graphite, terracotta,
graphite-black) crossed with cream/paper sections. Orange (`#f26b1f`) is the
single brand accent — never a second hue. The hand-drawn touches (Sacramento
cursive accents, drawn arrow, off-axis rotations) keep the page from reading
as a SaaS template. Motion is **scroll-driven and one-shot per element** —
you earn each animation by scrolling to it.

### §1.2 Defaults

- Page background: dark warm graphite (`#050505` / `#0d0b0a` depending on section)
- Default text family: `Manrope, system-ui, sans-serif`
- Default body text: 16–18px, `line-height: 1.55–1.6`, `letter-spacing: normal`
- All interactive elements have a `:focus-visible` ring (§8.2)
- All scroll-triggered motion respects `prefers-reduced-motion` (§9.6)

---

## §2. Colour

### §2.1 Global tokens

Defined in [src/styles.css](src/styles.css). These are the base layer; section
wrappers override them locally.

```css
--color-bg:                #050505
--color-bg-secondary:      #0B0B0B
--color-surface:           #121212
--color-text-primary:      #EDEDED
--color-text-secondary:    #9CA3AF
--color-text-muted:        #6B7280
--color-accent-primary:    #22D3EE   /* LEGACY — see §2.4 */
--color-accent-secondary:  #67E8F9   /* LEGACY */
--color-border:            rgba(255, 255, 255, 0.08)
--glass-bg:                rgba(5, 5, 5, 0.85)
```

### §2.2 Brand orange

The single accent across every section, scoped as `--orange` on each `.X-new`
wrapper:

```
--orange:      #f26b1f   /* primary */
--orange-soft: #ff8a47   /* hover lift, glow */
--orange-deep: #d8551a   /* pressed, deep shadow */
--orange-hot:  #ffa86b   /* edge of card energy-border conic */
```

Tints used in the energy-border conic: `#ffb382`, `#fff1e0` (see §7.5).

### §2.3 Section palettes

Each section declares its full token set on `.X-new`. Listing the load-bearing
ones; full sets live in [src/app/pages/home/home.component.css](src/app/pages/home/home.component.css).

| Section          | Background        | Text          | Notes                          |
|------------------|-------------------|---------------|--------------------------------|
| `.hero-new`      | `#0d0b0a`         | `#f6f1ec`     | warm graphite, orange CTA      |
| `.value-new`     | `#efe7df` (cream) | `#1a1612`     | dark cards on cream (§7.5)     |
| `.process-new`   | `#b8461c` terra   | `#fff5ea`     | warmest section, gold accent   |
| `.qbridge-new`   | `#1f1813`         | `#e9dfd2`     | graphite, large script type    |
| `.showcase-new`  | `#14100c`         | `#e9dfd2`     | deepest graphite, gold accent  |
| `.honest-new`    | `#f4ede1`         | `#1a1612`     | light beige, intimate finale   |
| `.faq-new`       | `#0a0807`         | `#f6f1ec`     | near-black, deepest section    |
| `.final-new`     | `#0d0b0a`         | `#f6f1ec`     | mirrors hero, closes the loop  |

The dark-card sub-palette inside `.value-new.value-cards-new`:

```
--card-bg:          #1a1612
--card-bg-lift:     #241e19
--card-bg-panel:    #2d2620
--card-text:        #fbf6eb
--card-text-dim:    #a8a098
--card-line:        rgba(255, 245, 234, 0.06)
--card-line-strong: rgba(255, 245, 234, 0.18)
```

### §2.4 Legacy cyan accent

`--color-accent-primary: #22D3EE` is **legacy** — it predates the redesign and
still drives the global `:focus-visible` ring and some unredesigned-page
styles. It should be replaced with brand orange `#f26b1f` once the redesign
ships sitewide. Until then, override on a per-section basis if cyan
contaminates a redesigned surface (see `.honest-new .seal` precedent in
[home.component.css](src/app/pages/home/home.component.css)).

---

## §3. Typography

### §3.1 Families

Loaded via Google Fonts in [src/index.html](src/index.html):

- **Manrope** — `400 / 500 / 600 / 700 / 800`. Default for everything:
  body, headings, labels, navigation. Wide vertical metrics suit the
  large `clamp()` headings.
- **Sacramento** — single weight script. Used **only** for `.accent`
  cursive insertions inside headings (§3.3).
- **Inter** — `300–900`. Legacy fallback, defined with size-adjust
  metrics on `html`. Still used by un-redesigned pages.
- **Playfair Display** — `400–600`. Legacy serif, kept for un-redesigned
  pages, **do not introduce** into new redesigned surfaces.
- **Material Symbols Outlined** — icon font. Use sparingly; prefer inline
  SVG for any icon that animates or recolours.

### §3.2 Scale

Headings use `clamp()` so they breathe responsively without a per-breakpoint
override. Body sizes are fixed and adjusted only at the `≤480px` breakpoint.

```css
/* H1 — hero only, one per page */
font-weight: 800;
font-size: clamp(56px, 6.4vw, 104px);
line-height: 0.95;
letter-spacing: -0.035em;

/* H2 — section headline */
font-weight: 800;
font-size: clamp(44px, 4.6vw, 76px);
line-height: 1.02;
letter-spacing: -0.03em;
text-wrap: balance;

/* H3 — card / sub-block */
font-weight: 700;
font-size: clamp(22px, 1.8vw, 28px);
line-height: 1.15;
letter-spacing: -0.015em;

/* Body */
font-size: 16px / 18px;
line-height: 1.55–1.6;
text-wrap: pretty;

/* Eyebrow / micro-label */
font-size: 12–13px;
letter-spacing: 0.18em;
text-transform: uppercase;
font-weight: 500;
```

`text-wrap: balance` on headings, `text-wrap: pretty` on body. Both are
load-bearing for layout stability — keep them.

### §3.3 Cursive accent (`.accent`)

Single most distinctive type treatment on the site. A Sacramento word
inserted as a `<span class="accent">` inside an h2 or h1, rotated slightly,
and coloured orange (or gold inside `.process-new`).

```html
<h2>Wir erstellen <span class="accent">komplette</span> Websites</h2>
```

```css
h2 .accent {
  font-family: 'Sacramento', cursive;
  font-weight: 400;
  color: var(--orange);
  font-size: 1.38em;            /* scales with parent — keep relative */
  line-height: 0.85;            /* tightens the visual gap */
  display: block;               /* lands on its own line */
  transform: rotate(-3deg);
  transform-origin: left center;
  margin: 4px 0 4px -4px;       /* nudges into the surrounding letters */
  width: fit-content;
  padding-right: 0.3em;         /* trailing tail of script tails */
}
```

Per-section rotation:
- `.value-new` → `-3deg`
- `.hero-new`, `.final-new` → `-2deg`
- `.process-new` → `-2deg`, colour `var(--gold)` (`#ffc88a`) instead of orange

**Authoring rules:**
- One accent per heading, max. Two accents in one h2 reads as decoration,
  not voice.
- Pick the word that the sentence pivots on (`komplette`, `kostenlos`,
  `ehrlich`). Adjectives and adverbs work; verbs rarely do.
- Rotation must be slight (`-2` to `-3deg`) and always negative — positive
  rotation reads as a slip, not a hand-drawn flourish.

### §3.4 Wordmark gradient

Used only in the footer giant wordmark. Top-to-bottom alpha fade through the
text, with the punctuation dot rendered in solid orange so it doesn't fade.

```css
background: linear-gradient(180deg,
  rgba(246, 241, 236, 1) 0%,
  rgba(246, 241, 236, 0.32) 100%);
-webkit-background-clip: text;
        background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## §4. Spacing & Grid

### §4.1 Container

```css
.X-new .container {
  position: relative;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 56px;
}
```

Mobile (`≤480px`): `padding: 0 20px;`. Some sections also clamp at `≤640px`
with `padding: 0 24px`.

### §4.2 Vertical rhythm

```
Section padding (desktop):
  Hero          padding-top: 130px;  padding-bottom: 100px
  Value (state) padding: 120px 0 140px
  Value (cards) padding:  80px 0 120px
  Process       padding: 140px 0 160px
  Honesty       padding: 160px 0 180px
  Final         padding: 140px 0 160px

Section padding (≤480px):
  Reduce all of the above by ~40% (e.g. 140→84, 160→90).
```

Two adjacent same-section stanzas (e.g. value statement + value cards) get a
visible **seam** — handle it via `.guides` mask split (§5.3) and drop the
duplicate radial wash on the second stanza.

### §4.3 Grid: 12 columns

Every section's `.container` is a 12-col implicit grid. The `.guides`
decoration draws the 12 columns as 1px lines at low opacity so you can see
the rhythm during design review.

```html
<section class="X-new">
  <div class="X">
    <div class="guides"></div>
    <div class="container">
      ...
    </div>
  </div>
</section>
```

```css
.X-new .guides {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(to right, var(--line) 1px, transparent 1px);
  background-size: calc(100% / 12) 100%;
  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 8%, #000 92%, transparent 100%);
          mask-image: linear-gradient(180deg, transparent 0, #000 8%, #000 92%, transparent 100%);
  opacity: 0.55;
  pointer-events: none;
}

@media (max-width: 480px) {
  .X-new .guides {
    background-size: calc(100% / 6) 100%;   /* compress to 6 cols */
  }
}
```

Apply real `grid-template-columns: repeat(12, 1fr)` only when a layout
intentionally exploits the grid (e.g. the diagonal statement layout in
`.value-statement-new`). For most flex/auto layouts the 12-col guides are
just a visual reference.

### §4.4 Gap rhythm

- Card grids: `gap: 16–22px`
- Heading → body: `margin-bottom: 28–40px`
- Section internal blocks: `gap: 48–80px`

---

## §5. Section namespacing

### §5.1 The `.X-new` rule

Every redesigned section is wrapped in a `<section class="X-new">` element
where `X` is the section name (`hero`, `value`, `process`, `qbridge`,
`showcase`, `honest`, `faq`, `final`). All CSS for that section is scoped
under `.X-new`.

**Why:** legacy CSS still lives in component files. Common class names
(`.card`, `.bar`, `.eyebrow`, `.guides`, `.cards`) would collide. Scoping
under `.X-new` lets the redesign coexist with the legacy until the legacy
is removed. **Do not** introduce a redesign style at the global level
unless it genuinely is global (focus-visible ring, body lock for drawer).

### §5.2 Standard inner skeleton

```html
<section class="value-new">         <!-- root wrapper, sets --color-* tokens -->
  <div class="value">                <!-- background + padding holder -->
    <div class="guides"></div>       <!-- 12-col decoration -->
    <div class="container">          <!-- max-width 1440, padding 0 56px -->
      <div class="value-head">       <!-- eyebrow + h2 + sub -->
        <div class="eyebrow">
          <span class="bar"></span>
          <span class="num">02</span> · Leistungen
        </div>
        <h2>...</h2>
      </div>
      ...                            <!-- section body -->
    </div>
  </div>
</section>
```

### §5.3 Same-section seam

When a section is split into two adjacent stanzas of the same palette (e.g.
`.value-statement-new` + `.value-cards-new`), both sit under the same
`.value-new` root. To keep the seam invisible:

1. **Drop the radial wash on stanza 2.** The `.value::before` paint would
   otherwise double up and create asymmetric brightness at the join.
   ```css
   .value-new.value-cards-new .value::before { background: none; }
   ```

2. **Split the guides fade.** The default `.guides` mask fades top + bottom
   so guides don't slam into adjacent palettes. Inside a same-palette split
   that double-fades into a dark band at the join — kill the fade on the
   edge facing the other stanza.
   ```css
   .value-statement-new .guides { mask-image: linear-gradient(180deg, transparent 0, #000 10%, #000 100%); }
   .value-cards-new     .guides { mask-image: linear-gradient(180deg, #000 0, #000 90%, transparent 100%); }
   ```

3. **Keep one eyebrow.** Only stanza 1 carries the `01 · Section` eyebrow;
   stanza 2 gets a `<div class="cards-bridge">` connector instead (a short
   bar + one line of bridge copy).

---

## §6. Layout patterns

### §6.1 Two-column hero stage

Hero `.stage` is a CSS grid with the headline cluster left and the image
collage right. Image cluster pieces are absolutely positioned within their
own track, NOT inside the section root — so re-arranging the cluster doesn't
shift the type.

### §6.2 Diagonal statement (Value §02A)

Used for sections where the headline + subhead are the entire section. A
12-col grid with the headline anchored top-left and the sub anchored
bottom-right. The empty diagonal between them is the visual tension a
`.drawn-arrow` (§7.13) exploits.

```css
.value-statement-new .value-head {
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto minmax(60px, 1fr) auto;
  column-gap: 16px; row-gap: 24px;
  align-items: start;
  min-height: 460px;
  position: relative;
}
.value-statement-new .vh-headline { grid-column: 1 / span 8; grid-row: 1; }
.value-statement-new .value-sub   { grid-column: 6 / span 7; grid-row: 3;
                                    justify-self: end; align-self: end;
                                    max-width: 460px; }
```

### §6.3 Three-card row

Standard card row is 3 columns at desktop, full-width gap-stacked at
`≤480px`. Cards align to the top (`align-items: start`); their internal
layouts use flex column so the visual element and bullets push to the
bottom regardless of title length.

### §6.4 Filmstrip (Process)

Horizontal strip of cards driven by JS-managed `translateX` on desktop, and
native `scroll-snap` on mobile. Active card scales to `1`, neighbours to
`0.88`, far cards to `0.78`. Both edges fade behind a `mask-image` so
out-of-stage cards bleed off gracefully.

```css
.process-new .filmstrip-wrap {
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%);
}
```

---

## §7. Components

### §7.1 Eyebrow

Section-progress label. Always the first piece inside a section's headline
cluster.

```html
<div class="eyebrow">
  <span class="bar"></span>
  <span class="num">02</span> · Leistungen
</div>
```

```css
.X-new .eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  color: var(--text-dim);
  font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase;
  font-weight: 500;
  margin-bottom: 40px;
}
.X-new .eyebrow .bar { width: 32px; height: 2px; background: var(--orange); flex: none; }
.X-new .eyebrow .num { font-weight: 600; font-size: 14px; color: var(--orange); }
```

The `· Label` after the number is a literal middle-dot character (`·`,
U+00B7), not a hyphen. Don't replace with a slash or pipe.

### §7.2 Lead bar

A short orange rule above a subheadline or pull-quote. Visual gesture only —
no semantic role.

```html
<div class="value-sub">
  <span class="lead-bar"></span>
  <p>Vom Design bis hin zu allem ...</p>
</div>
```

```css
.value-sub .lead-bar {
  display: block;
  width: 28px; height: 2px; background: var(--orange);
  margin-bottom: 20px;
}
```

### §7.3 Primary CTA button (`.btn-primary`, `.sn-cta`, `.fn-cta`)

The single most-styled component on the site. Same effect (diagonal shine
sweep + arrow send-off + lift overshoot) on three surfaces: hero button,
static-nav CTA, floating-nav CTA. Keep them in sync.

```html
<a routerLink="/demo" class="btn-primary">
  Kostenlose Website Vorlage anfordern
  <span class="icon-circ" aria-hidden="true">
    <svg class="a a1"><!-- arrow -->...</svg>
    <svg class="a a2"><!-- arrow copy -->...</svg>
  </span>
</a>
```

**Resting style:**

```css
.btn-primary {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: inline-flex; align-items: center; gap: 12px;
  padding: 18px 26px;
  background: var(--orange);
  color: #fff;
  border-radius: 14px;
  font-weight: 600; font-size: 16px;
  box-shadow:
    0 18px 40px -16px rgba(242, 107, 31, 0.65),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  transition:
    transform .3s cubic-bezier(.3, 1.4, .4, 1),
    background .25s ease,
    box-shadow .3s ease;
}
.btn-primary:hover {
  transform: translateY(-4px);
  box-shadow:
    0 30px 60px -16px rgba(242, 107, 31, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}
```

**Diagonal shine sweep** — a 60%-wide white-ish band sweeps left-to-right
across the button on hover:

```css
.btn-primary::before {
  content: "";
  position: absolute; top: 0; left: -120%;
  width: 60%; height: 100%;
  background: linear-gradient(115deg,
    transparent 0%,
    rgba(255, 255, 255, 0.14) 50%,
    transparent 100%);
  transform: skewX(-14deg);
  transition: left .75s cubic-bezier(.4, 0, .2, 1);
  pointer-events: none;
  z-index: 1;
}
.btn-primary:hover::before { left: 130%; }
```

**Arrow send-off** — two stacked arrows inside `.icon-circ`. On hover, the
original arrow flies out top-right while a duplicate slides in from
bottom-left to centre:

```css
.btn-primary .icon-circ { position: relative; overflow: hidden; width: 28px; height: 28px; border-radius: 999px; background: rgba(255,255,255,.18); flex: none; }
.btn-primary .icon-circ .a    { position: absolute; top: 50%; left: 50%; transition: transform .48s cubic-bezier(.55, 0, .25, 1); }
.btn-primary .icon-circ .a.a1 { transform: translate(-50%, -50%); }
.btn-primary .icon-circ .a.a2 { transform: translate(-150%, 50%); }
.btn-primary:hover .icon-circ .a.a1 { transform: translate(50%, -150%); }
.btn-primary:hover .icon-circ .a.a2 { transform: translate(-50%, -50%); }
```

The same effect lives on `.sn-cta` (static nav CTA, pill-shaped, padding
`13px 22px`, `border-radius: 999px`) and `.fn-cta` (floating nav CTA, same
pill, with an extra entry animation). When adding a new CTA surface, **copy
the effect**, don't re-invent it.

### §7.4 Secondary CTA / ghost button

Outline-style on the same surfaces. Inherits the lift but skips the shine
and arrow send-off. Used as the second action in hero and final CTA rows
(e.g. "Mehr erfahren" next to the primary CTA).

### §7.5 Dark click-through card

Used inside `.value-cards-new`. Dark interior on the cream section background
— inverts contrast intentionally to make the cards read as a separate layer.
Whole card is a link.

```html
<a routerLink="/leistungen" class="card" aria-label="...">
  <span class="card-tag">Anfragen &amp; Kunden</span>
  <h3 class="card-title">Mehr qualifizierte <span class="accent">Anfragen</span></h3>
  <p class="card-sub">Anfragen, die wirklich zu Ihnen passen.</p>
  <div class="card-visual"><!-- micro-UI mockup --></div>
  <ul class="card-bullets">
    <li><span class="ck">✓</span>...</li>
  </ul>
</a>
```

```css
.value-new .card {
  position: relative; isolation: isolate;
  background: var(--card-bg);
  color: var(--card-text);
  border: 1px solid var(--card-line);
  border-radius: 14px;
  padding: 26px 26px 22px;
  display: flex; flex-direction: column; gap: 16px;
  text-decoration: none;
  transition: transform .35s ease, box-shadow .35s ease;
}
.value-new .card:hover {
  transform: translateY(-6px);
  box-shadow:
    0 30px 60px -20px rgba(232, 97, 44, 0.4),
    0 12px 24px -8px rgba(0, 0, 0, 0.5);
}
```

**Rotating energy border** — conic-gradient ring clipped to 3px via the
dual-mask trick. Pulses on hover with a soft orange drop-shadow.

```css
@property --vn-card-angle {
  syntax: '<angle>'; initial-value: 0deg; inherits: false;
}

.value-new .card::before {
  content: '';
  position: absolute; inset: -3px;
  border-radius: calc(14px + 3px);
  padding: 3px;
  background: conic-gradient(
    from var(--vn-card-angle),
    var(--orange) 0deg,
    var(--orange) 250deg,
    #ffb382 290deg,
    #fff1e0 310deg,
    #ffb382 330deg,
    var(--orange) 360deg);
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
          mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  opacity: 0;
  transition: opacity .3s ease;
  z-index: -1;
  pointer-events: none;
  filter: drop-shadow(0 0 12px rgba(232, 97, 44, 0.45));
}
.value-new .card:hover::before,
.value-new .card:focus-visible::before {
  opacity: 1;
  animation: vn-card-rotate-border 2.2s linear infinite;
}
@keyframes vn-card-rotate-border { to { --vn-card-angle: 360deg; } }
```

**Why the dual-mask trick:** `mask-composite: exclude` subtracts the
content-box mask from the full mask, leaving only the padding ring visible.
This lets the conic-gradient fill animate cleanly without a wrapper element.

### §7.6 Light card (process p-card)

Cream interior cards used in the filmstrip. Same anatomy as §7.5 but
inverted palette. No energy border — depth is conveyed by scale and shadow
instead.

```css
.process-new .p-card {
  flex: 0 0 clamp(360px, 38vw, 460px);
  aspect-ratio: 4 / 5;
  background: #fbf4ea;
  color: var(--ink-dark);
  border-radius: 20px;
  padding: 28px 28px 26px;
  transition: transform .55s cubic-bezier(.2, .7, .2, 1), opacity .45s ease;
}
.process-new .p-card.is-active {
  transform: scale(1);
  opacity: 1;
  box-shadow: 0 40px 80px -30px rgba(0, 0, 0, 0.45);
}
```

### §7.7 Static navigation

Transparent bar that overlays the hero. Brand + links + CTA, all
left-aligned via flex. Scrolls away with the page (not sticky). On legacy
(non-redesigned) pages this is currently broken — see CONTEXT.md blocker #3.

### §7.8 Floating pill navigation

Glass pill that appears after `~80vh` of scroll. Centred near the top,
`backdrop-filter: blur(20px)`, contains brand + links + CTA. Visibility
toggled via a `.is-visible` class set by the scroll listener.

```css
.floating-nav .fn-cta {
  transform: scale(0.85);
  opacity: 0;
  transition: background .25s ease, box-shadow .25s ease;
}
.floating-nav.is-visible .fn-cta {
  transform: scale(1);
  opacity: 1;
  animation: fn-cta-reveal .55s cubic-bezier(.4, 1.5, .5, 1) .5s backwards;
}
@keyframes fn-cta-reveal {
  from { transform: scale(0.85); opacity: 0; }
}
```

The `backwards` fill mode is load-bearing: it lets the hover `transform: translateY(-2px)` layer on top of the resting `scale(1)` without specificity wars — see §9.5.

### §7.9 Per-letter wave-flip link hover

Used on every nav link in both the static and floating bars. Each link text
is rendered as two stacked rows of character spans; on hover, the row slides
up `-100%` with a per-character stagger, revealing an identical duplicate
underneath. Reads as the word "flipping" upward letter by letter.

```html
<a routerLink="/leistungen">
  <span class="fn-text" aria-label="Leistungen">
    <span class="row" aria-hidden="true">
      <span class="ch">L</span><span class="ch">e</span><span class="ch">i</span>...
    </span>
    <span class="row" aria-hidden="true">
      <span class="ch">L</span><span class="ch">e</span><span class="ch">i</span>...
    </span>
  </span>
</a>
```

```css
.fn-text { display: inline-flex; flex-direction: column; height: 1.25em; line-height: 1.25; overflow: hidden; }
.fn-text .row { display: inline-flex; white-space: pre; flex: none; }
.fn-text .row .ch { display: inline-block; transition: transform .42s cubic-bezier(.7, 0, .2, 1); }
.fn-links a:hover .fn-text .row .ch { transform: translateY(-100%); }

.fn-text .row .ch:nth-child(1)  { transition-delay:   0ms; }
.fn-text .row .ch:nth-child(2)  { transition-delay:  22ms; }
/* ... 22ms per character, up to 198ms */
```

**Authoring note:** the duplicate row is a visual trick — `aria-hidden` it
and provide a single `aria-label` on the wrapping `.fn-text` so screen
readers say the word once.

### §7.10 Mobile nav drawer

Full-screen overlay (`position: fixed; inset: 0`) with a stacked link list
inside. Opens via the burger button, closes on link tap, Esc, backdrop tap,
or route change. Body gets `body.drawer-open { overflow: hidden }` to lock
scroll while open.

```css
.nav-drawer {
  position: fixed; inset: 0;
  background: rgba(13, 11, 10, 0.96);
  backdrop-filter: blur(20px);
  z-index: 200;
  opacity: 0; pointer-events: none;
  transition: opacity .35s ease;
}
.nav-drawer.is-open { opacity: 1; pointer-events: auto; }

.nav-drawer-inner a {
  padding: 18px 0;
  border-bottom: 1px solid rgba(246, 241, 236, 0.10);
  font-size: 24px; font-weight: 700;
  opacity: 0; transform: translateY(12px);
  transition: opacity .4s ease, transform .4s cubic-bezier(.2, .7, .2, 1);
}
.nav-drawer.is-open .nav-drawer-inner a {
  opacity: 1; transform: translateY(0);
}
.nav-drawer.is-open .nav-drawer-inner a:nth-child(1) { transition-delay: 0.08s; }
/* +0.05s per item, up to 0.33s for item 6 */
```

### §7.11 Footer

Gigantic gradient wordmark on top, 4-column link grid below, then a
bottom strip with copyright and a "stay in touch" pulse dot.

```css
.site-footer-new .footer-wordmark {
  font-weight: 800;
  font-size: clamp(80px, 17vw, 280px);
  line-height: 0.9;
  letter-spacing: -0.045em;
  /* gradient + clip — see §3.4 */
}
.site-footer-new .footer-wordmark .dot {
  color: var(--orange);
  -webkit-text-fill-color: var(--orange);
}
.site-footer-new .footer-cols {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
  gap: 56px;
}
```

Footer link hover: a 14px orange bar slides out under the link from width 0.

### §7.12 Cookie consent banner

Bottom-anchored banner with backdrop-blur and accept/reject controls. See
`src/app/components/cookie-consent/`. Fires GTM consent updates — do not
change behaviour without re-verifying tracking.

### §7.13 Hand-drawn connector arrow (`.drawn-arrow`)

A short orange arrow that draws itself on as the reader scrolls into a
section. Used to gesture from one element toward the next — e.g. from a
subheadline down toward where the following content arrives. Harmonises
with the cursive accent treatment from §3.3.

**Used on:** Leistungen statement → cards (first appearance). Reuse anywhere
two related blocks need a gestural connection across a stretch of empty
space.

#### Markup

```html
<svg class="drawn-arrow" viewBox="0 0 700 200" preserveAspectRatio="none"
     fill="none" aria-hidden="true">
  <path class="ah-path"
        d="M 660 22 C 560 32, 460 38, 360 70 C 260 102, 170 142, 90 168 C 70 172, 55 175, 42 177"
        stroke="var(--orange)" stroke-width="2.6"
        stroke-linecap="round" stroke-linejoin="round"
        pathLength="100"
        vector-effect="non-scaling-stroke" />
  <g class="ah-head" stroke="var(--orange)" stroke-width="2.6"
     stroke-linecap="round" stroke-linejoin="round"
     vector-effect="non-scaling-stroke">
    <path d="M 60 162 L 42 177" />
    <path d="M 62 192 L 42 177" />
  </g>
</svg>
```

Key authoring rules:

- The path is a **multi-segment cubic Bézier**, not a single arc. Multiple
  control points give it the organic, hand-drawn cadence — a clean arc reads
  as a UI connector, which is wrong here.
- The arrowhead is **two open stroke segments forming a `>`**, never a filled
  triangle. The strokes share the same `stroke-width`, `linecap`, and
  `linejoin` as the path so it reads as one drawn gesture.
- `pathLength="100"` lets the draw-on animation use `stroke-dasharray: 100`
  and `stroke-dashoffset: 100` regardless of actual path length — animate the
  offset to 0 to reveal the stroke.
- `vector-effect="non-scaling-stroke"` keeps the stroke crisp when the SVG
  is stretched via `preserveAspectRatio="none"` to fit a parent box.

#### Positioning

Position absolutely inside the section so the arrow can span empty space
between content blocks without disturbing the grid. Target a wide-rectangle
container (something like 600×180 to 800×220) — too narrow and the gesture
flattens; too tall and it loses its "horizontal traveling" feel.

```css
.section-something .drawn-arrow {
  position: absolute;
  left: 56px;            /* align with the container's left edge */
  right: 22%;            /* end of arrow tucks under the right-anchored block */
  bottom: -40px;         /* lets the tail bleed slightly past the section seam */
  height: 200px;
  pointer-events: none;
  overflow: visible;     /* arrowhead lines may extend just past viewBox */
}
```

#### Motion

The draw-on uses the same `IntersectionObserver` → `.has-entered` pattern as
the other scroll-triggered animations (§9.3). The path animates first; the
arrowhead fades in just as the path completes so it reads as a single
continuous gesture rather than a two-part build.

```css
.drawn-arrow .ah-path {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
}
.drawn-arrow .ah-head { opacity: 0; }

.has-entered .drawn-arrow .ah-path {
  stroke-dashoffset: 0;
  animation: drawn-arrow-draw .9s ease-in-out .8s backwards;
}
.has-entered .drawn-arrow .ah-head {
  opacity: 1;
  animation: drawn-arrow-head .25s ease 1.6s backwards;
}
@keyframes drawn-arrow-draw { from { stroke-dashoffset: 100; } }
@keyframes drawn-arrow-head { from { opacity: 0; } }
```

The 800ms delay on the path is deliberate — it's tuned to fire after the
headline (700ms ease-out, 0ms delay) and subheadline (700ms ease-out, 250ms
delay) have largely settled, so the arrow reads as a third beat in the
choreography rather than competing for attention.

#### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  .drawn-arrow .ah-path { stroke-dashoffset: 0; }
  .drawn-arrow .ah-head { opacity: 1; }
  .has-entered .drawn-arrow .ah-path,
  .has-entered .drawn-arrow .ah-head { animation: none; }
}
```

The arrow renders fully drawn at rest with no draw-on motion. The gesture is
still visible — just static.

#### Current implementation status

Originally appeared in the homepage value section as `.vh-arrow`, but that
section was reworked into poster bands (commit `b2f1a29`) and the arrow
was removed. **The pattern is currently unused in production** — it
remains documented here as a reusable gesture for any future section
that needs a hand-drawn connector across an empty diagonal.

#### When NOT to use

- As a generic UI connector between form fields, table rows, or list items —
  use a hairline rule or a chevron icon instead.
- Inside a card or button — too gestural for component-level UI.
- More than once per section — it loses meaning if repeated. One arrow per
  scroll-revealed moment, max.

### §7.14 Auto-scrolling card marquee (`.prj-marquee`)

A horizontal row of cards that drifts at a constant pixel-per-second rate
when idle, but yields to the user the moment they interact horizontally.
The user can wheel, two-finger swipe, or touch-swipe through the cards at
any time; the auto-scroll pauses for 1.5s after the last horizontal input,
then resumes.

**Used on:** [/projekte](src/app/pages/projekte/) project gallery (first appearance). Reuse anywhere
you have a horizontal list that benefits from a passive showcase rhythm
but must remain manually scrollable.

#### Markup

```html
<div class="prj-marquee prj-marquee-right" aria-label="...">
  <div class="prj-marquee-track">
    @for (project of projectsLoop; track $index; let i = $index) {
      <!-- one card markup; duplicates are marked aria-hidden + tabindex=-1
           when i >= projects.length -->
      <a class="prj-card prj-card-real" ...>...</a>
    }
  </div>
</div>
```

Key authoring rules:

- **The track must contain the card list twice** — the auto-scroll loop
  wraps `scrollLeft` when it crosses the half-track boundary, and the
  duplicate set makes the wrap invisible.
- **Mark the duplicate cards `aria-hidden="true"` and `tabindex="-1"`** so
  they don't appear twice in the accessibility tree or Tab order.
- **One marquee per section.** Two competing rows of motion across the
  same viewport stretch the eye thin (we tried it and removed it).

#### CSS

The CSS provides the scrollable container only — the motion is JS-driven.

```css
.prj-marquee {
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 12px 0;
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 5%, #000 95%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0, #000 5%, #000 95%, transparent 100%);
  cursor: grab;
}
.prj-marquee::-webkit-scrollbar { display: none; }
.prj-marquee-track {
  display: flex;
  gap: 24px;
  width: max-content;
}
.prj-marquee .prj-card { flex: 0 0 380px; }
```

The mask-image fades the left and right edges so cards drift in and out
under a gradient rather than popping in at a hard cutoff.

#### Motion (TypeScript)

A `requestAnimationFrame` loop increments `scrollLeft`. The seed position
is the **middle** of the doubled track so the user has scroll room in
both directions before hitting a wrap boundary.

```ts
private readonly AUTO_SCROLL_PX_PER_SEC = 35;
private readonly IDLE_RESUME_DELAY_MS = 1500;

private startMarqueeAutoScroll(): void {
  const el = this.marqueeRef?.nativeElement;
  if (!el) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Seed to middle of duplicated track. Retry until layout settles.
  const seed = () => {
    const half = el.scrollWidth / 2;
    if (half > 0) el.scrollLeft = half;
    else requestAnimationFrame(seed);
  };
  seed();

  // Pause on user input ...
  this.attachUserInputListeners(el);

  const tick = (now: number) => {
    const dt = now - this.lastFrameTime;
    this.lastFrameTime = now;
    const focused = !!el.querySelector(':focus-visible');
    if (!this.isUserInteracting && !focused) {
      const half = el.scrollWidth / 2;
      let next = el.scrollLeft - (this.AUTO_SCROLL_PX_PER_SEC * dt) / 1000;
      if (next < 0) next += half;          // wrap leftward edge
      else if (next >= half * 2) next -= half;  // wrap rightward edge
      el.scrollLeft = next;
    }
    this.autoScrollHandle = requestAnimationFrame(tick);
  };
  this.autoScrollHandle = requestAnimationFrame(tick);
}
```

#### User input gating

Only **horizontal** input pauses the auto-scroll. Vertical wheel events
fire on the marquee too (the element receives wheel events whenever the
cursor is over it), so a naïve listener pauses every time someone scrolls
the page past the section.

```ts
el.addEventListener('wheel', (e: WheelEvent) => {
  // shiftKey covers Firefox's shift+wheel→horizontal convention;
  // Chrome rewrites deltaX/deltaY directly, so the magnitude check
  // catches that case too.
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
    markInteract();
  }
}, { passive: true });

let touchStartX = 0, touchStartY = 0;
el.addEventListener('touchstart', (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });
el.addEventListener('touchmove', (e: TouchEvent) => {
  const dx = Math.abs(e.touches[0].clientX - touchStartX);
  const dy = Math.abs(e.touches[0].clientY - touchStartY);
  if (dx > dy) markInteract();
}, { passive: true });
```

#### Why not CSS `@keyframes` + `animation-play-state: paused`?

We tried it. Two problems made it unworkable:

1. **CSS `transform: translateX()` on the track conflicts with `overflow-x: auto` on the parent.** Native horizontal scroll and the transform animation compound into nonsense motion.
2. **`:hover` pause stops the row on mouse click** (focus lands on the card, stays after a `target="_blank"` navigation). Switching to `:has(:focus-visible)` only helps for keyboard focus — mouse interactions still couldn't trigger a brief pause cleanly.

JS-driven `scrollLeft` solves both: native scroll works for free, and the auto-scroll is paused/resumed by explicit timer logic.

#### Reduced motion

The TS check `prefers-reduced-motion: reduce` short-circuits before the
rAF loop starts. The user can still scroll the cards manually via the
native overflow.

#### When NOT to use

- As a primary navigation surface. The cards move; users may misclick.
- For ranked or ordered content. The wrap is invisible but the *first
  card* isn't visually distinguished from the others — readers can't
  rely on a stable "front of the list" position.
- For a single card or two. Auto-scroll only makes sense when the row
  exceeds the viewport width.

---

## §8. States & Interactions

### §8.1 Hover

| Surface          | Lift            | Effect                                    |
|------------------|-----------------|-------------------------------------------|
| `.btn-primary`   | `-4px`          | Shine sweep + arrow send-off + glow       |
| `.sn-cta`/`.fn-cta` | `-2 to -3px` | Shine sweep + arrow send-off              |
| `.value-new .card` | `-6px`        | Rotating conic-gradient energy border     |
| `.process-new .p-card` | scale 0.78→1 | Scroll/snap controls; not a true hover |
| Nav links        | none on lift    | Per-letter wave-flip (§7.9)               |
| Footer links     | none on lift    | 14px orange bar slides out under text     |

### §8.2 `:focus-visible`

Global:

```css
:focus-visible {
  outline: 2px solid var(--color-accent-primary);  /* currently cyan — see §2.4 */
  outline-offset: 3px;
  border-radius: 4px;
}
```

Decorative-only elements (e.g. `.honest-new .seal`) override to
`outline: none`. **Never** override on an interactive element.

### §8.3 The `.has-entered` reveal pattern

The single motion vocabulary for scroll-triggered reveals. An
IntersectionObserver adds the class to the target when it enters; CSS keys
both a resting "before" state and an `animation: ... backwards` declaration
on the `.has-entered` selector.

```css
/* Resting state — what the user sees before scrolling to it */
.value-statement-new .vh-headline {
  opacity: 0;
  transform: translateX(-50px);
}

/* Reached state — what the user sees after it has entered */
.value-statement-new .vh-headline.has-entered {
  opacity: 1;
  transform: none;
  animation: vn-slide-left-in .7s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes vn-slide-left-in {
  from { opacity: 0; transform: translateX(-50px); }
}
```

**Why `backwards` and not `forwards`** — the keyframe `from` state is
applied during any `animation-delay`, and the underlying CSS final state
(set on the `.has-entered` selector) is reached and held when the animation
ends. No styles get pinned at animation-priority, so subsequent hover
transforms still apply.

---

## §9. Motion

### §9.1 Principles

1. **One-shot per element.** Each animatable element is observed exactly
   once. After it animates in, the observer disconnects.
2. **Per-element triggers, not per-section.** Every headline, sub, arrow,
   and card gets its own observer. Choreography sequences with the scroll
   position, not in a burst when the section enters view.
3. **Hover layered on rest.** Never put `transform: scale()` in a
   `transition` if the element also has a hover translate — the entry
   animation and hover will fight unless you use `animation: ... backwards`
   (see §9.5).
4. **Sacred timings.** Hover transitions: 250–300ms. Entry animations:
   600–900ms. Hover lift uses overshoot easing
   `cubic-bezier(.3, 1.4, .4, 1)`; entry uses snap-out easing
   `cubic-bezier(.16, 1, .3, 1)` or `cubic-bezier(.2, .7, .2, 1)`.

### §9.2 IntersectionObserver setup

```typescript
// In a component, after view init, in the browser only:
private setupValueReveal(): void {
  const observe = (el: Element | null | undefined, threshold: number, rootMargin = '0px') => {
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('has-entered');
          io.unobserve(e.target);
        }
      });
    }, { threshold, rootMargin });
    io.observe(el);
    this.observers.push(io);   /* track for cleanup in ngOnDestroy */
  };

  observe(this.vhHeadline?.nativeElement, 0.55);
  observe(this.vhSub?.nativeElement,      0.65);
  observe(this.vhArrow?.nativeElement,    0.4);
  this.valueCardItems?.forEach(ref => observe(ref.nativeElement, 0.4));
}
```

### §9.3 Threshold guidance

| Element type                | Threshold |
|-----------------------------|-----------|
| Section headline (H2)       | `0.55`    |
| Section subhead             | `0.65`    |
| Arrow / drawn-arrow         | `0.40`    |
| Card / row item             | `0.40`    |
| Long body paragraph         | `0.30`    |
| Below-fold finale (large)   | `0.25`    |

Lower thresholds for short or wide elements (so they trigger early),
higher for tall or eye-attracting ones (so the eye is on them when the
slide-in starts).

### §9.4 Named keyframes catalogue

| Keyframe                    | Section     | Purpose                                  |
|-----------------------------|-------------|------------------------------------------|
| `hn-pulse`                  | hero        | Status-dot pulse (1.8s)                  |
| `hn-trail`                  | hero        | Scroll-indicator line trail (2.4s)       |
| `vn-slide-left-in`          | value       | Headline slide in from left              |
| `vn-slide-right-in`         | value       | Subhead slide in from right              |
| `vn-arrow-draw`             | value       | `.vh-arrow` path stroke-dashoffset       |
| `vn-arrow-head`             | value       | `.vh-arrow` head fade in                 |
| `vn-card-enter`             | value       | Card slide-up+left (delayed per nth)     |
| `vn-card-rotate-border`     | value       | Conic-gradient ring rotation (2.2s)      |
| `vn-flow`                   | value       | Data-flow dots along card arrows         |
| `vn-blink`                  | value       | Cursor blink in search-bar visual        |
| `pn-wire` / `pn-polish`     | process     | Wireframe/design layer toggle (6s)       |
| `pn-typing`                 | process     | Typing-dots bounce in process card       |
| `pn-stamp`                  | process     | "Approved" stamp rotate/scale            |
| `hon-spin`                  | honesty     | Seal text ring rotation (22s)            |
| `fin-aurora`                | final       | Background aurora drift (12/14/16s)      |
| `fin-mote`                  | final       | Dust mote drift (16–26s)                 |
| `fn-cta-reveal`             | navbar      | Floating CTA scale-in (§7.8)             |
| `drawn-arrow-draw`          | global      | Reusable §7.13 arrow path draw-on        |
| `drawn-arrow-head`          | global      | Reusable §7.13 arrowhead fade            |

### §9.5 `animation: ... backwards` rationale

When an element has both an entry animation AND a hover transform, naive
implementations break. The entry transition pins the transform value and
the hover lift can't beat it without a higher-specificity rule. The
solution: declare the resting state on the base selector, and the final
state on the `.has-entered` selector, and use a `backwards`-fill animation
to drive the transition:

```css
.fn-cta { transform: scale(.85); opacity: 0; transition: background .25s ease, box-shadow .25s ease; }
.fn-cta.is-visible { transform: scale(1); opacity: 1; animation: fn-cta-reveal .55s cubic-bezier(.4, 1.5, .5, 1) .5s backwards; }
.fn-cta.is-visible:hover { transform: scale(1) translateY(-2px); }
```

After the animation ends, no styles are pinned at animation-priority, so
the hover rule (a plain transition on the same property) applies cleanly.

### §9.6 Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Plus, per-element overrides that resolve scroll-triggered states instantly:

```css
@media (prefers-reduced-motion: reduce) {
  .value-statement-new .vh-headline,
  .value-statement-new .value-sub,
  .value-cards-new .cards .card {
    opacity: 1;
    transform: none;
  }
  .vh-arrow .ah-path { stroke-dashoffset: 0; }
  .vh-arrow .ah-head { opacity: 1; }
}
```

---

## §10. Responsive

### §10.1 Breakpoints

| Max-width | Treatment                                             |
|-----------|-------------------------------------------------------|
| `1080px`  | Tablet — 2-col grids collapse to 1-col where needed   |
| `900px`   | Process filmstrip flips from translate to scroll-snap |
| `640px`   | Container padding 24px, some sub-font reductions      |
| `480px`   | Phone — aggressive reductions, drawer nav, full block |

The bulk of mobile rules live in one large `@media (max-width: 480px)`
block at the bottom of [home.component.css](src/app/pages/home/home.component.css). Each rule is
prefixed by its `.X-new` wrapper, so the mobile block is readable
section-by-section.

### §10.2 Mobile transformations to know

- **Hero stage** flips to a single column; image cluster becomes a 2×3
  grid; CTAs stack full-width.
- **Value cards** stack 3→1; padding tightens.
- **Process filmstrip** switches from JS-driven translate to native
  `scroll-snap-type: x mandatory`. Mask fade is removed (scroll bars
  would be confusing).
- **FAQ rail** decoration hidden; tap targets enlarged.
- **Footer wordmark** clamps to ~56px on `≤480`.
- **Static nav** hides its CTA + links; only brand + burger remain.
  Floating pill behaves the same.

### §10.3 Body lock

When the drawer is open, the body locks scroll via a global class:

```css
body.drawer-open {
  overflow: hidden;
  touch-action: none;
}
```

Set + cleared in the navbar component's drawer logic; do not introduce
component-level scroll-locks.

---

## §11. Files

| Concern              | Path                                                              |
|----------------------|-------------------------------------------------------------------|
| Global tokens, focus, reduced motion | [src/styles.css](src/styles.css)                  |
| Font loading         | [src/index.html](src/index.html)                                  |
| Homepage structure   | [src/app/pages/home/home.component.html](src/app/pages/home/home.component.html) |
| Homepage styling (1900+ lines, source of truth) | [src/app/pages/home/home.component.css](src/app/pages/home/home.component.css) |
| Homepage motion (observers, scroll handlers) | [src/app/pages/home/home.component.ts](src/app/pages/home/home.component.ts) |
| Navbar (static + floating + drawer) | [src/app/components/navbar/](src/app/components/navbar/) |
| Footer               | [src/app/components/footer/](src/app/components/footer/)          |
| Cookie consent       | [src/app/components/cookie-consent/](src/app/components/cookie-consent/) |
| Design intake folder | [design-drops/](design-drops/) (does not ship to production)      |

---

## §12. Building a new redesigned page

A working recipe based on what's been done for the homepage. For each new
page (Leistungen, Projekte, Über uns, Kontakt, …):

1. **Wrapper.** Add a single `<section class="X-new">` per visual section.
   Pick `X` as the section name (e.g. `leistungen-hero`, `leistungen-pillars`).
2. **Tokens.** Declare `--orange`, the section background, and ink colours
   on the wrapper. Reuse one of the existing palettes from §2.3 unless the
   section genuinely needs a new one.
3. **Skeleton.** Inside each section: `.X` (padding holder) → `.guides`
   (12-col decoration) → `.container` (max-width 1440, padding 0 56px) →
   content.
4. **Headline.** Lead with an eyebrow (§7.1), then an H2 with one cursive
   `.accent` insertion (§3.3). Add a `.lead-bar` (§7.2) above the subhead.
5. **Body.** Compose from the §7 component vocabulary. Don't invent new
   card variants unless the existing ones genuinely can't carry the
   information.
6. **CTA.** Every page closes with a `.btn-primary` row that uses the
   shine-sweep + arrow send-off effect (§7.3). Routes to `/demo` or
   `/kontakt`.
7. **Motion.** For each scroll-revealed element, declare a resting state
   and a `.has-entered` `animation: ... backwards` (§8.3). Register a
   per-element observer in the component's `setupXReveal()` method using
   the threshold table in §9.3.
8. **Mobile.** Add a `@media (max-width: 480px)` block at the bottom of
   the component CSS. Prefix every rule with the section's `.X-new`
   wrapper. Stack columns, collapse decorations, full-width CTAs.
9. **Reduced motion.** Resolve every observed element's final state in a
   `prefers-reduced-motion: reduce` block (§9.6).
10. **Verify.** Run `npx ng serve --port 4201`, walk through the page on
    desktop and mobile-emulated, and verify reduced-motion behaviour via
    the browser's reduce-motion devtool.

When a page lands, this doc gets updated — new component → new §7.x entry,
new keyframe → new row in §9.4. Don't let the homepage and this doc drift.
