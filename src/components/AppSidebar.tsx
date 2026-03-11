import { useState } from "react";
import { LayoutDashboard, Users, LogOut, UserPlus, Database } from "lucide-react";
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
  roles?: string[]; // if undefined, visible to all
}

const menuItems: MenuItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Leads", url: "/leads", icon: UserPlus, roles: ["admin", "comercial"] },
  { title: "Empresas", url: "/empresas", icon: Building2, roles: ["admin", "pmo", "gestor_tributario", "comercial"] },
  { title: "Obrigações", url: "/obrigacoes", icon: FileText, roles: ["admin", "gestor_tributario"] },
  { title: "Fiscal", url: "/fiscal", icon: Receipt, roles: ["admin", "gestor_tributario"] },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Usuários", url: "/usuarios", icon: Users, roles: ["admin", "pmo"] },
  { title: "Benchmarks", url: "/benchmarks", icon: Database, roles: ["admin"] },
  { title: "Configurações", url: "/configuracoes", icon: Settings, roles: ["admin"] },
];

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { profile, userRole, signOut } = useAuth();

  const visibleItems = menuItems.filter(
    (item) => !item.roles || userRole === "admin" || (userRole && item.roles.includes(userRole))
  );
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

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
          const isActive = location.pathname === item.url;
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
                  "text-sm transition-opacity duration-200",
                  open ? "opacity-100" : "opacity-0"
                )}
              >
                {item.title}
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
