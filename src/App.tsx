import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { DataProvider } from "@/contexts/DataContext";
import Index from "./pages/Index";
import OrdensServico from "./pages/OrdensServico";
import CustosFixos from "./pages/CustosFixos";
import Funcionarios from "./pages/Funcionarios";
import Cartoes from "./pages/Cartoes";
import Terceiros from "./pages/Terceiros";
import Relatorios from "./pages/Relatorios";

import Orcamentos from "./pages/Orcamentos";
import Financeiro from "./pages/Financeiro";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
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
              <Route path="/orcamentos" element={<Orcamentos />} />
              <Route path="/relatorios" element={<Relatorios />} />
              
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
