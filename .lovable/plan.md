

## Part 9 — Sidebar Polish

### Summary
Add gradient background, glass border glow, and refined active-item styling to the sidebar.

### Changes — `src/components/AppSidebar.tsx`

**1. Outer `<div>` (line 76-80)**: Add `relative` to className, replace `bg-sidebar` with inline style for gradient + border:

```tsx
<div
  className={cn(
    "h-screen flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden relative",
    open ? "w-[250px]" : "w-[60px]"
  )}
  style={{
    background: 'linear-gradient(180deg, #0a1564 0%, #071040 100%)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
  }}
  onMouseEnter={() => setOpen(true)}
  onMouseLeave={() => setOpen(false)}
>
```

**2. Right-side glow line** — Add immediately inside the outer div (after opening tag, before Logo section):

```tsx
<div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent pointer-events-none" />
```

**3. Active menu item styling** — Replace `bg-sidebar-accent text-sidebar-accent-foreground font-semibold` with `bg-white/10 backdrop-blur-sm text-white font-semibold` in three places:
- Parent button active state (line 114)
- Child NavLink active state (line 148)
- Top-level NavLink active state (line 172)

Change `rounded-md` to `rounded-xl` on those same active items.

### Files modified
1. `src/components/AppSidebar.tsx`

