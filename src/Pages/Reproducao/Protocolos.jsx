// src/Pages/Reproducao/Protocolos.jsx
// -----------------------------------------------------------------------------
// Aba "Protocolos" — Redesign 2025
// Layout: Cards + Timeline vertical + Glassmorphism
// Backend: Supabase (mesma estrutura)
// -----------------------------------------------------------------------------

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useFazenda } from "../../context/FazendaContext";

/* ========================= DESIGN TOKENS ========================= */
const TOKENS = {
  colors: {
    primary: "#2563EB",
    primaryDark: "#1D4ED8",
    primaryLight: "#DBEAFE",
    secondary: "#7C3AED",
    danger: "#DC2626",
    dangerLight: "#FEE2E2",
    success: "#059669",
    warning: "#D97706",
    gray50: "#F9FAFB",
    gray100: "#F3F4F6",
    gray200: "#E5E7EB",
    gray300: "#D1D5DB",
    gray400: "#9CA3AF",
    gray500: "#6B7280",
    gray600: "#4B5563",
    gray700: "#374151",
    gray800: "#1F2937",
    gray900: "#111827",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    glow: "0 0 0 3px rgba(37, 99, 235, 0.15)",
  },
  radii: {
    sm: "6px",
    md: "10px",
    lg: "14px",
    xl: "18px",
    full: "9999px",
  },
  transitions: {
    fast: "all 0.15s ease",
    normal: "all 0.2s ease",
    slow: "all 0.3s ease",
  },
};

/* ========================= COMPONENTES REUTILIZÁVEIS ========================= */
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    search: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    plus: <path d="M12 4v16m8-8H4" />,
    trash: <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    edit: <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    chevronDown: <path d="M19 9l-7 7-7-7" />,
    chevronUp: <path d="M5 15l7-7 7 7" />,
    calendar: <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    duplicate: <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />,
    cow: <path d="M12 2a3 3 0 00-3 3v2H7a3 3 0 00-3 3v8a3 3 0 003 3h10a3 3 0 003-3v-8a3 3 0 00-3-3h-2V5a3 3 0 00-3-3zM9 8h6M9 12h6M9 16h6" />, // Simplificado
    flask: <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />,
    check: <path d="M5 13l4 4L19 7" />,
    clock: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    close: <path d="M6 18L18 6M6 6l12 12" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  };
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      {icons[name] || null}
    </svg>
  );
};

const Badge = ({ children, variant = "default", size = "md" }) => {
  const variants = {
    default: { bg: TOKENS.colors.gray100, color: TOKENS.colors.gray700, border: TOKENS.colors.gray200 },
    primary: { bg: TOKENS.colors.primaryLight, color: TOKENS.colors.primaryDark, border: "#BFDBFE" },
    success: { bg: "#D1FAE5", color: TOKENS.colors.success, border: "#A7F3D0" },
    danger: { bg: TOKENS.colors.dangerLight, color: TOKENS.colors.danger, border: "#FECACA" },
    warning: { bg: "#FEF3C7", color: TOKENS.colors.warning, border: "#FDE68A" },
    purple: { bg: "#EDE9FE", color: TOKENS.colors.secondary, border: "#DDD6FE" },
  };
  
  const v = variants[variant];
  const sizes = {
    sm: { padding: "2px 8px", fontSize: "11px" },
    md: { padding: "4px 10px", fontSize: "12px" },
    lg: { padding: "6px 12px", fontSize: "13px" },
  };
  const s = sizes[size];
  
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      background: v.bg,
      color: v.color,
      border: `1px solid ${v.border}`,
      borderRadius: TOKENS.radii.full,
      fontWeight: "600",
      ...s,
      transition: TOKENS.transitions.fast,
    }}>
      {children}
    </span>
  );
};

const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  onClick, 
  disabled = false,
  icon = null,
  style = {} 
}) => {
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${TOKENS.colors.primary}, ${TOKENS.colors.primaryDark})`,
      color: "#fff",
      border: "none",
      boxShadow: TOKENS.shadows.md,
    },
    secondary: {
      background: "#fff",
      color: TOKENS.colors.gray700,
      border: `1px solid ${TOKENS.colors.gray200}`,
      boxShadow: TOKENS.shadows.sm,
    },
    ghost: {
      background: "transparent",
      color: TOKENS.colors.gray600,
      border: "none",
      boxShadow: "none",
    },
    danger: {
      background: "#fff",
      color: TOKENS.colors.danger,
      border: `1px solid ${TOKENS.colors.dangerLight}`,
      boxShadow: TOKENS.shadows.sm,
    },
  };
  
  const sizes = {
    sm: { height: "32px", padding: "0 12px", fontSize: "13px" },
    md: { height: "40px", padding: "0 16px", fontSize: "14px" },
    lg: { height: "48px", padding: "0 24px", fontSize: "15px" },
  };
  
  const v = variants[variant];
  const s = sizes[size];
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        borderRadius: TOKENS.radii.md,
        fontWeight: "600",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: TOKENS.transitions.normal,
        ...v,
        ...s,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && variant === "primary") {
          e.target.style.transform = "translateY(-1px)";
          e.target.style.boxShadow = TOKENS.shadows.lg;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && variant === "primary") {
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = v.boxShadow;
        }
      }}
    >
      {icon && <Icon name={icon} size={size === "sm" ? 16 : 18} />}
      {children}
    </button>
  );
};

/* ========================= HELPERS DE DADOS ========================= */
const HORMONIOS = [
  "Benzoato de Estradiol",
  "Cipionato de Estradiol",
  "PGF2α",
  "GnRH",
  "eCG",
  "hCG",
  "Progesterona",
];

const ACOES = [
  "Inserir Dispositivo",
  "Retirar Dispositivo",
  "Inseminação",
  "Observação de Cio",
  "Exame",
];

const TEMPLATES = {
  IATF: [
    { dia: 0, hormonio: "Benzoato de Estradiol", tipo: "hormonio" },
    { dia: 0, acao: "Inserir Dispositivo", tipo: "acao" },
    { dia: 7, hormonio: "PGF2α", tipo: "hormonio" },
    { dia: 7, acao: "Retirar Dispositivo", tipo: "acao" },
    { dia: 9, acao: "Inseminação", tipo: "acao" },
  ],
  "PRÉ-SINCRONIZAÇÃO": [
    { dia: 0, hormonio: "GnRH", tipo: "hormonio" },
    { dia: 7, hormonio: "PGF2α", tipo: "hormonio" },
  ],
};

const pad2 = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseDateLoose = (s) => {
  if (!s) return null;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("/");
    return new Date(+yyyy, +mm - 1, +dd);
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const maxDiaInseminacao = (etapas = []) => {
  const diasInsem = (etapas || [])
    .filter((e) => String(e?.acao || e?.descricao || "").toLowerCase().includes("insemin"))
    .map((e) => +e?.dia)
    .filter((n) => Number.isFinite(n));
  if (diasInsem.length) return Math.max(...diasInsem);
  const diasAll = (etapas || []).map((e) => +e?.dia).filter((n) => Number.isFinite(n));
  return diasAll.length ? Math.max(...diasAll) : 0;
};

const proximaEtapaInfo = (etapas = [], dataInicio, refDate = new Date()) => {
  const d0 = parseDateLoose(dataInicio);
  if (!d0) return { descricao: "—", data: null };
  const diff = Math.floor((new Date(toISO(refDate)) - new Date(toISO(d0))) / 86400000) || 0;
  const ordenadas = [...(etapas || [])]
    .map((e, i) => ({
      ...e,
      dia: Number.isFinite(+e?.dia) ? +e.dia : i === 0 ? 0 : i,
      _desc: e?.descricao || e?.acao || e?.hormonio || "Etapa",
    }))
    .sort((a, b) => a.dia - b.dia);
  const prox = ordenadas.find((e) => e.dia >= diff);
  if (!prox) return { descricao: "Concluído", data: null };
  const data = addDays(d0, prox.dia);
  return { descricao: prox._desc, data };
};

/* ========================= MINI COMPONENTES ========================= */
const TimelineItem = ({ dia, etapas, isLast, onAdd, onRemoveEtapa, onRemoveDia, formOpen, formData, setFormData, onSaveForm, onCancelForm }) => {
  const hasEtapas = etapas && etapas.length > 0;
  
  return (
    <div style={{ display: "flex", gap: "16px", position: "relative" }}>
      {/* Linha vertical */}
      {!isLast && (
        <div style={{
          position: "absolute",
          left: "20px",
          top: "40px",
          bottom: "-16px",
          width: "2px",
          background: TOKENS.colors.gray200,
          zIndex: 0,
        }} />
      )}
      
      {/* Bolinha do dia */}
      <div style={{
        width: "40px",
        height: "40px",
        borderRadius: TOKENS.radii.full,
        background: hasEtapas ? TOKENS.colors.primary : "#fff",
        border: `2px solid ${hasEtapas ? TOKENS.colors.primary : TOKENS.colors.gray300}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800",
        fontSize: "13px",
        color: hasEtapas ? "#fff" : TOKENS.colors.gray500,
        flexShrink: 0,
        zIndex: 1,
        boxShadow: hasEtapas ? `0 0 0 4px ${TOKENS.colors.primaryLight}` : "none",
      }}>
        D{/*dia*/}
      </div>
      
      {/* Conteúdo */}
      <div style={{ flex: 1, paddingBottom: "24px" }}>
        <div style={{
          background: "#fff",
          border: `1px solid ${TOKENS.colors.gray200}`,
          borderRadius: TOKENS.radii.lg,
          padding: "16px",
          boxShadow: TOKENS.shadows.sm,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: hasEtapas ? "12px" : "0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon name="calendar" size={16} color={TOKENS.colors.gray400} />
              <span style={{ fontWeight: "700", color: TOKENS.colors.gray800, fontSize: "15px" }}>
                Dia {dia}
              </span>
              {hasEtapas && (
                <Badge variant="primary" size="sm">
                  {etapas.length} etapa{etapas.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            <div style={{ display: "flex", gap: "8px" }}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onAdd(dia)}
                icon={formOpen ? "chevronUp" : "plus"}
                style={{ color: TOKENS.colors.primary }}
              >
                {formOpen ? "Fechar" : "Adicionar"}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onRemoveDia(dia)}
                icon="trash"
                style={{ color: TOKENS.colors.gray400 }}
              />
            </div>
          </div>
          
          {/* Lista de etapas */}
          {hasEtapas && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: formOpen ? "16px" : "0" }}>
              {etapas.map((etapa, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: TOKENS.colors.gray50,
                    borderRadius: TOKENS.radii.md,
                    border: `1px solid ${TOKENS.colors.gray100}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {etapa.hormonio ? (
                      <>
                        <div style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: TOKENS.radii.full,
                          background: TOKENS.colors.primaryLight,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <Icon name="flask" size={14} color={TOKENS.colors.primary} />
                        </div>
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "13px", color: TOKENS.colors.gray800 }}>
                            {etapa.hormonio}
                          </div>
                          <div style={{ fontSize: "11px", color: TOKENS.colors.gray400 }}>Hormônio</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: TOKENS.radii.full,
                          background: "#E0E7FF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <Icon name="check" size={14} color={TOKENS.colors.secondary} />
                        </div>
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "13px", color: TOKENS.colors.gray800 }}>
                            {etapa.acao}
                          </div>
                          <div style={{ fontSize: "11px", color: TOKENS.colors.gray400 }}>Ação</div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onRemoveEtapa(dia, idx)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      borderRadius: TOKENS.radii.sm,
                      color: TOKENS.colors.gray400,
                      transition: TOKENS.transitions.fast,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = TOKENS.colors.danger}
                    onMouseLeave={(e) => e.currentTarget.style.color = TOKENS.colors.gray400}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Formulário inline */}
          {formOpen && (
            <div style={{
              background: TOKENS.colors.gray50,
              borderRadius: TOKENS.radii.md,
              padding: "16px",
              border: `1px dashed ${TOKENS.colors.gray300}`,
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: TOKENS.colors.gray600, marginBottom: "6px" }}>
                    Hormônio (opcional)
                  </label>
                  <select
                    value={formData.hormonio}
                    onChange={(e) => setFormData(f => ({ ...f, hormonio: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: TOKENS.radii.md,
                      border: `1px solid ${TOKENS.colors.gray200}`,
                      background: "#fff",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  >
                    <option value="">Nenhum</option>
                    {HORMONIOS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: TOKENS.colors.gray600, marginBottom: "6px" }}>
                    Ação (opcional)
                  </label>
                  <select
                    value={formData.acao}
                    onChange={(e) => setFormData(f => ({ ...f, acao: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: TOKENS.radii.md,
                      border: `1px solid ${TOKENS.colors.gray200}`,
                      background: "#fff",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  >
                    <option value="">Nenhuma</option>
                    {ACOES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <Button variant="ghost" size="sm" onClick={onCancelForm}>Cancelar</Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={onSaveForm}
                  disabled={!formData.hormonio && !formData.acao}
                >
                  Adicionar Etapa
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========================= MODAL REDESIGN ========================= */
function ModalProtocolo({ onFechar, onSalvar, protocoloInicial = null }) {
  const isEdit = !!protocoloInicial?.id;
  
  const [tipo, setTipo] = useState((protocoloInicial?.tipo || "IATF").toUpperCase());
  const [nome, setNome] = useState(protocoloInicial?.nome || "");
  const [descricao, setDescricao] = useState(protocoloInicial?.descricao || "");
  const [dias, setDias] = useState(() => {
    if (!protocoloInicial) return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const setD = new Set((protocoloInicial?.etapas || []).map((e) => e?.dia ?? 0));
    const arr = Array.from(setD).sort((a, b) => a - b);
    return arr.length ? arr : [0];
  });
  const [etapas, setEtapas] = useState(() => {
    if (!protocoloInicial) return {};
    return (protocoloInicial?.etapas || []).reduce((acc, e) => {
      const d = e?.dia ?? 0;
      (acc[d] ||= []).push({ hormonio: e?.hormonio || "", acao: e?.acao || "" });
      return acc;
    }, {});
  });
  
  const [formDia, setFormDia] = useState(null);
  const [form, setForm] = useState({ hormonio: "", acao: "" });
  const [activeTab, setActiveTab] = useState("builder"); // builder | preview
  
  const overlayRef = useRef(null);

  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = prevHtml; };
  }, []);

  const aplicarTemplate = (tplKey) => {
    const tpl = TEMPLATES[tplKey];
    if (!tpl) return;
    const novo = {};
    tpl.forEach((e) => {
      (novo[e.dia] ||= []).push({ hormonio: e.hormonio || "", acao: e.acao || "" });
    });
    const ds = Object.keys(novo).map(Number).sort((a, b) => a - b);
    setDias(ds);
    setEtapas(novo);
    setFormDia(null);
  };

  const adicionarDia = () => {
    const n = dias.length ? Math.max(...dias) + 1 : 0;
    setDias([...dias, n]);
  };

  const removerDia = (d) => {
    setDias(arr => arr.filter(x => x !== d));
    setEtapas(prev => {
      const cp = { ...prev };
      delete cp[d];
      return cp;
    });
    if (formDia === d) setFormDia(null);
  };

  const abrirEtapa = (d) => {
    if (formDia === d) {
      setFormDia(null);
    } else {
      setFormDia(d);
      setForm({ hormonio: "", acao: "" });
    }
  };

  const salvarEtapaForm = () => {
    if (formDia == null) return;
    if (!form.hormonio && !form.acao) return;
    
    setEtapas(prev => {
      const list = prev[formDia] ? [...prev[formDia]] : [];
      list.push({ hormonio: form.hormonio || "", acao: form.acao || "" });
      return { ...prev, [formDia]: list };
    });
    setForm({ hormonio: "", acao: "" });
  };

  const removerEtapa = (dia, idx) => {
    setEtapas(prev => {
      const list = prev[dia] ? [...prev[dia]] : [];
      list.splice(idx, 1);
      return { ...prev, [dia]: list };
    });
  };

  const totalEtapas = Object.values(etapas).reduce((s, arr) => s + (arr?.length || 0), 0);
  const valido = nome.trim() && totalEtapas > 0 && tipo;

  const handleSalvar = () => {
    if (!valido) return;
    const etapasList = [];
    Object.entries(etapas).forEach(([d, arr]) => {
      (arr || []).forEach(e => etapasList.push({ ...e, dia: parseInt(d, 10) }));
    });
    etapasList.sort((a, b) => a.dia - b.dia);
    
    onSalvar?.({
      nome,
      descricao,
      tipo: String(tipo).toUpperCase(),
      etapas: etapasList,
    });
    onFechar?.();
  };

  // Preview data
  const previewData = useMemo(() => {
    return dias.map(d => ({
      dia: d,
      etapas: etapas[d] || []
    })).sort((a, b) => a.dia - b.dia);
  }, [dias, etapas]);

  return (
    <div 
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => e.target === overlayRef.current && onFechar?.()}
    >
      <div style={{
        background: "#fff",
        width: "100%",
        maxWidth: "900px",
        height: "90vh",
        borderRadius: TOKENS.radii.xl,
        boxShadow: TOKENS.shadows.xl,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          background: "#fff",
          borderBottom: `1px solid ${TOKENS.colors.gray200}`,
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: TOKENS.radii.lg,
              background: TOKENS.colors.primaryLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Icon name="flask" size={20} color={TOKENS.colors.primary} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: TOKENS.colors.gray900 }}>
                {isEdit ? "Editar Protocolo" : "Novo Protocolo"}
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: TOKENS.colors.gray500 }}>
                Configure as etapas do tratamento
              </p>
            </div>
          </div>
          
          <button 
            onClick={onFechar}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: TOKENS.radii.full,
              color: TOKENS.colors.gray400,
              transition: TOKENS.transitions.fast,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = TOKENS.colors.gray100}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: "4px",
          padding: "0 24px",
          borderBottom: `1px solid ${TOKENS.colors.gray200}`,
        }}>
          {[
            { id: "builder", label: "Construtor", icon: "menu" },
            { id: "preview", label: "Visualização", icon: "calendar" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${activeTab === tab.id ? TOKENS.colors.primary : "transparent"}`,
                color: activeTab === tab.id ? TOKENS.colors.primary : TOKENS.colors.gray500,
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "-1px",
                transition: TOKENS.transitions.fast,
              }}
            >
              <Icon name={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
          {activeTab === "builder" ? (
            <>
              {/* Sidebar Esquerda */}
              <div style={{
                width: "320px",
                borderRight: `1px solid ${TOKENS.colors.gray200}`,
                background: TOKENS.colors.gray50,
                padding: "24px",
                overflowY: "auto",
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: TOKENS.colors.gray700, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Tipo do Protocolo
                    </label>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value.toUpperCase())}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: TOKENS.radii.md,
                        border: `1px solid ${TOKENS.colors.gray200}`,
                        background: "#fff",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    >
                      <option value="IATF">IATF (Inseminação Artificial em Tempo Fixo)</option>
                      <option value="PRÉ-SINCRONIZAÇÃO">Pré-sincronização</option>
                      <option value="CUSTOM">Personalizado</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: TOKENS.colors.gray700, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Nome do Protocolo *
                    </label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: IATF 9 dias"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: TOKENS.radii.md,
                        border: `1px solid ${TOKENS.colors.gray200}`,
                        background: "#fff",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: TOKENS.colors.gray700, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Descrição
                    </label>
                    <textarea
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Observações internas..."
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: TOKENS.radii.md,
                        border: `1px solid ${TOKENS.colors.gray200}`,
                        background: "#fff",
                        fontSize: "14px",
                        outline: "none",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  <div style={{
                    padding: "16px",
                    background: "#fff",
                    borderRadius: TOKENS.radii.lg,
                    border: `1px solid ${TOKENS.colors.gray200}`,
                  }}>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: TOKENS.colors.gray700, marginBottom: "12px", textTransform: "uppercase" }}>
                      Templates Rápidos
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <button
                        onClick={() => aplicarTemplate("IATF")}
                        style={{
                          padding: "10px 12px",
                          background: TOKENS.colors.primaryLight,
                          border: "none",
                          borderRadius: TOKENS.radii.md,
                          color: TOKENS.colors.primaryDark,
                          fontWeight: "600",
                          fontSize: "13px",
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontSize: "16px" }}>⚡</span>
                        IATF Padrão (9 dias)
                      </button>
                      <button
                        onClick={() => aplicarTemplate("PRÉ-SINCRONIZAÇÃO")}
                        style={{
                          padding: "10px 12px",
                          background: "#EDE9FE",
                          border: "none",
                          borderRadius: TOKENS.radii.md,
                          color: TOKENS.colors.secondary,
                          fontWeight: "600",
                          fontSize: "13px",
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontSize: "16px" }}>⚡</span>
                        Pré-sincronização (7 dias)
                      </button>
                    </div>
                  </div>

                  <div style={{
                    padding: "16px",
                    background: "#fff",
                    borderRadius: TOKENS.radii.lg,
                    border: `1px solid ${TOKENS.colors.gray200}`,
                  }}>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: TOKENS.colors.gray700, marginBottom: "12px", textTransform: "uppercase" }}>
                      Resumo
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div style={{ textAlign: "center", padding: "12px", background: TOKENS.colors.gray50, borderRadius: TOKENS.radii.md }}>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: TOKENS.colors.primary }}>{dias.length}</div>
                        <div style={{ fontSize: "12px", color: TOKENS.colors.gray500 }}>Dias</div>
                      </div>
                      <div style={{ textAlign: "center", padding: "12px", background: TOKENS.colors.gray50, borderRadius: TOKENS.radii.md }}>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: TOKENS.colors.secondary }}>{totalEtapas}</div>
                        <div style={{ fontSize: "12px", color: TOKENS.colors.gray500 }}>Etapas</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Direita */}
              <div style={{
                flex: 1,
                padding: "24px",
                overflowY: "auto",
                background: "#fff",
              }}>
                <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: TOKENS.colors.gray800 }}>
                      Linha do Tempo do Protocolo
                    </h3>
                    <Button variant="secondary" size="sm" onClick={adicionarDia} icon="plus">
                      Adicionar Dia
                    </Button>
                  </div>

                  <div>
                    {dias.sort((a, b) => a - b).map((d, idx) => (
                      <TimelineItem
                        key={d}
                        dia={d}
                        etapas={etapas[d] || []}
                        isLast={idx === dias.length - 1}
                        formOpen={formDia === d}
                        formData={form}
                        setFormData={setForm}
                        onAdd={abrirEtapa}
                        onRemoveDia={removerDia}
                        onRemoveEtapa={removerEtapa}
                        onSaveForm={salvarEtapaForm}
                        onCancelForm={() => setFormDia(null)}
                      />
                    ))}
                  </div>

                  {dias.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px", color: TOKENS.colors.gray400 }}>
                      <Icon name="calendar" size={48} color={TOKENS.colors.gray300} />
                      <p>Nenhum dia adicionado ainda.</p>
                      <Button variant="primary" size="sm" onClick={adicionarDia}>
                        Adicionar Primeiro Dia
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Preview Tab */
            <div style={{ flex: 1, padding: "40px", overflowY: "auto", background: TOKENS.colors.gray50 }}>
              <div style={{ maxWidth: "700px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                  <h2 style={{ margin: "0 0 8px", color: TOKENS.colors.gray800 }}>{nome || "Protocolo sem nome"}</h2>
                  <p style={{ margin: 0, color: TOKENS.colors.gray500 }}>{descricao || "Sem descrição"}</p>
                  <div style={{ marginTop: "12px" }}>
                    <Badge variant="primary" size="lg">{tipo}</Badge>
                  </div>
                </div>

                <div style={{ background: "#fff", borderRadius: TOKENS.radii.xl, padding: "32px", boxShadow: TOKENS.shadows.lg }}>
                  {previewData.map(({ dia, etapas: ets }) => (
                    <div key={dia} style={{ 
                      display: "flex", 
                      gap: "20px", 
                      marginBottom: "24px",
                      opacity: ets.length ? 1 : 0.5,
                    }}>
                      <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: TOKENS.radii.full,
                        background: ets.length ? TOKENS.colors.primary : TOKENS.colors.gray200,
                        color: ets.length ? "#fff" : TOKENS.colors.gray500,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "800",
                        fontSize: "14px",
                        flexShrink: 0,
                      }}>
                        D{/*dia*/}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "700", color: TOKENS.colors.gray800, marginBottom: "8px", fontSize: "16px" }}>
                          Dia {dia}
                        </div>
                        {ets.length ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {ets.map((e, i) => (
                              <div key={i} style={{
                                padding: "12px 16px",
                                background: e.hormonio ? TOKENS.colors.primaryLight : "#E0E7FF",
                                borderRadius: TOKENS.radii.md,
                                borderLeft: `4px solid ${e.hormonio ? TOKENS.colors.primary : TOKENS.colors.secondary}`,
                              }}>
                                <span style={{ fontWeight: "600", color: TOKENS.colors.gray800 }}>
                                  {e.hormonio || e.acao}
                                </span>
                                <span style={{ fontSize: "12px", color: TOKENS.colors.gray500, marginLeft: "8px" }}>
                                  {e.hormonio ? "Hormônio" : "Ação"}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ color: TOKENS.colors.gray400, fontStyle: "italic" }}>
                            Nenhuma etapa neste dia
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: `1px solid ${TOKENS.colors.gray200}`,
          padding: "16px 24px",
          background: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{ fontSize: "13px", color: TOKENS.colors.gray500 }}>
            {valido ? (
              <span style={{ color: TOKENS.colors.success, display: "flex", alignItems: "center", gap: "6px" }}>
                <Icon name="check" size={16} /> Pronto para salvar
              </span>
            ) : (
              <span>Preencha o nome e adicione pelo menos uma etapa</span>
            )}
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Button variant="ghost" onClick={onFechar}>Cancelar</Button>
            <Button 
              variant="primary" 
              onClick={handleSalvar} 
              disabled={!valido}
              icon="check"
            >
              {isEdit ? "Salvar Alterações" : "Criar Protocolo"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================= LISTA DE PROTOCOLOS (CARDS) ========================= */
export default function Protocolos() {
  const { fazendaAtualId } = useFazenda();
  
  const [protocolos, setProtocolos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [vinculos, setVinculos] = useState({});

  const parseEtapas = (maybe) => {
    if (!maybe) return [];
    if (Array.isArray(maybe)) return maybe;
    try {
      const arr = JSON.parse(maybe);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };

  const carregar = useCallback(async () => {
    if (!fazendaAtualId) return;
    setCarregando(true);
    try {
      let q = supabase
        .from("repro_protocolos")
        .select("*")
        .eq("fazenda_id", fazendaAtualId)
        .order("created_at", { ascending: false });
      
      if (busca.trim()) {
        q = q.or(`nome.ilike.%${busca.trim()}%,descricao.ilike.%${busca.trim()}%`);
      }
      
      const { data, error } = await q;
      if (error) throw error;
      
      setProtocolos((data || []).map(p => ({
        ...p,
        tipo: String(p?.tipo || "").toUpperCase(),
        etapas: parseEtapas(p?.etapas),
      })));
    } catch (e) {
      console.error(e);
      setErro("Falha ao carregar protocolos");
    } finally {
      setCarregando(false);
    }
  }, [fazendaAtualId, busca]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleSalvar = async (protocolo) => {
    try {
      const payload = {
        fazenda_id: fazendaAtualId,
        nome: protocolo.nome.trim(),
        descricao: protocolo.descricao,
        tipo: protocolo.tipo,
        etapas: protocolo.etapas,
        ativo: true,
        updated_at: new Date().toISOString(),
      };

      if (editando?.id) {
        const { data, error } = await supabase
          .from("repro_protocolos")
          .update(payload)
          .eq("id", editando.id)
          .select()
          .single();
        if (error) throw error;
        setProtocolos(prev => prev.map(p => p.id === editando.id ? { ...data, etapas: parseEtapas(data.etapas) } : p));
      } else {
        const { data, error } = await supabase
          .from("repro_protocolos")
          .insert([{ ...payload, created_at: new Date().toISOString() }])
          .select()
          .single();
        if (error) throw error;
        setProtocolos(prev => [{ ...data, etapas: parseEtapas(data.etapas) }, ...prev]);
      }
      setModalAberto(false);
      setEditando(null);
    } catch (e) {
      alert("Erro ao salvar: " + e.message);
    }
  };

  const handleExcluir = async (prot) => {
    if (!window.confirm(`Excluir "${prot.nome}" permanentemente?`)) return;
    try {
      const { error } = await supabase.from("repro_protocolos").delete().eq("id", prot.id);
      if (error) throw error;
      setProtocolos(prev => prev.filter(p => p.id !== prot.id));
    } catch (e) {
      alert("Erro ao excluir");
    }
  };

  const handleDuplicar = async (prot) => {
    try {
      const { id, created_at, updated_at, ...rest } = prot;
      const novo = {
        ...rest,
        nome: `${rest.nome} (Cópia)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from("repro_protocolos").insert([novo]).select().single();
      if (error) throw error;
      setProtocolos(prev => [{ ...data, etapas: parseEtapas(data.etapas) }, ...prev]);
    } catch (e) {
      alert("Erro ao duplicar");
    }
  };

  const fetchVinculos = async (prot) => {
    setVinculos(m => ({ ...m, [prot.id]: { loading: true, items: [] } }));
    try {
      // Simulação - substituir por sua query real
      await new Promise(r => setTimeout(r, 800));
      setVinculos(m => ({ ...m, [prot.id]: { loading: false, items: [] } }));
    } catch (e) {
      setVinculos(m => ({ ...m, [prot.id]: { loading: false, error: true, items: [] } }));
    }
  };

  const toggleExpand = (prot) => {
    if (expandedId === prot.id) {
      setExpandedId(null);
    } else {
      setExpandedId(prot.id);
      if (!vinculos[prot.id]) fetchVinculos(prot);
    }
  };

  const filtered = protocolos.filter(p => {
    const matchTipo = filtroTipo === "TODOS" || p.tipo === filtroTipo;
    return matchTipo;
  });

  const stats = {
    total: protocolos.length,
    iatf: protocolos.filter(p => p.tipo === "IATF").length,
    pre: protocolos.filter(p => p.tipo === "PRÉ-SINCRONIZAÇÃO").length,
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: TOKENS.colors.gray50,
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${TOKENS.colors.gray200}` }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
            <div>
              <h1 style={{ margin: "0 0 8px", fontSize: "28px", fontWeight: "800", color: TOKENS.colors.gray900 }}>
                Protocolos de Reprodução
              </h1>
              <p style={{ margin: 0, color: TOKENS.colors.gray500, fontSize: "15px" }}>
                Gerencie os protocolos hormonais e acompanhamento de IATF
              </p>
            </div>
            <Button variant="primary" onClick={() => { setEditando(null); setModalAberto(true); }} icon="plus">
              Novo Protocolo
            </Button>
          </div>

          {/* Filtros */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Icon name="search" size={18} color={TOKENS.colors.gray400} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Buscar protocolo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={{
                  padding: "10px 12px 10px 40px",
                  borderRadius: TOKENS.radii.full,
                  border: `1px solid ${TOKENS.colors.gray200}`,
                  background: TOKENS.colors.gray50,
                  fontSize: "14px",
                  width: "280px",
                  outline: "none",
                  transition: TOKENS.transitions.fast,
                }}
                onFocus={(e) => e.target.style.boxShadow = TOKENS.shadows.glow}
                onBlur={(e) => e.target.style.boxShadow = "none"}
              />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { id: "TODOS", label: "Todos", count: stats.total },
                { id: "IATF", label: "IATF", count: stats.iatf },
                { id: "PRÉ-SINCRONIZAÇÃO", label: "Pré-sincronização", count: stats.pre },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFiltroTipo(f.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: TOKENS.radii.full,
                    border: "none",
                    background: filtroTipo === f.id ? TOKENS.colors.primary : "#fff",
                    color: filtroTipo === f.id ? "#fff" : TOKENS.colors.gray600,
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                    boxShadow: filtroTipo === f.id ? TOKENS.shadows.md : TOKENS.shadows.sm,
                    borderWidth: filtroTipo === f.id ? "0" : "1px",
                    borderStyle: "solid",
                    borderColor: TOKENS.colors.gray200,
                  }}
                >
                  {f.label} <span style={{ opacity: 0.8, marginLeft: "4px" }}>({f.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px" }}>
        {carregando ? (
          <div style={{ textAlign: "center", padding: "60px", color: TOKENS.colors.gray400 }}>
            <div style={{ 
              width: "40px", 
              height: "40px", 
              border: `3px solid ${TOKENS.colors.gray200}`,
              borderTop: `3px solid ${TOKENS.colors.primary}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }} />
            Carregando protocolos...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <div style={{
              width: "80px",
              height: "80px",
              background: TOKENS.colors.gray100,
              borderRadius: TOKENS.radii.full,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <Icon name="flask" size={40} color={TOKENS.colors.gray300} />
            </div>
            <h3 style={{ margin: "0 0 8px", color: TOKENS.colors.gray700 }}>Nenhum protocolo encontrado</h3>
            <p style={{ margin: "0 0 20px", color: TOKENS.colors.gray400 }}>Crie seu primeiro protocolo de reprodução</p>
            <Button variant="primary" onClick={() => { setEditando(null); setModalAberto(true); }} icon="plus">
              Criar Protocolo
            </Button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "20px" }}>
            {filtered.map(prot => {
              const maxDia = Math.max(...(prot.etapas || []).map(e => e.dia || 0), 0);
              const etapasCount = (prot.etapas || []).length;
              
              return (
                <div key={prot.id} style={{
                  background: "#fff",
                  borderRadius: TOKENS.radii.xl,
                  boxShadow: TOKENS.shadows.sm,
                  border: `1px solid ${TOKENS.colors.gray200}`,
                  overflow: "hidden",
                  transition: TOKENS.transitions.normal,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = TOKENS.shadows.lg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = TOKENS.shadows.sm;
                }}
                >
                  <div style={{ padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <Badge variant={prot.tipo === "IATF" ? "primary" : "purple"}>
                        {prot.tipo}
                      </Badge>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          onClick={() => handleDuplicar(prot)}
                          style={{
                            padding: "8px",
                            borderRadius: TOKENS.radii.md,
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            color: TOKENS.colors.gray400,
                          }}
                          title="Duplicar"
                        >
                          <Icon name="duplicate" size={18} />
                        </button>
                        <button
                          onClick={() => { setEditando(prot); setModalAberto(true); }}
                          style={{
                            padding: "8px",
                            borderRadius: TOKENS.radii.md,
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            color: TOKENS.colors.gray400,
                          }}
                          title="Editar"
                        >
                          <Icon name="edit" size={18} />
                        </button>
                        <button
                          onClick={() => handleExcluir(prot)}
                          style={{
                            padding: "8px",
                            borderRadius: TOKENS.radii.md,
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            color: TOKENS.colors.gray400,
                          }}
                          title="Excluir"
                          onMouseEnter={(e) => e.currentTarget.style.color = TOKENS.colors.danger}
                          onMouseLeave={(e) => e.currentTarget.style.color = TOKENS.colors.gray400}
                        >
                          <Icon name="trash" size={18} />
                        </button>
                      </div>
                    </div>

                    <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "700", color: TOKENS.colors.gray900 }}>
                      {prot.nome}
                    </h3>
                    <p style={{ margin: "0 0 16px", fontSize: "14px", color: TOKENS.colors.gray500, minHeight: "20px" }}>
                      {prot.descricao || "Sem descrição"}
                    </p>

                    <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: TOKENS.colors.gray600 }}>
                        <Icon name="calendar" size={16} />
                        <span>{maxDia + 1} dias de duração</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: TOKENS.colors.gray600 }}>
                        <Icon name="check" size={16} />
                        <span>{etapasCount} etapas</span>
                      </div>
                    </div>

                    {/* Mini Timeline */}
                    <div style={{ 
                      height: "4px", 
                      background: TOKENS.colors.gray100, 
                      borderRadius: TOKENS.radii.full,
                      display: "flex",
                      overflow: "hidden",
                    }}>
                      {Array.from({ length: Math.min(maxDia + 1, 10) }).map((_, i) => {
                        const hasEtapa = (prot.etapas || []).some(e => e.dia === i);
                        return (
                          <div key={i} style={{
                            flex: 1,
                            background: hasEtapa ? TOKENS.colors.primary : "transparent",
                            borderRight: `1px solid ${TOKENS.colors.gray50}`,
                          }} />
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "11px", color: TOKENS.colors.gray400 }}>
                      <span>D0</span>
                      <span>D{maxDia}</span>
                    </div>
                  </div>

                  <div style={{ 
                    borderTop: `1px solid ${TOKENS.colors.gray200}`, 
                    padding: "16px 24px",
                    background: TOKENS.colors.gray50,
                  }}>
                    <button
                      onClick={() => toggleExpand(prot)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "8px",
                        border: "none",
                        background: "transparent",
                        color: TOKENS.colors.primary,
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                        borderRadius: TOKENS.radii.md,
                        transition: TOKENS.transitions.fast,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#fff"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <Icon name={expandedId === prot.id ? "chevronUp" : "chevronDown"} size={16} />
                      {expandedId === prot.id ? "Ocultar detalhes" : "Ver vacas ativas"}
                    </button>
                  </div>

                  {expandedId === prot.id && (
                    <div style={{ padding: "0 24px 24px", background: TOKENS.colors.gray50 }}>
                      {vinculos[prot.id]?.loading ? (
                        <div style={{ textAlign: "center", padding: "20px", color: TOKENS.colors.gray400 }}>
                          Carregando...
                        </div>
                      ) : (
                        <div style={{ 
                          background: "#fff", 
                          borderRadius: TOKENS.radii.lg,
                          padding: "16px",
                          fontSize: "13px",
                          color: TOKENS.colors.gray600,
                        }}>
                          {/* Aqui entraria a tabela de vacas como no código original */}
                          <div style={{ textAlign: "center", padding: "20px" }}>
                            <Icon name="cow" size={32} color={TOKENS.colors.gray300} style={{ marginBottom: "8px" }} />
                            <p style={{ margin: 0 }}>Nenhuma vaca ativa neste protocolo</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalAberto && (
        <ModalProtocolo
          onFechar={() => { setModalAberto(false); setEditando(null); }}
          onSalvar={handleSalvar}
          protocoloInicial={editando}
        />
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}