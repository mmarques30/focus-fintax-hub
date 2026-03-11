import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import logoWhite from "@/assets/logo-focus-fintax-white.png";
import logo from "@/assets/logo-focus-fintax.png";

function Spotlight() {
  return (
    <>
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary-foreground/6 blur-[150px] animate-[glow-pulse_6s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] rounded-full bg-primary-foreground/4 blur-[120px] animate-[glow-pulse_8s_ease-in-out_infinite_1s]" />
    </>
  );
}

function BackgroundChart() {
  const barHeights = [40, 55, 45, 70, 60, 85, 75, 95];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Perspective grid floor */}
      <div
        className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[140%] h-[45%] opacity-[0.18]"
        style={{
          transform: 'translateX(-50%) perspective(400px) rotateX(65deg)',
          backgroundImage:
            'repeating-linear-gradient(90deg, hsl(0 0% 100% / 0.5) 0px, transparent 1px, transparent 60px), repeating-linear-gradient(0deg, hsl(0 0% 100% / 0.3) 0px, transparent 1px, transparent 60px)',
        }}
      />

      {/* Bar chart group */}
      <div className="absolute bottom-[28%] right-[12%] flex items-end gap-3 opacity-[0.35]">
        {barHeights.map((h, i) => (
          <div
            key={i}
            className="w-4 rounded-t-sm border border-primary-foreground/50 bg-primary-foreground/15"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>

      {/* Ascending trend line */}
      <svg
        className="absolute bottom-[28%] right-[8%] opacity-[0.10]"
        width="220"
        height="110"
        viewBox="0 0 220 110"
        fill="none"
      >
        <path
          d="M10 100 Q 50 90, 80 70 T 140 40 T 210 10"
          stroke="hsl(0 0% 100%)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Arrow tip */}
        <polygon points="210,10 200,18 205,8" fill="hsl(0 0% 100% / 0.6)" />
      </svg>

      {/* Floating metric circles */}
      <div className="absolute top-[18%] left-[12%] w-20 h-20 rounded-full border border-primary-foreground/8 opacity-[0.10]" />
      <div className="absolute top-[14%] left-[18%] w-10 h-10 rounded-full border border-primary-foreground/10 bg-primary-foreground/3 opacity-[0.12]" />

      {/* Horizontal data lines */}
      <div className="absolute top-[35%] left-[8%] w-[35%] space-y-6 opacity-[0.07]">
        <div className="h-px bg-gradient-to-r from-primary-foreground/40 to-transparent" />
        <div className="h-px bg-gradient-to-r from-primary-foreground/25 to-transparent w-[80%]" />
        <div className="h-px bg-gradient-to-r from-primary-foreground/15 to-transparent w-[60%]" />
      </div>
    </div>
  );
}

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
      {/* Left panel — branding with charts */}
      <div className="hidden lg:flex lg:w-[55%] bg-primary relative overflow-hidden flex-col items-center justify-center p-16">
        <Spotlight />
        <BackgroundChart />

        {/* Decorative line accents */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-10 animate-[fade-in_0.8s_ease-out]">
          <img src={logoWhite} alt="Focus FinTax" className="h-44 drop-shadow-[0_0_60px_hsl(var(--primary-foreground)/0.15)]" />

          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wide text-primary-foreground/80 uppercase">
              Gestão Financeira e Tributária
            </h2>
            <div className="w-16 h-0.5 mx-auto bg-gradient-to-r from-transparent via-secondary to-transparent rounded-full" />
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
              {mode === "forgot" && "Recuperar senha"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === "login" && "Entre com suas credenciais para continuar"}
              {mode === "forgot" && "Informe seu e-mail para redefinir a senha"}
            </p>
          </div>

          <form
            onSubmit={mode === "login" ? handleLogin : handleForgot}
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


            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  {mode === "login" && "Entrar"}
                  {mode === "forgot" && "Enviar e-mail"}
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            {mode === "login" ? (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Esqueceu a senha?
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Voltar ao login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
