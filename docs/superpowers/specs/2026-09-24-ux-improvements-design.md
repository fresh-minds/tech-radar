# UX improvements: design spec

## Problem

The landing page layout feels messy. Sections have inconsistent widths (intro at 900px, legend at 1200px, radar at 1450px, cards at 1200px), the ring legend sits awkwardly between the intro and the radar, and the radar SVG doesn't scale on smaller screens.

## Changes

### 1. Consistent alignment

Set all content sections to max-width 1200px: intro, textual explanation, unit cards. The radar SVG container stays at 1450px since the visualization needs the space, but everything else lines up at the same left and right edges.

### 2. Remove custom legend, add textual explanation

Remove the compact dot-based ring legend and the custom movement legend that currently sit above the radar. Replace them with a Thoughtworks-style textual section below the radar:

- A short paragraph explaining what blips are and that they can move between rings.
- Ring definitions as colored-label paragraphs: "Adopt. Bewezen in productie. Onze standaardkeuze voor dit domein." etc.

The Zalando library's built-in movement indicators (rendered inside/below the SVG) stay as-is. The duplicate custom movement legend gets removed.

### 3. Page flow

The new section order for all pages (global and unit):

1. Header
2. Nav bar
3. Intro paragraph (with CTA links on global, unit pitch on unit pages)
4. Radar SVG (with Zalando's built-in labels and movement indicators)
5. Textual explanation (blips + ring definitions)
6. Unit cards (global page only)
7. Footer

### 4. Responsive scaling

Add CSS to scale the radar SVG container when the viewport is narrower than 1450px:

```css
.radar-container {
  max-width: 1450px;
  margin: 0 auto;
  overflow: hidden; /* no more horizontal scroll */
}

@media (max-width: 1450px) {
  .radar-container svg {
    width: 100%;
    height: auto;
  }
}
```

The SVG's `viewBox` attribute (set by the Zalando library) makes it scale proportionally. Labels get smaller but stay readable down to about 900px. Below that the radar gets cramped, but that's acceptable for a desktop-first tool.

### 5. Spacing

Consistent 32px vertical gaps between sections. Remove the uneven padding values (currently ranging from 0 to 40px across sections).

## Files to modify

- `index.html`: remove ring legend HTML, remove movement legend HTML, add textual explanation section, update CSS widths and spacing, add responsive media query
- No changes to radar data files, validate.js, or units.json

## What stays the same

- Header and nav bar styling
- Tooltip behavior (hover on desktop, tap on mobile)
- Unit card design and auto-generated highlights
- Footer
- Zalando library's built-in SVG rendering and labels

## Verification

1. Landing page (global): intro, radar, textual explanation, unit cards all visually aligned
2. Unit page: intro, radar, textual explanation (no unit cards)
3. Resize browser to 1000px wide: radar scales down, no horizontal scrollbar
4. Resize to 768px: still usable, labels smaller but readable
5. Tooltips still work after layout changes
