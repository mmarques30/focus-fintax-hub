

## Part 7 — Page Background Refinement

### Summary
Add a subtle radial gradient to the body background for visual depth, replacing the flat `#f2f3f7`.

### Changes — `src/index.css` (lines 136-138)

Update the `body` rule in `@layer base` to include the radial gradient:

```css
body {
  @apply text-foreground font-sans;
  background: radial-gradient(ellipse at 20% 0%, rgba(10,21,100,0.04) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 100%, rgba(200,0,30,0.02) 0%, transparent 60%),
              #f2f3f7;
}
```

This removes `bg-background` (which was `hsl(230 33% 97%)` ≈ `#f2f3f7`) and replaces it with the gradient version using the same base color.

### Files modified
1. `src/index.css` — body background gradient

