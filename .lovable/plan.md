

## PART 7 — Typography Polish

### Summary
Remove the unused Montserrat font import. Everything else is already in place: Barlow/Barlow Condensed/DM Mono are imported, tailwind config maps them to `font-sans`/`font-display`/`font-mono-dm`, and body uses `font-sans`.

### Changes

**File: `src/index.css` (line 1)**

Remove the Montserrat import line:
```css
// DELETE:
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
```

The remaining import on line 2 already loads all three font families with correct weights.

### Already configured (no changes needed)
- `tailwind.config.ts`: `font-sans` → Barlow, `font-display` → Barlow Condensed, `font-mono-dm` → DM Mono
- `src/index.css` body: `@apply font-sans` (= Barlow)
- Google Fonts import with all required weights

### Files modified
1. `src/index.css` — remove unused Montserrat import (1 line)

