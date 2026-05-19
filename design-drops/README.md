# design-drops/

Intake folder for HTML files generated in Claude Design during the redesign.

## Workflow

1. Drop a generated HTML file in here (e.g. `hero.html`, `process.html`, `faq.html`).
2. Tell Claude: "I dropped the hero" (or whichever section it is).
3. Claude reads the file and translates the markup + styles into a new Angular component, plugged into the homepage in place of the old equivalent section.

## Conventions

- One file per section is easiest. Name it after the section (`hero.html`, `value-cards.html`, `showcase.html`, etc.).
- Self-contained HTML is fine — inline styles, embedded `<style>` blocks, or full `<html>` documents all work. Claude will extract what's needed.
- Existing files in here can be overwritten or replaced freely. Once a section is integrated, the source file can stay for reference or be deleted.

## Notes

- This folder is part of the source tree but does NOT get included in the production build.
- The redesign happens on the `redesign` branch — `main` (live site) is untouched.
