import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import UserManagement from "@/pages/UserManagement";
import LeadQueue from "@/pages/LeadQueue";
import LeadForm from "@/pages/LeadForm";
import LeadReport from "@/pages/LeadReport";
import Pipeline from "@/pages/Pipeline";
import Benchmarks from "@/pages/Benchmarks";
import ClientesList from "@/pages/ClientesList";
import ClienteDetail from "@/pages/ClienteDetail";
import Diagnostico from "@/pages/Diagnostico";
import MotorConfig from "@/pages/MotorConfig";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Login />} />
            <Route path="/diagnostico/:token" element={<Diagnostico />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/pipeline" element={<Pipeline />} />
                      <Route path="/leads" element={<LeadQueue />} />
                      <Route path="/leads/novo" element={<LeadForm />} />
                      <Route path="/leads/:id/relatorio" element={<LeadReport />} />
                      <Route path="/clientes" element={<Clientes />} />
                      <Route path="/benchmarks" element={<Benchmarks />} />
                      <Route path="/configuracoes/motor" element={<MotorConfig />} />
                      <Route path="/usuarios" element={<UserManagement />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
