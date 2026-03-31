

## Fix Header Duplication Hack

### Summary
Remove the `-m-4` negative margin hack from Dashboard.tsx by adding a `noContentPadding` prop to AppLayout. Dashboard opts out of the default `p-4` and manages its own padding internally.

### Step 1 — `src/components/AppLayout.tsx`

Add optional `noContentPadding` prop. Use `cn()` to conditionally apply `p-4`:

```tsx
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  noContentPadding?: boolean;
}

// In main tag:
<main className={cn("flex-1 overflow-auto", !noContentPadding && "p-4")}>
```

### Step 2 — `src/App.tsx`

The Dashboard route needs `noContentPadding`. Since AppLayout wraps all routes, we need a per-route approach. Two options:

**Approach: Wrap Dashboard in its own AppLayout instance**

Move Dashboard outside the shared `AppLayout` and give it its own:

```tsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <AppLayout noContentPadding>
      <Dashboard />
    </AppLayout>
  </ProtectedRoute>
} />
```

But this duplicates ProtectedRoute nesting. Simpler: use a layout route pattern or pass the prop via context.

**Simpler approach: React context or outlet**

Actually the simplest: keep all routes inside one AppLayout but let Dashboard signal it needs no padding via a dedicated wrapper component or by reading location.

**Simplest approach**: Create a small `<NoPaddingWrapper>` that Dashboard uses, OR just check `useLocation` in AppLayout.

**Chosen approach**: Use `useLocation` in AppLayout to detect `/dashboard` and skip padding. Clean, no prop drilling needed.

```tsx
// AppLayout.tsx
import { useLocation } from "react-router-dom";
const { pathname } = useLocation();
const noPadding = pathname === "/dashboard";

<main className={cn("flex-1 overflow-auto", !noPadding && "p-4")}>
```

### Step 3 — `src/pages/Dashboard.tsx` (line 230)

Remove `-m-4` from the wrapper div:

```tsx
// Before:
<div className="-m-4 min-h-[calc(100vh-64px)] bg-[#f2f3f7] font-sans antialiased">

// After:
<div className="min-h-[calc(100vh-64px)] bg-[#f2f3f7] font-sans antialiased">
```

### Files modified
1. `src/components/AppLayout.tsx` — add `useLocation` check, conditionally skip `p-4`
2. `src/pages/Dashboard.tsx` — remove `-m-4`

