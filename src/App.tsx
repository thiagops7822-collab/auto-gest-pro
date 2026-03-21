import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import OrdensServico from "./pages/OrdensServico";
import CustosFixos from "./pages/CustosFixos";
import Funcionarios from "./pages/Funcionarios";
import Cartoes from "./pages/Cartoes";
import Terceiros from "./pages/Terceiros";
import Relatorios from "./pages/Relatorios";
import SaidasNaoPlanejadas from "./pages/SaidasNaoPlanejadas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/ordens-servico" element={<OrdensServico />} />
            <Route path="/custos" element={<CustosFixos />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/cartoes" element={<Cartoes />} />
            <Route path="/terceiros" element={<Terceiros />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
