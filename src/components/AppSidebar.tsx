import { useState } from "react";
import { LayoutDashboard, Users, LogOut, UserPlus, Building2, Settings, Lock, ChevronDown } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import logoWhite from "@/assets/logo-focus-fintax-white.png";
import { cn } from "@/lib/utils";
import { SCREENS } from "@/lib/screen-permissions";

interface MenuItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  screenKey?: string;
  children?: SubMenuItem[];
}

interface SubMenuItem {
  title: string;
  url: string;
  screenKey?: string;
}

const menuItems: MenuItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, screenKey: "dashboard" },
  { title: "Pipeline de Leads", url: "/pipeline", icon: UserPlus, screenKey: "pipeline" },
  { title: "Clientes", url: "/clientes", icon: Building2, screenKey: "clientes" },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
    children: [
      { title: "Motor de Cálculo", url: "/configuracoes/motor", screenKey: "motor_calculo" },
      { title: "Benchmarks e Teses", url: "/benchmarks", screenKey: "benchmarks" },
    ],
  },
  { title: "Usuários", url: "/usuarios", icon: Users, screenKey: "usuarios" },
];

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const location = useLocation();
  const { profile, permissions, signOut } = useAuth();
  const navigate = useNavigate();

  const canAccess = (key?: string) => {
    if (!key) return true;
    const perm = permissions.find((p) => p.screen_key === key);
    if (!perm) return false;
    return perm.can_access;
  };

  const isReadOnly = (key?: string) => {
    if (!key) return false;
    const perm = permissions.find((p) => p.screen_key === key);
    return perm?.read_only ?? false;
  };

  const visibleItems = menuItems.filter((item) => {
    if (item.children) {
      return item.children.some((c) => canAccess(c.screenKey));
    }
    return canAccess(item.screenKey);
  });

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const isOnConfigRoute = location.pathname.startsWith("/configuracoes") || location.pathname.startsWith("/benchmarks");

  return (
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
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent pointer-events-none" />
      {/* Logo */}
      <div className="flex items-center h-20 px-3 shrink-0">
        {open ? (
          <img src={logoWhite} alt="Focus FinTax" className="h-12 object-contain ml-1" />
        ) : (
          <div className="h-8 w-8 rounded-md bg-sidebar-accent flex items-center justify-center mx-auto">
            <span className="text-sidebar-primary font-extrabold text-sm">F</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-2 mt-4 overflow-y-auto overflow-x-hidden">
        {visibleItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isActive = hasChildren ? isOnConfigRoute : location.pathname === item.url;
          const readOnly = isReadOnly(item.screenKey);
          const showChildren = hasChildren && open && (configOpen || isOnConfigRoute);

          if (hasChildren) {
            const visibleChildren = item.children!.filter((c) => canAccess(c.screenKey));
            if (visibleChildren.length === 0) return null;

            return (
              <div key={item.title}>
                <button
                  onClick={() => setConfigOpen(!configOpen)}
                  className={cn(
                    "flex items-center gap-3 h-9 rounded-xl px-3 text-sidebar-foreground transition-colors whitespace-nowrap w-full",
                    isActive
                      ? "bg-white/10 backdrop-blur-sm text-white font-semibold"
                      : "hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span
                    className={cn(
                      "text-sm transition-opacity duration-200 flex-1 text-left flex items-center gap-1.5",
                      open ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {item.title}
                  </span>
                  {open && (
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                        showChildren ? "rotate-180" : ""
                      )}
                    />
                  )}
                </button>
                {showChildren && (
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {visibleChildren.map((child) => {
                      const childActive = location.pathname === child.url;
                      const childReadOnly = isReadOnly(child.screenKey);
                      return (
                        <NavLink
                          key={child.url}
                          to={child.url}
                          className={cn(
                            "flex items-center h-8 rounded-md pl-10 pr-3 text-sidebar-foreground transition-colors whitespace-nowrap",
                            childActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                              : "hover:bg-sidebar-accent/50"
                          )}
                        >
                          <span className="text-xs flex items-center gap-1.5">
                            {child.title}
                            {childReadOnly && <Lock className="h-3 w-3 opacity-60" />}
                          </span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={cn(
                "flex items-center gap-3 h-9 rounded-md px-3 text-sidebar-foreground transition-colors whitespace-nowrap",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  : "hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span
                className={cn(
                  "text-sm transition-opacity duration-200 flex items-center gap-1.5",
                  open ? "opacity-100" : "opacity-0"
                )}
              >
                {item.title}
                {readOnly && <Lock className="h-3 w-3 opacity-60" />}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer — User */}
      <div className="px-2 pb-4 mt-auto shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md">
          <div className="h-7 w-7 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
            <span className="text-sidebar-accent-foreground text-xs font-bold">
              {(profile?.full_name || "U")[0].toUpperCase()}
            </span>
          </div>
          {open && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {profile?.full_name || "Usuário"}
              </p>
              <p className="text-[10px] text-sidebar-foreground/60 truncate">
                {profile?.email || ""}
              </p>
            </div>
          )}
          {open && (
            <button
              onClick={handleLogout}
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
