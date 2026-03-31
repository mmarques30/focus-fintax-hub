

## FIX 4 — Hide AppHeader on Dashboard

### Change — `src/components/AppLayout.tsx`

The `isDashboard` check already exists (line 14: `const noPadding = pathname === "/dashboard"`). Update the return to conditionally hide `AppHeader`:

```tsx
const isDashboard = pathname === "/dashboard";

return (
  <div className="min-h-screen flex w-full bg-sidebar">
    <AppSidebar />
    <div className="flex-1 flex flex-col bg-background rounded-tl-2xl overflow-hidden">
      {!isDashboard && <AppHeader />}
      <main className={cn("flex-1 overflow-auto", !isDashboard && "p-4")}>
        {children}
      </main>
    </div>
  </div>
);
```

Replaces `noPadding` variable with `isDashboard` for clarity. Removes `<AppHeader />` render when on `/dashboard` since `DashboardHeader` already provides greeting, role badge, time, and notifications.

### Files modified
1. `src/components/AppLayout.tsx` — conditionally hide AppHeader on dashboard route

