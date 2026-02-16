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
import Desempenho from "./Pages/Desempenho/Desempenho.jsx";
import Ajustes from "./Pages/Ajustes/Ajustes.jsx";
import AjustesAcessos from "./Pages/Ajustes/AjustesAcessos.jsx";
import AjustesAparencia from "./Pages/Ajustes/AjustesAparencia.jsx";
import AjustesFazendas from "./Pages/Ajustes/AjustesFazendas.jsx";
import AjustesIdioma from "./Pages/Ajustes/AjustesIdioma.jsx";
import AjustesNotificacoes from "./Pages/Ajustes/AjustesNotificacoes.jsx";
import AjustesPerfil from "./Pages/Ajustes/AjustesPerfil.jsx";
import Admin from "./Pages/Admin/Admin.jsx";
import TecnicoHome from "./Pages/Tecnico/TecnicoHome.jsx";

import SmartCowShell from "./app/routes/SmartCowShell";

// Mobile
import HomeMobile from "./features/home_mobile/HomeMobile";
import OperacoesMobile from "./features/operacoes_mobile/OperacoesMobile";
import AnimaisMobile from "./features/animais_mobile/AnimaisMobile";
import CadastroAnimalMobile from "./features/animais_mobile/CadastroAnimalMobile";
import LeiteMobile from "./features/leite_mobile/LeiteMobile";
import LancarLeiteMobile from "./features/leite_mobile/LancarLeiteMobile";
import ReproMobile from "./features/repro_mobile/ReproMobile";
import RegistrarIAMobile from "./features/repro_mobile/RegistrarIAMobile";
import RegistrarDGMobile from "./features/repro_mobile/RegistrarDGMobile";
import ProtocolosMobile from "./features/repro_mobile/ProtocolosMobile";
import CalendarioMobile from "./features/calendario_mobile/CalendarioMobile";
import MaisMobile from "./features/mais_mobile/MaisMobile";

export default function App() {
  const {
    ready,
    session,
    tipoConta,
    role,
    hasFazendaAtual,
    profileLoading,
    fazendasLoading,
    canView,
    canEdit,
    permissoesLoading,
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

            {/* ───────────────── MOBILE (/m) ───────────────── */}
            <Route element={<SmartCowShell />}>
              <Route path="/m" element={<Outlet />}>
                <Route index element={<HomeMobile />} />
                <Route path="operacoes" element={<OperacoesMobile />} />

                <Route path="animais" element={<AnimaisMobile />} />
                <Route path="animais/novo" element={<CadastroAnimalMobile />} />

                <Route path="leite" element={<LeiteMobile />} />
                <Route path="leite/lancar" element={<LancarLeiteMobile />} />

                <Route path="repro" element={<ReproMobile />} />
                <Route path="repro/ia" element={<RegistrarIAMobile />} />
                <Route path="repro/dg" element={<RegistrarDGMobile />} />
                <Route path="repro/protocolos" element={<ProtocolosMobile />} />

                <Route path="calendario" element={<CalendarioMobile />} />
                <Route path="mais" element={<MaisMobile />} />
              </Route>
            </Route>

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
            <Route element={<SmartCowShell />}>
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
                  <Route
                    path="/inicio"
                    element={
                      <RequireModuloAccess modulo="inicio" isAssistenteTecnico={isAssistenteTecnico} canView={canView} canEdit={canEdit} permissoesLoading={permissoesLoading}>
                        <Inicio />
                      </RequireModuloAccess>
                    }
                  />
                  <Route
                    path="/animais"
                    element={
                      <RequireModuloAccess modulo="animais" isAssistenteTecnico={isAssistenteTecnico} canView={canView} canEdit={canEdit} permissoesLoading={permissoesLoading}>
                        <Animais />
                      </RequireModuloAccess>
                    }
                  />
                  <Route
                    path="/bezerras"
                    element={
                      <RequireModuloAccess modulo="bezerras" isAssistenteTecnico={isAssistenteTecnico} canView={canView} canEdit={canEdit} permissoesLoading={permissoesLoading}>
                        <Bezerras />
                      </RequireModuloAccess>
                    }
                  />
                  <Route
                    path="/reproducao"
                    element={
                      <RequireModuloAccess modulo="reproducao" isAssistenteTecnico={isAssistenteTecnico} canView={canView} canEdit={canEdit} permissoesLoading={permissoesLoading}>
                        <Reproducao />
                      </RequireModuloAccess>
                    }
                  />
                  <Route
                    path="/leite"
                    element={
                      <RequireModuloAccess modulo="leite" isAssistenteTecnico={isAssistenteTecnico} canView={canView} canEdit={canEdit} permissoesLoading={permissoesLoading}>
                        <Leite />
                      </RequireModuloAccess>
                    }
                  />
                  <Route
                    path="/saude"
                    element={
                      <RequireModuloAccess modulo="saude" isAssistenteTecnico={isAssistenteTecnico} canView={canView} canEdit={canEdit} permissoesLoading={permissoesLoading}>
                        <Saude />
                      </RequireModuloAccess>
                    }
                  />
                  <Route
                    path="/consumo"
                    element={
                      <RequireModuloAccess modulo="consumo" isAssistenteTecnico={isAssistenteTecnico} canView={canView} canEdit={canEdit} permissoesLoading={permissoesLoading}>
                        <ConsumoReposicao />
                      </RequireModuloAccess>
                    }
                  />
                  <Route
                    path="/financeiro"
                    element={
                      <RequireModuloAccess modulo="financeiro" isAssistenteTecnico={isAssistenteTecnico} canView={canView} canEdit={canEdit} permissoesLoading={permissoesLoading}>
                        <Financeiro />
                      </RequireModuloAccess>
                    }
                  />
                  <Route
                    path="/desempenho"
                    element={
                      <RequireModuloAccess modulo="desempenho" isAssistenteTecnico={isAssistenteTecnico} canView={canView} canEdit={canEdit} permissoesLoading={permissoesLoading}>
                        <Desempenho />
                      </RequireModuloAccess>
                    }
                  />
                  <Route
                    path="/calendario"
                    element={
                      <RequireModuloAccess modulo="calendario" isAssistenteTecnico={isAssistenteTecnico} canView={canView} canEdit={canEdit} permissoesLoading={permissoesLoading}>
                        <Calendario />
                      </RequireModuloAccess>
                    }
                  />
                  <Route
                    path="/ajustes"
                    element={
                      <RequireModuloAccess modulo="ajustes" isAssistenteTecnico={isAssistenteTecnico} canView={canView} canEdit={canEdit} permissoesLoading={permissoesLoading}>
                        <Ajustes />
                      </RequireModuloAccess>
                    }
                  />
                  <Route
                    path="/ajustes/acessos"
                    element={
                      <RequireModuloAccess modulo="ajustes" isAssistenteTecnico={isAssistenteTecnico} canView={canView} canEdit={canEdit} permissoesLoading={permissoesLoading}>
                        <AjustesAcessos />
                      </RequireModuloAccess>
                    }
                  />
                  <Route
                    path="/ajustes/perfil"
                    element={
                      <RequireModuloAccess modulo="ajustes" isAssistenteTecnico={isAssistenteTecnico} canView={canView} canEdit={canEdit} permissoesLoading={permissoesLoading}>
                        <AjustesPerfil />
                      </RequireModuloAccess>
                    }
                  />
                  <Route
                    path="/ajustes/fazendas"
                    element={
                      <RequireModuloAccess modulo="ajustes" isAssistenteTecnico={isAssistenteTecnico} canView={canView} canEdit={canEdit} permissoesLoading={permissoesLoading}>
                        <AjustesFazendas />
                      </RequireModuloAccess>
                    }
                  />
                  <Route
                    path="/ajustes/aparencia"
                    element={
                      <RequireModuloAccess modulo="ajustes" isAssistenteTecnico={isAssistenteTecnico} canView={canView} canEdit={canEdit} permissoesLoading={permissoesLoading}>
                        <AjustesAparencia />
                      </RequireModuloAccess>
                    }
                  />
                  <Route
                    path="/ajustes/idioma"
                    element={
                      <RequireModuloAccess modulo="ajustes" isAssistenteTecnico={isAssistenteTecnico} canView={canView} canEdit={canEdit} permissoesLoading={permissoesLoading}>
                        <AjustesIdioma />
                      </RequireModuloAccess>
                    }
                  />
                  <Route
                    path="/ajustes/notificacoes"
                    element={
                      <RequireModuloAccess modulo="ajustes" isAssistenteTecnico={isAssistenteTecnico} canView={canView} canEdit={canEdit} permissoesLoading={permissoesLoading}>
                        <AjustesNotificacoes />
                      </RequireModuloAccess>
                    }
                  />
                </Route>

                <Route path="/tecnico" element={<TecnicoHome />} />

                {/* qualquer rota desconhecida volta para /inicio */}
                <Route
                  path="*"
                  element={<Navigate to={isAdminPath ? "/admin" : "/inicio"} replace />}
                />
              </Route>
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
    if (loading || isAdminPath) return;

    if (isAssistenteTecnico && !hasFazendaSelecionada) {
      toast.info("Selecione uma fazenda para acessar.");
    }
  }, [hasFazendaSelecionada, isAssistenteTecnico, loading, isAdminPath]);

  if (isAdminPath) return <Outlet />;

  if (loading || (isProdutor && selecionandoFazenda)) return null;

  if (isAssistenteTecnico && !hasFazendaSelecionada) {
    return <Navigate to="/tecnico" replace />;
  }

  return <Outlet />;
}

function AdminGuard({ role, tipoConta, loading, fallbackPath }) {
  if (loading) return null;

  const roleNormalizada = role ? String(role).trim().toUpperCase() : "";
  const tipoContaNormalizada = tipoConta ? String(tipoConta).trim().toUpperCase() : "";
  const isAdmin = roleNormalizada === "ADMIN" || tipoContaNormalizada === "ADMIN";

  if (!isAdmin) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}

function RequireModuloAccess({
  modulo,
  isAssistenteTecnico,
  canView,
  permissoesLoading,
  children,
}) {
  if (!isAssistenteTecnico) return children;
  if (permissoesLoading) return null;
  if (!canView(modulo)) return <Navigate to="/inicio" replace />;

  return children;
}
