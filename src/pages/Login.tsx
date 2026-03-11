import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn, Mail, Lock, Shield, FileText, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import logoWhite from "@/assets/logo-focus-fintax-white.png";
import logo from "@/assets/logo-focus-fintax.png";

function Spotlight() {
  return (
    <>
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-secondary/20 blur-[120px] animate-[glow-pulse_6s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-primary-foreground/5 blur-[100px] animate-[glow-pulse_8s_ease-in-out_infinite_1s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-secondary/10 blur-[150px] animate-[glow-pulse_10s_ease-in-out_infinite_2s]" />
    </>
  );
}

const features = [
  { icon: Shield, label: "Obrigações Fiscais", desc: "Controle total de prazos e entregas" },
  { icon: BarChart3, label: "Relatórios", desc: "Dashboards e análises em tempo real" },
  { icon: FileText, label: "Auditoria", desc: "Rastreabilidade completa de operações" },
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot">("login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Erro ao entrar", { description: error.message });
    } else {
      navigate("/");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: email.split("@")[0] } },
    });
    setLoading(false);
    if (error) {
      toast.error("Erro ao cadastrar", { description: error.message });
    } else {
      toast.success("Cadastro realizado!", { description: "Verifique seu e-mail para confirmar a conta." });
      setMode("login");
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    setLoading(false);
    if (error) {
      toast.error("Erro", { description: error.message });
    } else {
      toast.success("E-mail enviado!", { description: "Verifique sua caixa de entrada." });
      setMode("login");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding with spotlight */}
      <div className="hidden lg:flex lg:w-[55%] bg-primary relative overflow-hidden flex-col items-center justify-center p-16">
        <Spotlight />

        <div className="relative z-10 max-w-lg space-y-10 animate-[fade-in_0.8s_ease-out]">
          <img src={logoWhite} alt="Focus FinTax" className="h-20" />

          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Gestão Tributária
              </span>
              <br />
              <span className="text-secondary">Inteligente</span>
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">
              Plataforma centralizada para gestão tributária e comercial.
              Controle total das obrigações fiscais da sua empresa.
            </p>
          </div>

          <div className="grid gap-3">
            {features.map((f, i) => (
              <div
                key={f.label}
                className="flex items-center gap-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 transition-all duration-300 hover:bg-white/10"
                style={{ animationDelay: `${0.2 + i * 0.15}s` }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/20">
                  <f.icon className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.label}</p>
                  <p className="text-xs text-white/40">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-background relative">
        {/* Subtle top-right glow on light side */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10 animate-[fade-in_0.6s_ease-out]">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center">
            <img src={logo} alt="Focus FinTax" className="h-14" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              {mode === "login" && "Bem-vindo de volta"}
              {mode === "signup" && "Criar conta"}
              {mode === "forgot" && "Recuperar senha"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === "login" && "Entre com suas credenciais para continuar"}
              {mode === "signup" && "Preencha os dados para criar sua conta"}
              {mode === "forgot" && "Informe seu e-mail para redefinir a senha"}
            </p>
          </div>

          <form
            onSubmit={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgot}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                E-mail
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 rounded-xl border-border bg-muted/50 text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 focus:bg-background focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)]"
                  required
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Senha
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 rounded-xl border-border bg-muted/50 text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 focus:bg-background focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)]"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-bold text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  {mode === "login" && "Entrar"}
                  {mode === "signup" && "Criar conta"}
                  {mode === "forgot" && "Enviar e-mail"}
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            {mode === "login" ? (
              <p className="text-muted-foreground">
                Não tem conta?{" "}
                <button onClick={() => setMode("signup")} className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  Cadastre-se
                </button>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Já tem conta?{" "}
                <button onClick={() => setMode("login")} className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  Fazer login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
