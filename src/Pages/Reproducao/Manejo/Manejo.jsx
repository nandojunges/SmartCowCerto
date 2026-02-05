import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useFazenda } from "../../../context/FazendaContext";

import Inseminacao from "./Inseminacao";
import Diagnostico from "./Diagnostico";
import AplicarProtocolo from "./AplicarProtocolo";
import OcorrenciaClinica from "./OcorrenciaClinica";

/* =========================================================
   DESIGN SYSTEM - PROFISSIONAL/MÉDICO
   ========================================================= */
const theme = {
  colors: {
    // Paleta monocromática Slate + um tom de Indigo sóbrio
    slate: { 50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8", 500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a", 950: "#020617" },
    accent: { 50: "#eef2ff", 100: "#e0e7ff", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca", 900: "#312e81" },
    success: "#059669", warning: "#d97706", danger: "#dc2626",
  },
  // Bordas mais quadradas (profissional) vs arredondadas (infantil)
  radius: { sm: "4px", md: "6px", lg: "8px" },
};

// Ícones com stroke mais fino (1.5px) e menor tamanho - mais elegantes
const Icons = {
  close: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  stethoscope: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>,
  syringe: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m10 17-5 5"/><path d="m14 14-2 2"/></svg>,
  calendar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  alert: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>,
  arrowLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  chevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
};

/* =========================================================
   HELPERS
   ========================================================= */
const today = () => new Date();
function toISODate(dt) { return dt.toISOString().split('T')[0]; }
function brToISO(br) {
  const m = String(br || "").trim().match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  const dt = new Date(+m[3], +m[2] - 1, +m[1]);
  return Number.isFinite(dt.getTime()) ? toISODate(dt) : null;
}

async function insertReproEvento(payload) {
  const { data, error } = await supabase.from("repro_eventos").insert([payload]).select("*").maybeSingle();
  if (error) throw error;
  return data;
}

/* =========================================================
   COMPONENTES DE UI SOBRIOS
   ========================================================= */

// Navegação lateral tipo "Rail" - muito usada em software profissional (Linear, Figma, etc)
const NavItem = ({ icon: Icon, label, description, active, onClick, color }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      width: "100%",
      alignItems: "flex-start",
      gap: "12px",
      padding: "12px 16px",
      marginBottom: "4px",
      background: active ? theme.colors.accent[50] : "transparent",
      border: "none",
      borderLeft: active ? `2px solid ${theme.colors.accent[600]}` : "2px solid transparent",
      borderRadius: `0 ${theme.radius.md} ${theme.radius.md} 0`,
      cursor: "pointer",
      textAlign: "left",
      transition: "all 0.15s ease",
      opacity: active ? 1 : 0.7,
    }}
    onMouseEnter={(e) => {
      if (!active) e.currentTarget.style.background = theme.colors.slate[100];
    }}
    onMouseLeave={(e) => {
      if (!active) e.currentTarget.style.background = "transparent";
    }}
  >
    <div style={{ 
      color: active ? theme.colors.accent[600] : theme.colors.slate[500],
      marginTop: "2px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "20px",
      height: "20px"
    }}>
      <Icon />
    </div>
    
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ 
        fontSize: "13px", 
        fontWeight: active ? 600 : 500, 
        color: active ? theme.colors.accent[900] : theme.colors.slate[800],
        marginBottom: "2px",
        letterSpacing: "-0.01em"
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: "12px", 
        color: theme.colors.slate[500], 
        lineHeight: 1.4,
        fontWeight: 400,
        display: active ? "block" : "none" // Só mostra descrição quando ativo para economizar espaço visual
      }}>
        {description}
      </div>
    </div>
    
    {active && (
      <div style={{ color: theme.colors.accent[600], marginTop: "2px" }}>
        <Icons.chevronRight />
      </div>
    )}
  </button>
);

export default function VisaoGeral({ open = false, animal = null, initialTab = null, onClose, onSaved }) {
  const { fazendaAtualId } = useFazenda();
  const animalId = useMemo(() => animal?.id ?? animal?.animal_id ?? null, [animal]);
  const [inseminadores, setInseminadores] = useState([]);
  const [touros, setTouros] = useState([]);
  
  const [selectedType, setSelectedType] = useState(initialTab);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const fetchInseminadores = async () => {
      if (!open || !fazendaAtualId) {
        setInseminadores([]);
        return;
      }

      const { data, error } = await supabase
        .from("inseminadores")
        .select("id, nome")
        .eq("fazenda_id", fazendaAtualId)
        .eq("ativo", true)
        .order("nome", { ascending: true });

      if (error) {
        console.error("Erro ao carregar inseminadores:", error);
        setInseminadores([]);
        return;
      }

      setInseminadores(Array.isArray(data) ? data : []);
    };

    fetchInseminadores();
  }, [open, fazendaAtualId]);

  useEffect(() => {
    const fetchTouros = async () => {
      if (!open || !fazendaAtualId) {
        setTouros([]);
        return;
      }

      const { data, error } = await supabase
        .from("estoque_produtos")
        .select("id, nome_comercial, categoria, sub_tipo, ativo")
        .eq("fazenda_id", fazendaAtualId)
        .eq("ativo", true)
        .eq("categoria", "Reprodução")
        .in("sub_tipo", ["Sêmen", "Embrião"])
        .order("nome_comercial", { ascending: true });

      if (error) {
        console.error("Erro ao carregar produtos de reprodução:", error);
        setTouros([]);
        return;
      }

      const mapped = (Array.isArray(data) ? data : []).map((item) => ({
        id: item.id,
        nome: item.nome_comercial,
        restantes: undefined,
      }));

      setTouros(mapped);
    };

    fetchTouros();
  }, [open, fazendaAtualId]);

  const handleClose = () => {
    setSelectedType(null);
    onClose?.();
  };

  const handleSaved = async () => {
    await onSaved?.();
    handleClose();
  };

  const handleSubmit = async (payload) => {
    if (!fazendaAtualId || !animalId) return alert("Dados inválidos");
    
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const userId = authData?.user?.id;
      if (!userId) throw new Error("Sessão inválida (auth.uid vazio)");

      if (payload.kind === "DG") {
        const mapa = { Prenhe: "POSITIVO", Vazia: "NEGATIVO", "Não vista": "PENDENTE" };
        await insertReproEvento({
          fazenda_id: fazendaAtualId,
          animal_id: animalId,
          tipo: "DG",
          data_evento: brToISO(payload.data) || toISODate(today()),
          user_id: userId,
          resultado_dg: mapa[payload.dg] || "PENDENTE",
          observacoes: payload?.extras?.obs,
          meta: payload?.extras,
        });
      } else if (payload.kind === "IA") {
        await insertReproEvento({
          fazenda_id: fazendaAtualId,
          animal_id: animalId,
          tipo: "IA",
          data_evento: brToISO(payload.data) || toISODate(today()),
          user_id: userId,
          inseminador_id: payload.inseminadorId || null,
          touro_id: payload.touroId || null,
          touro_nome: payload.touroNome || null,
          razao: payload?.extras?.razao || null,
          tipo_semen: payload?.extras?.tipoSemen || null,
          palhetas: payload?.extras?.palhetas ?? null,
          lote: payload?.extras?.lote || null,
          observacoes: payload.obs || null,
          meta: payload?.extras || null,
        });
      }
      await handleSaved();
    } catch (e) {
      console.error(e);
      alert(e?.message || "Erro ao salvar");
    }
  };

  if (!open) return null;

  const eventTypes = [
    {
      id: "DG",
      title: "Diagnóstico",
      fullTitle: "Diagnóstico de Gestação",
      description: "Palpação, ultrassom ou Doppler",
      icon: Icons.stethoscope,
      component: Diagnostico,
    },
    {
      id: "IA",
      title: "Inseminação",
      fullTitle: "Inseminação Artificial",
      description: "Registro de cobertura ou IA",
      icon: Icons.syringe,
      component: Inseminacao,
    },
    {
      id: "PROTOCOLO",
      title: "Protocolo",
      fullTitle: "Protocolo Hormonal",
      description: "Sincronização de cio ou IATF",
      icon: Icons.calendar,
      component: AplicarProtocolo,
    },
    {
      id: "CLINICA",
      title: "Clínica",
      fullTitle: "Ocorrência Clínica",
      description: "Abortos, tratamentos, manejos",
      icon: Icons.alert,
      component: OcorrenciaClinica,
    },
  ];

  const currentEvent = eventTypes.find(e => e.id === selectedType);
  const FormComponent = currentEvent?.component;

  return (
    <div 
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(2, 6, 23, 0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div style={{
        background: "#fff", 
        width: "min(900px, 95vw)", 
        height: "min(700px, 90vh)",
        borderRadius: theme.radius.lg, 
        overflow: "hidden",
        display: "flex",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
        border: `1px solid ${theme.colors.slate[200]}`,
        opacity: isAnimating ? 0 : 1,
        transform: isAnimating ? "scale(0.98)" : "scale(1)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        
        {/* SIDEBAR - Navegação minimalista */}
        <div style={{
          width: "240px",
          background: theme.colors.slate[50],
          borderRight: `1px solid ${theme.colors.slate[200]}`,
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Header da Sidebar */}
          <div style={{
            padding: "20px 16px 16px",
            borderBottom: `1px solid ${theme.colors.slate[200]}`,
          }}>
            <div style={{ 
              fontSize: "11px", 
              fontWeight: 600, 
              color: theme.colors.slate[500], 
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "4px"
            }}>
              Manejo Reprodutivo
            </div>
            <div style={{ 
              fontSize: "16px", 
              fontWeight: 700, 
              color: theme.colors.slate[900],
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {animal?.numero ? `Animal ${animal.numero}` : 'Novo Registro'}
            </div>
            {animal?.lote && (
              <div style={{ 
                fontSize: "12px", 
                color: theme.colors.slate[500], 
                marginTop: "2px" 
              }}>
                Lote: {animal.lote}
              </div>
            )}
          </div>

          {/* Menu de Navegação */}
          <div style={{ 
            flex: 1, 
            overflowY: "auto", 
            padding: "12px 0",
          }}>
            <div style={{ 
              padding: "0 12px 8px 16px", 
              fontSize: "11px", 
              fontWeight: 600, 
              color: theme.colors.slate[400],
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Selecione o tipo
            </div>
            
            {eventTypes.map(type => (
              <NavItem
                key={type.id}
                icon={type.icon}
                label={type.title}
                description={type.description}
                active={selectedType === type.id}
                onClick={() => setSelectedType(type.id)}
              />
            ))}
          </div>

          {/* Footer da Sidebar com dica */}
          <div style={{
            padding: "16px",
            borderTop: `1px solid ${theme.colors.slate[200]}`,
            background: theme.colors.slate[100],
          }}>
            <div style={{ 
              fontSize: "11px", 
              color: theme.colors.slate[500], 
              lineHeight: 1.5 
            }}>
              <strong style={{ color: theme.colors.slate[700] }}>Dica:</strong> Use atalhos de teclado para navegar mais rápido entre os registros.
            </div>
          </div>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          background: "#fff"
        }}>
          {/* Header do Conteúdo */}
          <div style={{
            height: "64px",
            borderBottom: `1px solid ${theme.colors.slate[200]}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}>
            <div>
              <h2 style={{ 
                margin: 0, 
                fontSize: "16px", 
                fontWeight: 600, 
                color: theme.colors.slate[900],
                letterSpacing: "-0.01em"
              }}>
                {currentEvent?.fullTitle || "Selecione uma opção"}
              </h2>
              {currentEvent && (
                <p style={{ 
                  margin: "2px 0 0 0", 
                  fontSize: "13px", 
                  color: theme.colors.slate[500] 
                }}>
                  Preencha os dados do registro abaixo
                </p>
              )}
            </div>
            
            <button
              onClick={handleClose}
              style={{ 
                background: "transparent", 
                border: "none", 
                padding: "8px", 
                borderRadius: theme.radius.md,
                cursor: "pointer",
                color: theme.colors.slate[500],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.slate[100];
                e.currentTarget.style.color = theme.colors.slate[800];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = theme.colors.slate[500];
              }}
              title="Fechar (Esc)"
            >
              <Icons.close />
            </button>
          </div>

          {/* Área do Formulário */}
          <div style={{ 
            flex: 1, 
            overflowY: "auto",
            padding: "32px",
            background: "#fff"
          }}>
            {!selectedType ? (
              <div style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: theme.colors.slate[400],
                textAlign: "center",
              }}>
                <div style={{ 
                  width: "48px", 
                  height: "48px", 
                  borderRadius: "50%",
                  background: theme.colors.slate[100],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  color: theme.colors.slate[400]
                }}>
                  <Icons.stethoscope />
                </div>
                <p style={{ margin: 0, fontSize: "14px" }}>
                  Selecione um tipo de evento no menu lateral<br/>
                  para iniciar o registro
                </p>
              </div>
            ) : (
              <FormComponent 
                animal={animal} 
                inseminadores={inseminadores}
                touros={touros}
                onSubmit={handleSubmit}
                key={selectedType} // Força remount ao trocar de aba
              />
            )}
          </div>

          {/* Footer com Ações */}
          {selectedType && (
            <div style={{
              height: "72px",
              borderTop: `1px solid ${theme.colors.slate[200]}`,
              background: theme.colors.slate[50],
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
            }}>
              <button
                onClick={() => setSelectedType(null)}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: theme.colors.slate[600],
                  background: "transparent",
                  border: "none",
                  borderRadius: theme.radius.md,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.slate[200]}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                Cancelar
              </button>
              
              <button
                onClick={() => {
                  document.getElementById(`form-${selectedType}`)?.requestSubmit();
                }}
                style={{
                  padding: "8px 20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#fff",
                  background: theme.colors.accent[600],
                  border: "none",
                  borderRadius: theme.radius.md,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 1px 2px 0 rgba(0,0,0,0.1)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.accent[700];
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.colors.accent[600];
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0,0,0,0.1)";
                }}
              >
                <Icons.check />
                Salvar Registro
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
