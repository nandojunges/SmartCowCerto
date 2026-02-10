// src/App.jsx
import { useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { syncAnimaisSeed, syncPending } from "./offline/sync";
import { useFazenda } from "./context/FazendaContext";

// Telas
import Login from "./Auth/Login";
import Cadastro from "./Auth/Cadastro";
import VerificarEmail from "./Auth/VerificarEmail";
import EsqueciSenha from "./Auth/EsqueciSenha";
import SistemaBase from "./layout/SistemaBase";

// Páginas
import Inicio from "./Pages/Inicio/Inicio.jsx";
import Animais from "./Pages/Animais/Animais.jsx";
import Bezerras from "./Pages/Bezerras/Bezerras.jsx";
import Reproducao from "./Pages/Reproducao/Reproducao.jsx";
import Leite from "./Pages/Leite/Leite.jsx";
import Saude from "./Pages/Saude/Saude.jsx";
import ConsumoReposicao from "./Pages/ConsumoReposicao/Estoque.jsx";
import Financeiro from "./Pages/Financeiro/Financeiro.jsx";
import Calendario from "./Pages/Calendario/Calendario.jsx";
import Ajustes from "./Pages/Ajustes/Ajustes.jsx";
import AjustesAcessos from "./Pages/Ajustes/AjustesAcessos.jsx";
import AjustesAparencia from "./Pages/Ajustes/AjustesAparencia.jsx";
import AjustesFazendas from "./Pages/Ajustes/AjustesFazendas.jsx";
import AjustesIdioma from "./Pages/Ajustes/AjustesIdioma.jsx";
import AjustesNotificacoes from "./Pages/Ajustes/AjustesNotificacoes.jsx";
import AjustesPerfil from "./Pages/Ajustes/AjustesPerfil.jsx";
import Admin from "./Pages/Admin/Admin.jsx";
import TecnicoHome from "./Pages/Tecnico/TecnicoHome.jsx";

export default function App() {
  const {
    ready,
    session,
    tipoConta,
    role,
    hasFazendaAtual,
    profileLoading,
    fazendasLoading,
  } = useFazenda();
  const { pathname } = useLocation();

  useEffect(() => {
    const handleOnline = () => {
      syncPending();
      syncAnimaisSeed();
    };

    if (navigator.onLine) {
      handleOnline();
    }

    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const tipoContaNormalizada = tipoConta ? String(tipoConta).trim().toUpperCase() : null;
  const isAssistenteTecnico = tipoContaNormalizada === "ASSISTENTE_TECNICO";
  const hasFazendaSelecionada = hasFazendaAtual;
  const isProdutor = tipoContaNormalizada === "PRODUTOR";
  const isAdminPath = pathname.startsWith("/admin");

  if (!ready) {
    return null;
  }

  const adminFallbackPath = isAssistenteTecnico ? "/tecnico" : "/inicio";

  return (
    <>
      <Routes>
        {/* 🔓 ROTAS PÚBLICAS (sem login) */}
        {!session && (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/verificar-email" element={<VerificarEmail />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />

            {/* qualquer outra rota cai no /login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}

        {/* 🔐 ROTAS PROTEGIDAS (com login) */}
        {session && (
          <>
            {/* redireciona "/" para /inicio por padrão */}
            <Route path="/" element={<Navigate to="/inicio" replace />} />

            {/* 🟥 ADMIN FORA DO LAYOUT (sem menu azul) */}
            <Route
              path="/admin/*"
              element={
                <AdminGuard
                  role={role}
                  tipoConta={tipoContaNormalizada}
                  loading={profileLoading}
                  fallbackPath={adminFallbackPath}
                />
              }
            >
              <Route index element={<Admin />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>

            {/* 🟦 DEMAIS PÁGINAS DENTRO DO SISTEMABASE (com menu azul) */}
            <Route element={<SistemaBase tipoConta={tipoConta} />}>
              <Route
                element={
                <AssistenteGuard
                  isAssistenteTecnico={isAssistenteTecnico}
                  hasFazendaSelecionada={hasFazendaSelecionada}
                  loading={profileLoading}
                  isProdutor={isProdutor}
                  selecionandoFazenda={fazendasLoading}
                  isAdminPath={isAdminPath}
                />
              }
            >
                <Route path="/inicio" element={<Inicio />} />
                <Route path="/animais" element={<Animais />} />
                <Route path="/bezerras" element={<Bezerras />} />
                <Route path="/reproducao" element={<Reproducao />} />
                <Route path="/leite" element={<Leite />} />
                <Route path="/saude" element={<Saude />} />
                <Route path="/consumo" element={<ConsumoReposicao />} />
                <Route path="/financeiro" element={<Financeiro />} />
                <Route path="/calendario" element={<Calendario />} />
                <Route path="/ajustes" element={<Ajustes />} />
                <Route path="/ajustes/acessos" element={<AjustesAcessos />} />
                <Route path="/ajustes/perfil" element={<AjustesPerfil />} />
                <Route path="/ajustes/fazendas" element={<AjustesFazendas />} />
                <Route path="/ajustes/aparencia" element={<AjustesAparencia />} />
                <Route path="/ajustes/idioma" element={<AjustesIdioma />} />
                <Route path="/ajustes/notificacoes" element={<AjustesNotificacoes />} />
              </Route>
              <Route path="/tecnico" element={<TecnicoHome />} />

              {/* qualquer rota desconhecida volta para /inicio */}
              <Route path="*" element={<Navigate to={isAdminPath ? "/admin" : "/inicio"} replace />} />
            </Route>
          </>
        )}
      </Routes>
      <ToastContainer position="top-right" autoClose={3500} pauseOnFocusLoss={false} />
    </>
  );
}

function AssistenteGuard({
  isAssistenteTecnico,
  hasFazendaSelecionada,
  loading,
  isProdutor,
  selecionandoFazenda,
  isAdminPath,
}) {
  useEffect(() => {
    if (loading || isAdminPath) {
      return;
    }
    if (isAssistenteTecnico && !hasFazendaSelecionada) {
      toast.info("Selecione uma fazenda para acessar.");
    }
  }, [hasFazendaSelecionada, isAssistenteTecnico, loading, isAdminPath]);

  if (isAdminPath) {
    return <Outlet />;
  }

  if (loading || (isProdutor && selecionandoFazenda)) {
    return null;
  }

  if (isAssistenteTecnico && !hasFazendaSelecionada) {
    return <Navigate to="/tecnico" replace />;
  }

  return <Outlet />;
}

function AdminGuard({ role, tipoConta, loading, fallbackPath }) {
  if (loading) {
    return null;
  }

  const roleNormalizada = role ? String(role).trim().toUpperCase() : "";
  const tipoContaNormalizada = tipoConta ? String(tipoConta).trim().toUpperCase() : "";
  const isAdmin = roleNormalizada === "ADMIN" || tipoContaNormalizada === "ADMIN";

  if (!isAdmin) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}
