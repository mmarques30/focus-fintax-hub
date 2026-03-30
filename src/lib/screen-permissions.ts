export interface ScreenDef {
  key: string;
  label: string;
  route: string;
  defaultRoles: string[];
  defaultReadOnlyRoles: string[];
}

export const SCREENS: ScreenDef[] = [
  { key: "dashboard", label: "Dashboard", route: "/dashboard", defaultRoles: ["admin", "pmo", "gestor_tributario", "comercial", "cliente"], defaultReadOnlyRoles: [] },
  { key: "pipeline", label: "Pipeline de Leads", route: "/pipeline", defaultRoles: ["admin", "pmo", "comercial"], defaultReadOnlyRoles: ["gestor_tributario"] },
  { key: "clientes", label: "Clientes", route: "/clientes", defaultRoles: ["admin", "pmo", "gestor_tributario"], defaultReadOnlyRoles: ["comercial"] },
  { key: "motor_calculo", label: "Motor de Cálculo", route: "/configuracoes/motor", defaultRoles: ["admin", "pmo"], defaultReadOnlyRoles: [] },
  { key: "benchmarks", label: "Benchmarks e Teses", route: "/benchmarks", defaultRoles: ["admin"], defaultReadOnlyRoles: [] },
  { key: "usuarios", label: "Gestão de Usuários", route: "/usuarios", defaultRoles: ["admin", "pmo"], defaultReadOnlyRoles: [] },
];

export interface ScreenPermission {
  screen_key: string;
  can_access: boolean;
  read_only: boolean;
}

export function getDefaultPermissions(role: string): ScreenPermission[] {
  return SCREENS.map((s) => ({
    screen_key: s.key,
    can_access: s.defaultRoles.includes(role) || s.defaultReadOnlyRoles.includes(role),
    read_only: s.defaultReadOnlyRoles.includes(role),
  }));
}

/** Map a route path to a screen key */
export function routeToScreenKey(path: string): string | null {
  if (path.startsWith("/configuracoes")) return "motor_calculo";
  if (path.startsWith("/benchmarks")) return "benchmarks";
  if (path.startsWith("/pipeline")) return "pipeline";
  if (path.startsWith("/clientes")) return "clientes";
  if (path.startsWith("/usuarios")) return "usuarios";
  if (path.startsWith("/dashboard")) return "dashboard";
  return null;
}
