import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo-focus-fintax.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");

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
    <div className="min-h-screen flex bg-background">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-32 right-16 w-96 h-96 rounded-full bg-primary-foreground blur-3xl" />
        </div>
        <div className="relative z-10 text-center space-y-8 max-w-md">
          <img src={logo} alt="Focus FinTax" className="h-16 mx-auto brightness-0 invert" />
          <h2 className="text-3xl font-extrabold text-primary-foreground leading-tight">
            Gestão Tributária
            <br />
            <span className="text-secondary">Inteligente</span>
          </h2>
          <p className="text-primary-foreground/70 text-sm font-medium leading-relaxed">
            Plataforma centralizada para gestão tributária e comercial. 
            Controle total das obrigações fiscais da sua empresa.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {["Obrigações", "Relatórios", "Auditoria"].map((item) => (
              <div key={item} className="bg-primary-foreground/10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-primary-foreground text-xs font-semibold uppercase tracking-wider">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md border-card-border shadow-xl">
          <CardContent className="p-8 space-y-6">
            <div className="lg:hidden flex justify-center mb-4">
              <img src={logo} alt="Focus FinTax" className="h-10" />
            </div>

            <div className="text-center space-y-1">
              <h1 className="text-2xl font-extrabold text-foreground">
                {mode === "login" && "Acesse sua conta"}
                {mode === "signup" && "Criar conta"}
                {mode === "forgot" && "Recuperar senha"}
              </h1>
              <p className="text-body-text text-sm">
                {mode === "login" && "Entre com suas credenciais para continuar"}
                {mode === "signup" && "Preencha os dados para criar sua conta"}
                {mode === "forgot" && "Informe seu e-mail para redefinir a senha"}
              </p>
            </div>

            <form
              onSubmit={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgot}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {mode !== "forgot" && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Esqueceu a senha?
                </button>
              )}

              <Button type="submit" className="w-full font-bold" disabled={loading}>
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
                <p className="text-body-text">
                  Não tem conta?{" "}
                  <button onClick={() => setMode("signup")} className="font-semibold text-primary hover:underline">
                    Cadastre-se
                  </button>
                </p>
              ) : (
                <p className="text-body-text">
                  Já tem conta?{" "}
                  <button onClick={() => setMode("login")} className="font-semibold text-primary hover:underline">
                    Fazer login
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
