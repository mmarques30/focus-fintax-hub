import { useState } from "react";
import { LayoutDashboard, Users, LogOut, UserPlus, Building2, Settings, Lock, ChevronDown } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import logoWhite from "@/assets/logo-focus-fintax-white.png";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  roles?: string[];
  readOnlyRoles?: string[];
  children?: SubMenuItem[];
}

interface SubMenuItem {
  title: string;
  url: string;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Pipeline de Leads", url: "/pipeline", icon: UserPlus, roles: ["admin", "comercial", "pmo", "gestor_tributario"], readOnlyRoles: ["gestor_tributario"] },
  { title: "Clientes", url: "/clientes", icon: Building2, roles: ["admin", "gestor_tributario", "pmo", "comercial"], readOnlyRoles: ["comercial"] },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
    roles: ["admin", "pmo"],
    children: [
      { title: "Motor de Cálculo", url: "/configuracoes/motor", roles: ["admin", "pmo"] },
      { title: "Benchmarks e Teses", url: "/benchmarks", roles: ["admin"] },
    ],
  },
  { title: "Usuários", url: "/usuarios", icon: Users, roles: ["admin", "pmo"] },
];

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const location = useLocation();
  const { profile, userRole, signOut } = useAuth();

  const visibleItems = menuItems.filter(
    (item) => !item.roles || userRole === "admin" || (userRole && item.roles.includes(userRole))
  );
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  // Auto-open config submenu if on a config route
  const isOnConfigRoute = location.pathname.startsWith("/configuracoes") || location.pathname.startsWith("/benchmarks");

  return (
    <div
      className={cn(
        "h-screen bg-sidebar flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
        open ? "w-[250px]" : "w-[60px]"
      )}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
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
          const isActive = hasChildren
            ? isOnConfigRoute
            : location.pathname === item.url;
          const isReadOnly = !!(item.readOnlyRoles && userRole && item.readOnlyRoles.includes(userRole));
          const showChildren = hasChildren && open && (configOpen || isOnConfigRoute);

          if (hasChildren) {
            const visibleChildren = item.children!.filter(
              (c) => !c.roles || userRole === "admin" || (userRole && c.roles.includes(userRole))
            );
            if (visibleChildren.length === 0) return null;

            return (
              <div key={item.title}>
                <button
                  onClick={() => setConfigOpen(!configOpen)}
                  className={cn(
                    "flex items-center gap-3 h-9 rounded-md px-3 text-sidebar-foreground transition-colors whitespace-nowrap w-full",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
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
                          <span className="text-xs">{child.title}</span>
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
                {isReadOnly && <Lock className="h-3 w-3 opacity-60" />}
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
