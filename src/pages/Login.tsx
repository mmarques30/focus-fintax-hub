import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo-focus-fintax.png";

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
      navigate("/dashboard");
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
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <img src={logo} alt="Focus FinTax" className="h-14" />
        </div>

        <div className="space-y-2 text-center">
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
  );
}
