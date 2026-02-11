import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { supabase } from "../../lib/supabaseClient";
import { useFazenda } from "../../context/FazendaContext";
import ModalNovoProtocolo from "./ModalNovoProtocolo";

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
    successLight: "#D1FAE5",
    warning: "#F59E0B",
    warningLight: "#FEF3C7",
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
    glow: "0 0 0 3px rgba(37, 99, 235, 0.15)",
  },
  radii: {
    md: "10px",
    lg: "14px",
    xl: "18px",
    full: "9999px",
  },
};

/* ========================= COMPONENTES UTILITÁRIOS ========================= */
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
    flask: <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />,
    check: <path d="M5 13l4 4L19 7" />,
    cow: <path d="M12 2a3 3 0 00-3 3v2H7a3 3 0 00-3 3v8a3 3 0 003 3h10a3 3 0 003-3v-8a3 3 0 00-3-3h-2V5a3 3 0 00-3-3zM9 8h6M9 12h6M9 16h6" />,
    chartBar: <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    trendingUp: <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
    trophy: <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
    dollar: <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    users: <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {icons[name] || null}
    </svg>
  );
};

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: { bg: TOKENS.colors.gray100, color: TOKENS.colors.gray700, border: TOKENS.colors.gray200 },
    primary: { bg: TOKENS.colors.primaryLight, color: TOKENS.colors.primaryDark, border: "#BFDBFE" },
    purple: { bg: "#EDE9FE", color: TOKENS.colors.secondary, border: "#DDD6FE" },
    success: { bg: TOKENS.colors.successLight, color: TOKENS.colors.success, border: "#86EFAC" },
  };
  const v = variants[variant] || variants.default;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        borderRadius: TOKENS.radii.full,
        fontWeight: "700",
        padding: "4px 10px",
        fontSize: "12px",
      }}
    >
      {children}
    </span>
  );
};

const Button = ({ children, onClick, variant = "primary", icon = null, disabled = false, title }) => {
  const styles =
    variant === "primary"
      ? { background: `linear-gradient(135deg, ${TOKENS.colors.primary}, ${TOKENS.colors.primaryDark})`, color: "#fff", border: "none", boxShadow: TOKENS.shadows.md }
      : variant === "secondary"
      ? { background: TOKENS.colors.gray100, color: TOKENS.colors.gray700, border: `1px solid ${TOKENS.colors.gray200}`, boxShadow: TOKENS.shadows.sm }
      : { background: "#fff", color: TOKENS.colors.gray700, border: `1px solid ${TOKENS.colors.gray200}`, boxShadow: TOKENS.shadows.sm };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        height: "40px",
        padding: "0 16px",
        borderRadius: TOKENS.radii.md,
        fontWeight: "700",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        transition: "all .2s ease",
        opacity: disabled ? 0.5 : 1,
        ...styles,
      }}
      onMouseEnter={(e) => {
        if (!disabled && variant === "primary") {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = TOKENS.shadows.lg;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && variant === "primary") {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = TOKENS.shadows.md;
        }
      }}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  );
};

/* ========================= MINI GRÁFICO DE BARRAS ========================= */
const ComparisonBarChart = ({ data, maxValue }) => {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "140px", padding: "12px 0" }}>
      {data.map((item, idx) => {
        const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div style={{ fontSize: "16px", fontWeight: "800", color: item.color }}>{item.value}%</div>
            <div
              style={{
                width: "100%",
                height: `${height}%`,
                minHeight: item.value > 0 ? "8px" : "0",
                background: `linear-gradient(to top, ${item.color}, ${item.color}CC)`,
                borderRadius: "8px 8px 0 0",
                transition: "all 0.3s ease",
              }}
            />
            <div style={{ fontSize: "13px", fontWeight: "600", color: TOKENS.colors.gray700, textAlign: "center", marginTop: "4px" }}>
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ========================= DASHBOARD COMPACTO ========================= */
const DashboardCompacto = ({ protocolos, performanceData }) => {
  const protocolosIATF = protocolos.filter(p => p.tipo === "IATF");
  
  const stats = useMemo(() => {
    if (performanceData.length === 0) {
      return {
        taxaMediaPrenhez: 0,
        custoMedio: 0,
        totalAplicacoes: 0,
        melhorProtocolo: null,
      };
    }

    const totalTaxa = performanceData.reduce((sum, p) => sum + (p.taxaPrenhez || 0), 0);
    const totalCusto = performanceData.reduce((sum, p) => sum + (p.custoMedio || 0), 0);
    const totalAplicacoes = performanceData.reduce((sum, p) => sum + (p.totalAplicacoes || 0), 0);
    
    const melhor = performanceData.reduce((best, p) => 
      (!best || (p.taxaPrenhez || 0) > (best.taxaPrenhez || 0)) ? p : best
    , null);

    return {
      taxaMediaPrenhez: performanceData.length > 0 ? (totalTaxa / performanceData.length) : 0,
      custoMedio: performanceData.length > 0 ? (totalCusto / performanceData.length) : 0,
      totalAplicacoes,
      melhorProtocolo: melhor,
    };
  }, [performanceData]);

  return (
    <div style={{ background: "#fff", borderRadius: TOKENS.radii.xl, padding: "24px", border: `1px solid ${TOKENS.colors.gray200}`, marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <Icon name="chartBar" size={24} color={TOKENS.colors.primary} />
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: TOKENS.colors.gray900 }}>Performance dos Protocolos IATF</h2>
      </div>

      {/* Cards de métricas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ padding: "16px", background: TOKENS.colors.gray50, borderRadius: TOKENS.radii.lg, border: `1px solid ${TOKENS.colors.gray200}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Icon name="trendingUp" size={18} color={TOKENS.colors.success} />
            <span style={{ fontSize: "12px", fontWeight: "600", color: TOKENS.colors.gray600 }}>Taxa Média de Prenhez</span>
          </div>
          <div style={{ fontSize: "32px", fontWeight: "900", color: TOKENS.colors.gray900 }}>
            {stats.taxaMediaPrenhez.toFixed(1)}%
          </div>
        </div>

        <div style={{ padding: "16px", background: TOKENS.colors.gray50, borderRadius: TOKENS.radii.lg, border: `1px solid ${TOKENS.colors.gray200}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Icon name="dollar" size={18} color={TOKENS.colors.warning} />
            <span style={{ fontSize: "12px", fontWeight: "600", color: TOKENS.colors.gray600 }}>Custo Médio</span>
          </div>
          <div style={{ fontSize: "32px", fontWeight: "900", color: TOKENS.colors.gray900 }}>
            R$ {stats.custoMedio.toFixed(0)}
          </div>
        </div>

        <div style={{ padding: "16px", background: TOKENS.colors.gray50, borderRadius: TOKENS.radii.lg, border: `1px solid ${TOKENS.colors.gray200}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Icon name="users" size={18} color={TOKENS.colors.primary} />
            <span style={{ fontSize: "12px", fontWeight: "600", color: TOKENS.colors.gray600 }}>Total de Aplicações</span>
          </div>
          <div style={{ fontSize: "32px", fontWeight: "900", color: TOKENS.colors.gray900 }}>
            {stats.totalAplicacoes}
          </div>
        </div>

        {stats.melhorProtocolo && (
          <div style={{ padding: "16px", background: `linear-gradient(135deg, ${TOKENS.colors.success}15, ${TOKENS.colors.success}05)`, borderRadius: TOKENS.radii.lg, border: `2px solid ${TOKENS.colors.success}30` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Icon name="trophy" size={18} color={TOKENS.colors.success} />
              <span style={{ fontSize: "12px", fontWeight: "600", color: TOKENS.colors.gray600 }}>Melhor Protocolo</span>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "800", color: TOKENS.colors.gray900, marginBottom: "4px" }}>
              {stats.melhorProtocolo.nome}
            </div>
            <div style={{ fontSize: "13px", color: TOKENS.colors.gray600 }}>
              {stats.melhorProtocolo.taxaPrenhez}% de prenhez
            </div>
          </div>
        )}
      </div>

      {/* Gráfico comparativo */}
      {performanceData.length > 0 && (
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: TOKENS.colors.gray700, marginBottom: "12px" }}>
            Comparação de Taxa de Prenhez
          </h3>
          <ComparisonBarChart
            data={performanceData.map((p, idx) => ({
              label: p.nome,
              value: p.taxaPrenhez || 0,
              color: [TOKENS.colors.primary, TOKENS.colors.secondary, TOKENS.colors.success][idx % 3],
            }))}
            maxValue={100}
          />
        </div>
      )}
    </div>
  );
};

/* ========================= COMPONENTE PRINCIPAL ========================= */
export default function Protocolos() {
  const { fazendaAtualId, canEdit } = useFazenda();
  const canEditReproducao = canEdit("reproducao");

  const [protocolos, setProtocolos] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [activeByProtocol, setActiveByProtocol] = useState({});
  const inFlightRef = useRef(false);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  /* ========================= FUNÇÕES UTILITÁRIAS ========================= */
  const normalizeTipo = useCallback((value) => {
    const t = String(value || "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toUpperCase()
      .replace(/[\s_-]/g, "");
    if (t.includes("IATF")) return "IATF";
    if (t.includes("PRE") || t.includes("PRESYNC")) return "PRÉ-SINCRONIZAÇÃO";
    return "OUTRO";
  }, []);

  const tipoLabel = useCallback((value) => {
    const t = normalizeTipo(value);
    if (t === "IATF") return "IATF";
    if (t === "PRÉ-SINCRONIZAÇÃO") return "PRÉ-SINCRONIZAÇÃO";
    return String(value || "—");
  }, [normalizeTipo]);

  const parseEtapas = useCallback((maybe) => {
    if (!maybe) return [];
    if (Array.isArray(maybe)) return maybe;
    try {
      const arr = JSON.parse(maybe);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }, []);

  const getLocalYmd = useCallback(() => new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" }), []);

  const toUtcDay = useCallback((value) => {
    if (!value) return null;
    if (value instanceof Date) {
      return Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
    }
    if (typeof value === "string") {
      const ymd = value.slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
      const [y, m, d] = ymd.split("-").map(Number);
      return Date.UTC(y, m - 1, d);
    }
    return null;
  }, []);

  const diffInDays = useCallback((start, end) => {
    const startUtc = toUtcDay(start);
    const endUtc = toUtcDay(end);
    if (!Number.isFinite(startUtc) || !Number.isFinite(endUtc)) return 0;
    return Math.round((endUtc - startUtc) / 86400000);
  }, [toUtcDay]);

  const isInseminacao = useCallback((texto) => {
    if (!texto) return false;
    return texto
      .toString()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .includes("insemin");
  }, []);

  const resolveEtapaDoDia = useCallback((etapas, dia) => {
    const etapa = (etapas || []).find((e) => {
      const value = e?.dia ?? e?.D ?? e?.d ?? e?.day;
      const numeric = typeof value === "string" ? Number(value) : value;
      return Number.isFinite(numeric) && numeric === dia;
    });

    if (!etapa) {
      return "Sem ação prevista para hoje";
    }

    const descricao = etapa?.nome || etapa?.titulo || etapa?.acao || etapa?.descricao || "Etapa do dia";
    if (isInseminacao(descricao)) {
      return "IA prevista hoje";
    }
    return descricao;
  }, [isInseminacao]);

  /* ========================= CARREGAMENTO DE DADOS ========================= */
  const carregarPerformance = useCallback(async (protocolosList) => {
    if (!fazendaAtualId || protocolosList.length === 0) {
      setPerformanceData([]);
      return;
    }

    try {
      const protocolosIATF = protocolosList.filter(p => normalizeTipo(p.tipo) === "IATF");
      
      const performancePromises = protocolosIATF.map(async (protocolo) => {
        // Buscar todas as aplicações deste protocolo
        const { data: aplicacoes, error: aplicacoesError } = await supabase
          .from("repro_aplicacoes")
          .select("id, status")
          .eq("fazenda_id", fazendaAtualId)
          .eq("protocolo_id", protocolo.id);

        if (aplicacoesError) throw aplicacoesError;

        const totalAplicacoes = (aplicacoes || []).length;
        const aplicacoesIds = (aplicacoes || []).map(a => a.id).filter(Boolean);

        let prenhezConfirmadas = 0;
        if (aplicacoesIds.length > 0) {
          // Buscar diagnósticos de prenhez confirmados
          const { data: diagnosticos, error: diagnosticosError } = await supabase
  .from("repro_eventos")
  .select("id")
  .eq("fazenda_id", fazendaAtualId)
  .eq("tipo", "DG")
  .in("protocolo_aplicacao_id", aplicacoesIds);

          if (diagnosticosError) throw diagnosticosError;
          prenhezConfirmadas = (diagnosticos || []).length;
        }

        const taxaPrenhez = totalAplicacoes > 0 ? Math.round((prenhezConfirmadas / totalAplicacoes) * 100) : 0;
        
        // Calcular custo médio baseado nas etapas (simulado - em produção você teria isso no BD)
        const custoMedio = 150 + (protocolo.etapas?.length || 0) * 15;

        return {
          nome: protocolo.nome,
          taxaPrenhez,
          custoMedio,
          totalAplicacoes,
          prenhezConfirmadas,
        };
      });

      const results = await Promise.all(performancePromises);
      
      if (aliveRef.current) {
        setPerformanceData(results);
      }
    } catch (e) {
      console.error("Erro ao carregar performance:", e);
      if (aliveRef.current) {
        setPerformanceData([]);
      }
    }
  }, [fazendaAtualId, normalizeTipo]);

  const carregarProtocolos = useCallback(async () => {
    if (!fazendaAtualId || inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    setCarregando(true);
    setErro("");

    try {
      const { data, error } = await supabase
        .from("repro_protocolos")
        .select("*")
        .eq("fazenda_id", fazendaAtualId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;

      const nextProtocolos = (data || []).map((p) => ({
        ...p,
        tipo: tipoLabel(p?.tipo),
        etapas: parseEtapas(p?.etapas),
      }));

      if (aliveRef.current) {
        setProtocolos((prev) => {
          const sameSize = prev.length === nextProtocolos.length;
          const sameItems =
            sameSize &&
            prev.every((item, index) => {
              const next = nextProtocolos[index];
              return item?.id === next?.id && JSON.stringify(item) === JSON.stringify(next);
            });
          return sameItems ? prev : nextProtocolos;
        });

        // Carregar dados de performance
        await carregarPerformance(nextProtocolos);
      }
    } catch (e) {
      console.error(e);
      if (aliveRef.current) {
        setErro("Falha ao carregar protocolos");
      }
    } finally {
      if (aliveRef.current) {
        setCarregando(false);
      }
      inFlightRef.current = false;
    }
  }, [fazendaAtualId, tipoLabel, parseEtapas, carregarPerformance]);

  const carregarAtivos = useCallback(async () => {
    if (!fazendaAtualId) {
      setActiveByProtocol({});
      return;
    }

    try {
      const { data: aplicacoes, error: aplicacoesError } = await supabase
        .from("repro_aplicacoes")
        .select("id, protocolo_id, animal_id, data_inicio, hora_inicio")
        .eq("fazenda_id", fazendaAtualId)
        .eq("status", "ATIVO");

      if (aplicacoesError) throw aplicacoesError;

      const aplicacoesList = Array.isArray(aplicacoes) ? aplicacoes : [];
      const animalIds = [...new Set(aplicacoesList.map((item) => item?.animal_id).filter(Boolean))];
      const hojeYmd = getLocalYmd();
      const aplicacaoIds = [...new Set(aplicacoesList.map((item) => item?.id).filter(Boolean))];

      let animaisMap = {};
      if (animalIds.length > 0) {
        const { data: animais, error: animaisError } = await supabase
          .from("animais")
          .select("id, numero, brinco")
          .eq("fazenda_id", fazendaAtualId)
          .in("id", animalIds);

        if (animaisError) throw animaisError;

        animaisMap = (Array.isArray(animais) ? animais : []).reduce((acc, animal) => {
          if (animal?.id) {
            acc[String(animal.id)] = animal;
          }
          return acc;
        }, {});
      }

      let iaRegistradaHoje = new Set();
      if (aplicacaoIds.length > 0) {
        const { data: eventosIa, error: eventosIaError } = await supabase
          .from("repro_eventos")
          .select("protocolo_aplicacao_id")
          .eq("fazenda_id", fazendaAtualId)
          .eq("tipo", "IA")
          .eq("data_evento", hojeYmd)
          .in("protocolo_aplicacao_id", aplicacaoIds);

        if (eventosIaError) throw eventosIaError;

        iaRegistradaHoje = new Set(
          (Array.isArray(eventosIa) ? eventosIa : [])
            .map((item) => item?.protocolo_aplicacao_id)
            .filter(Boolean)
            .map(String),
        );
      }

      const grouped = aplicacoesList.reduce((acc, aplicacao) => {
        const key = String(aplicacao?.protocolo_id || "");
        if (!key) return acc;
        if (!acc[key]) acc[key] = [];
        const animal = animaisMap[String(aplicacao?.animal_id)] || null;
        const iaHoje = iaRegistradaHoje.has(String(aplicacao?.id));
        acc[key].push({ aplicacao, animal, iaRegistradaHoje: iaHoje });
        return acc;
      }, {});

      if (aliveRef.current) {
        setActiveByProtocol(grouped);
      }
    } catch (e) {
      console.error("Erro ao carregar vacas ativas por protocolo:", e);
      if (aliveRef.current) {
        setActiveByProtocol({});
      }
    }
  }, [fazendaAtualId, getLocalYmd]);

  useEffect(() => {
    if (!fazendaAtualId) {
      setProtocolos([]);
      setPerformanceData([]);
      setErro("");
      setCarregando(false);
      setActiveByProtocol({});
      return;
    }
    const carregarDados = async () => {
      await carregarProtocolos();
      await carregarAtivos();
    };
    carregarDados();
  }, [fazendaAtualId, carregarProtocolos, carregarAtivos]);

  /* ========================= HANDLERS ========================= */
  const getAuthUserId = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    const uid = data?.user?.id;
    if (!uid) throw new Error("Sessão inválida (auth.uid vazio)");
    return uid;
  };

  const handleSalvar = async (protocolo) => {
    try {
      if (!fazendaAtualId) throw new Error("Fazenda não selecionada");
      const uid = await getAuthUserId();
      const descricaoLimpa = protocolo.descricao?.trim();
      const descricao = descricaoLimpa ? descricaoLimpa : null;

      const payload = {
        user_id: uid,
        fazenda_id: fazendaAtualId,
        nome: protocolo.nome.trim(),
        tipo: String(protocolo.tipo || "").toUpperCase(),
        descricao,
        etapas: protocolo.etapas,
        ativo: true,
        created_at: editando?.id ? undefined : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (editando?.id) {
        const { data, error } = await supabase
          .from("repro_protocolos")
          .update({
            user_id: payload.user_id,
            fazenda_id: payload.fazenda_id,
            nome: payload.nome,
            tipo: payload.tipo,
            descricao: payload.descricao,
            etapas: payload.etapas,
            ativo: payload.ativo,
            updated_at: payload.updated_at,
          })
          .eq("id", editando.id)
          .select()
          .single();
        
        if (error) throw error;

        setProtocolos((prev) => prev.map((p) => (p.id === editando.id ? { ...data, etapas: parseEtapas(data.etapas) } : p)));
      } else {
        const insertRow = {
          user_id: payload.user_id,
          fazenda_id: payload.fazenda_id,
          nome: payload.nome,
          tipo: payload.tipo,
          descricao: payload.descricao,
          etapas: payload.etapas,
          ativo: payload.ativo,
          created_at: new Date().toISOString(),
          updated_at: payload.updated_at,
        };

        const { data, error } = await supabase.from("repro_protocolos").insert([insertRow]).select().single();
        if (error) throw error;

        setProtocolos((prev) => [{ ...data, etapas: parseEtapas(data.etapas) }, ...prev]);
      }

      await carregarProtocolos(); // Recarregar para atualizar performance
      setModalAberto(false);
      setEditando(null);
      toast.success(editando?.id ? "Protocolo atualizado!" : "Protocolo criado!");
    } catch (e) {
      console.error(e);
      toast.error(`Erro ao salvar: ${e?.message || "desconhecido"}`);
    }
  };

  const handleExcluir = async (prot) => {
    if (!window.confirm(`Tem certeza que deseja excluir o protocolo "${prot.nome}"?`)) {
      return;
    }

    try {
      if (!fazendaAtualId) throw new Error("Fazenda não selecionada");
      
      const { count, error: countError } = await supabase
        .from("repro_aplicacoes")
        .select("id", { count: "exact", head: true })
        .eq("fazenda_id", fazendaAtualId)
        .eq("protocolo_id", prot.id)
        .eq("status", "ATIVO");

      if (countError) throw countError;
      
      if ((count ?? 0) > 0) {
        toast.error("Protocolo em uso. Não é permitido apagar.");
        return;
      }

      const { error } = await supabase.from("repro_protocolos").delete().eq("id", prot.id);
      
      if (error) {
        toast.error("Protocolo em uso. Não é permitido apagar.");
        return;
      }
      
      setProtocolos((prev) => prev.filter((p) => p.id !== prot.id));
      await carregarProtocolos(); // Recarregar para atualizar performance
      toast.success("Protocolo excluído!");
    } catch (e) {
      console.error(e);
      toast.error("Protocolo em uso. Não é permitido apagar.");
    }
  };

  const handleDuplicar = async (prot) => {
    try {
      if (!fazendaAtualId) throw new Error("Fazenda não selecionada");
      const uid = await getAuthUserId();

      const { id: _ID, created_at: _CREATED_AT, updated_at: _UPDATED_AT, ...rest } = prot;
      const novo = {
        ...rest,
        user_id: uid,
        fazenda_id: fazendaAtualId,
        nome: `${rest.nome} (Cópia)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from("repro_protocolos").insert([novo]).select().single();
      if (error) throw error;

      setProtocolos((prev) => [{ ...data, etapas: parseEtapas(data.etapas) }, ...prev]);
      await carregarProtocolos(); // Recarregar para atualizar performance
      toast.success("Protocolo duplicado!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao duplicar");
    }
  };

  const toggleExpand = (prot) => {
    setExpandedId(expandedId === prot.id ? null : prot.id);
  };

  /* ========================= DADOS COMPUTADOS ========================= */
  const filtered = useMemo(() => {
    return protocolos.filter((p) => {
      const termoBusca = busca.trim().toLowerCase();
      const matchBusca =
        !termoBusca ||
        String(p?.nome || "")
          .toLowerCase()
          .includes(termoBusca) ||
        String(p?.descricao || "")
          .toLowerCase()
          .includes(termoBusca);
      const matchTipo = filtroTipo === "TODOS" || normalizeTipo(p.tipo) === filtroTipo;
      return matchBusca && matchTipo;
    });
  }, [protocolos, busca, filtroTipo, normalizeTipo]);

  const stats = useMemo(() => {
    const totalAtivos = Object.values(activeByProtocol).reduce((sum, list) => sum + list.length, 0);
    
    return {
      total: protocolos.length,
      iatf: protocolos.filter((p) => normalizeTipo(p.tipo) === "IATF").length,
      pre: protocolos.filter((p) => normalizeTipo(p.tipo) === "PRÉ-SINCRONIZAÇÃO").length,
      vacasAtivas: totalAtivos,
    };
  }, [protocolos, activeByProtocol, normalizeTipo]);

  /* ========================= RENDER ========================= */
  return (
    <div style={{ minHeight: "100vh", background: TOKENS.colors.gray50, fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${TOKENS.colors.gray200}` }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <h1 style={{ margin: "0 0 6px", fontSize: "26px", fontWeight: "800", color: TOKENS.colors.gray900 }}>
                Protocolos de Reprodução
              </h1>
              <p style={{ margin: 0, color: TOKENS.colors.gray500, fontSize: "14px" }}>
                Gerencie protocolos e acompanhe resultados de IATF
              </p>
            </div>
            <Button
              variant="primary"
              disabled={!canEditReproducao}
              onClick={() => {
                if (!canEditReproducao) return;
                setEditando(null);
                setModalAberto(true);
              }}
              icon="plus"
              title={!canEditReproducao ? "Sem permissão" : undefined}
            >
              Novo Protocolo
            </Button>
          </div>

          {/* Filtros */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>
                <Icon name="search" size={18} color={TOKENS.colors.gray400} />
              </div>
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
                }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = TOKENS.shadows.glow)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { id: "TODOS", label: "Todos", count: stats.total },
                { id: "IATF", label: "IATF", count: stats.iatf },
                { id: "PRÉ-SINCRONIZAÇÃO", label: "Pré-sincronização", count: stats.pre },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFiltroTipo(f.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: TOKENS.radii.full,
                    border: "none",
                    background: filtroTipo === f.id ? TOKENS.colors.primary : "#fff",
                    color: filtroTipo === f.id ? "#fff" : TOKENS.colors.gray600,
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    boxShadow: filtroTipo === f.id ? TOKENS.shadows.md : TOKENS.shadows.sm,
                    borderWidth: filtroTipo === f.id ? "0" : "1px",
                    borderStyle: "solid",
                    borderColor: TOKENS.colors.gray200,
                    transition: "all .2s ease",
                  }}
                >
                  {f.label} <span style={{ opacity: 0.8, marginLeft: "4px" }}>({f.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 32px" }}>
        {erro ? (
          <div
            style={{
              background: "#fff",
              border: `1px solid ${TOKENS.colors.gray200}`,
              borderRadius: TOKENS.radii.xl,
              padding: "16px",
              color: TOKENS.colors.danger,
            }}
          >
            {erro}
          </div>
        ) : carregando ? (
          <div style={{ textAlign: "center", padding: "60px", color: TOKENS.colors.gray400 }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: `3px solid ${TOKENS.colors.gray200}`,
                borderTop: `3px solid ${TOKENS.colors.primary}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            Carregando protocolos...
          </div>
        ) : (
          <>
            {/* Dashboard */}
            {stats.iatf > 0 && <DashboardCompacto protocolos={protocolos} performanceData={performanceData} />}

            {/* Lista de Protocolos */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background: TOKENS.colors.gray100,
                    borderRadius: TOKENS.radii.full,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <Icon name="flask" size={40} color={TOKENS.colors.gray300} />
                </div>
                <h3 style={{ margin: "0 0 8px", color: TOKENS.colors.gray700 }}>Nenhum protocolo encontrado</h3>
                <p style={{ margin: "0 0 20px", color: TOKENS.colors.gray400 }}>Crie seu primeiro protocolo de reprodução</p>
                <Button
                  variant="primary"
                  disabled={!canEditReproducao}
                  onClick={() => {
                    if (!canEditReproducao) return;
                    setEditando(null);
                    setModalAberto(true);
                  }}
                  icon="plus"
                  title={!canEditReproducao ? "Sem permissão" : undefined}
                >
                  Criar Protocolo
                </Button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "20px" }}>
                {filtered.map((prot) => {
                  const maxDia = Math.max(...(prot.etapas || []).map((e) => e.dia || 0), 0);
                  const etapasCount = (prot.etapas || []).length;
                  const activeList = activeByProtocol[String(prot.id)] || [];
                  const hojeYmd = getLocalYmd();
                  const isIATF = normalizeTipo(prot.tipo) === "IATF";

                  return (
                    <div
                      key={prot.id}
                      style={{
                        background: "#fff",
                        borderRadius: TOKENS.radii.xl,
                        boxShadow: TOKENS.shadows.sm,
                        border: `1px solid ${TOKENS.colors.gray200}`,
                        overflow: "hidden",
                        transition: "all .2s ease",
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
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <Badge variant={isIATF ? "primary" : "purple"}>{prot.tipo}</Badge>
                            {activeList.length > 0 && (
                              <Badge variant="success">
                                <Icon name="users" size={12} />
                                {activeList.length}
                              </Badge>
                            )}
                          </div>

                          <div style={{ display: "flex", gap: "4px" }}>
                            <button
                              onClick={() => canEditReproducao && handleDuplicar(prot)}
                              disabled={!canEditReproducao}
                              style={{
                                padding: "8px",
                                borderRadius: TOKENS.radii.md,
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                color: TOKENS.colors.gray400,
                                transition: "color .2s ease",
                              }}
                              title={!canEditReproducao ? "Sem permissão" : "Duplicar"}
                              onMouseEnter={(e) => (e.currentTarget.style.color = TOKENS.colors.primary)}
                              onMouseLeave={(e) => (e.currentTarget.style.color = TOKENS.colors.gray400)}
                            >
                              <Icon name="duplicate" size={18} />
                            </button>

                            <button
                              onClick={() => {
                                if (!canEditReproducao) return;
                                setEditando(prot);
                                setModalAberto(true);
                              }}
                              disabled={!canEditReproducao}
                              style={{
                                padding: "8px",
                                borderRadius: TOKENS.radii.md,
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                color: TOKENS.colors.gray400,
                                transition: "color .2s ease",
                              }}
                              title={!canEditReproducao ? "Sem permissão" : "Editar"}
                              onMouseEnter={(e) => (e.currentTarget.style.color = TOKENS.colors.primary)}
                              onMouseLeave={(e) => (e.currentTarget.style.color = TOKENS.colors.gray400)}
                            >
                              <Icon name="edit" size={18} />
                            </button>

                            <button
                              onClick={() => canEditReproducao && handleExcluir(prot)}
                              disabled={!canEditReproducao}
                              style={{
                                padding: "8px",
                                borderRadius: TOKENS.radii.md,
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                color: TOKENS.colors.gray400,
                                transition: "color .2s ease",
                              }}
                              title={!canEditReproducao ? "Sem permissão" : "Excluir"}
                              onMouseEnter={(e) => (e.currentTarget.style.color = TOKENS.colors.danger)}
                              onMouseLeave={(e) => (e.currentTarget.style.color = TOKENS.colors.gray400)}
                            >
                              <Icon name="trash" size={18} />
                            </button>
                          </div>
                        </div>

                        <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "800", color: TOKENS.colors.gray900 }}>
                          {prot.nome}
                        </h3>

                        <p style={{ margin: "0 0 16px", fontSize: "14px", color: TOKENS.colors.gray500, minHeight: "20px" }}>
                          {prot.descricao || "Sem descrição"}
                        </p>

                        <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: TOKENS.colors.gray600 }}>
                            <Icon name="calendar" size={16} />
                            <span>{maxDia} dias</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: TOKENS.colors.gray600 }}>
                            <Icon name="check" size={16} />
                            <span>{etapasCount} etapas</span>
                          </div>
                        </div>

                        {/* Mini timeline */}
                        <div
                          style={{
                            height: "4px",
                            background: TOKENS.colors.gray100,
                            borderRadius: TOKENS.radii.full,
                            display: "flex",
                            overflow: "hidden",
                          }}
                        >
                          {Array.from({ length: Math.min(maxDia + 1, 10) }).map((_, i) => {
                            const hasEtapa = (prot.etapas || []).some((e) => e.dia === i);
                            return (
                              <div
                                key={i}
                                style={{
                                  flex: 1,
                                  background: hasEtapa ? TOKENS.colors.primary : "transparent",
                                  borderRight: `1px solid ${TOKENS.colors.gray50}`,
                                }}
                              />
                            );
                          })}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "4px",
                            fontSize: "11px",
                            color: TOKENS.colors.gray400,
                          }}
                        >
                          <span>D0</span>
                          <span>D{maxDia}</span>
                        </div>

                        {/* Performance para IATF */}
                        {isIATF && (() => {
                          const perfData = performanceData.find(p => p.nome === prot.nome);
                          if (!perfData) return null;

                          return (
                            <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: `1px solid ${TOKENS.colors.gray200}` }}>
                              <div style={{ fontSize: "12px", fontWeight: "700", color: TOKENS.colors.gray600, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Performance
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                                <div style={{ textAlign: "center", padding: "12px", background: TOKENS.colors.successLight, borderRadius: TOKENS.radii.md, border: `1px solid ${TOKENS.colors.success}30` }}>
                                  <div style={{ fontSize: "24px", fontWeight: "800", color: TOKENS.colors.success }}>
                                    {perfData.taxaPrenhez}%
                                  </div>
                                  <div style={{ fontSize: "11px", color: TOKENS.colors.gray600, marginTop: "4px" }}>Taxa Prenhez</div>
                                </div>
                                <div style={{ textAlign: "center", padding: "12px", background: TOKENS.colors.warningLight, borderRadius: TOKENS.radii.md, border: `1px solid ${TOKENS.colors.warning}30` }}>
                                  <div style={{ fontSize: "24px", fontWeight: "800", color: TOKENS.colors.warning }}>
                                    R$ {perfData.custoMedio}
                                  </div>
                                  <div style={{ fontSize: "11px", color: TOKENS.colors.gray600, marginTop: "4px" }}>Custo Médio</div>
                                </div>
                                <div style={{ textAlign: "center", padding: "12px", background: TOKENS.colors.primaryLight, borderRadius: TOKENS.radii.md, border: `1px solid ${TOKENS.colors.primary}30` }}>
                                  <div style={{ fontSize: "24px", fontWeight: "800", color: TOKENS.colors.primary }}>
                                    {perfData.totalAplicacoes}
                                  </div>
                                  <div style={{ fontSize: "11px", color: TOKENS.colors.gray600, marginTop: "4px" }}>Aplicações</div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Ações */}
                      <div style={{ borderTop: `1px solid ${TOKENS.colors.gray200}`, padding: "12px 24px", background: TOKENS.colors.gray50 }}>
                        <button
                          onClick={() => toggleExpand(prot)}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            padding: "8px",
                            border: "none",
                            background: "transparent",
                            color: TOKENS.colors.primary,
                            fontWeight: "700",
                            fontSize: "13px",
                            cursor: "pointer",
                            borderRadius: TOKENS.radii.md,
                            transition: "background .2s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#fff")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <Icon name={expandedId === prot.id ? "chevronUp" : "chevronDown"} size={16} />
                          {expandedId === prot.id ? "Ocultar Vacas Ativas" : `Ver Vacas Ativas (${activeList.length})`}
                        </button>
                      </div>

                      {/* Vacas Ativas */}
                      {expandedId === prot.id && (
                        <div style={{ padding: "0 24px 24px", background: TOKENS.colors.gray50 }}>
                          <div
                            style={{
                              background: "#fff",
                              borderRadius: TOKENS.radii.lg,
                              padding: "16px",
                              fontSize: "13px",
                              color: TOKENS.colors.gray600,
                            }}
                          >
                            {activeList.length === 0 ? (
                              <div style={{ textAlign: "center", padding: "20px" }}>
                                <Icon name="cow" size={32} color={TOKENS.colors.gray300} />
                                <p style={{ margin: "10px 0 0" }}>Nenhuma vaca ativa neste protocolo</p>
                              </div>
                            ) : (
                              <div style={{ display: "grid", gap: "8px" }}>
                                {activeList.map(({ aplicacao, animal, iaRegistradaHoje }) => {
                                  const numero = animal?.numero || "Sem número";
                                  const brinco = animal?.brinco ? ` ${animal.brinco}` : "";
                                  const dia = Math.max(diffInDays(aplicacao?.data_inicio, hojeYmd), 0);
                                  const acaoDoDia = resolveEtapaDoDia(prot.etapas, dia);
                                  const iaConcluidaHoje = acaoDoDia === "IA prevista hoje" && iaRegistradaHoje;
                                  const acaoDoDiaTexto = iaConcluidaHoje ? "✅ IA registrada hoje (concluído)" : acaoDoDia;

                                  return (
                                    <div
                                      key={aplicacao?.id}
                                      style={{
                                        border: `1px solid ${TOKENS.colors.gray200}`,
                                        borderRadius: TOKENS.radii.md,
                                        padding: "10px 12px",
                                        fontWeight: 600,
                                        color: TOKENS.colors.gray700,
                                      }}
                                    >
                                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <span>
                                          {numero}
                                          {brinco} — Dia {dia} do protocolo
                                        </span>
                                        <span
                                          style={{
                                            color: iaConcluidaHoje ? TOKENS.colors.gray400 : TOKENS.colors.gray500,
                                            fontWeight: 500,
                                          }}
                                        >
                                          {acaoDoDiaTexto}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {modalAberto && (
        <ModalNovoProtocolo
          onFechar={() => {
            setModalAberto(false);
            setEditando(null);
          }}
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
