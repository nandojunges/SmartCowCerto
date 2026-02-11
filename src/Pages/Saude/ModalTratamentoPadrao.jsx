// src/pages/Saude/ModalTratamentoPadrao.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import { supabase } from "../../lib/supabaseClient";
import { useFazenda } from "../../context/FazendaContext";
import "../../styles/botoes.css";

/* ===================== DESIGN TOKENS ===================== */
const COLORS = {
  primary: "#0f172a",
  primaryLight: "#1e293b",
  accent: "#3b82f6",
  accentHover: "#2563eb",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  text: {
    primary: "#0f172a",
    secondary: "#475569",
    muted: "#64748b",
    light: "#94a3b8",
  },
  border: "#e2e8f0",
  borderLight: "#f1f5f9",
  bg: {
    primary: "#ffffff",
    secondary: "#f8fafc",
    tertiary: "#f1f5f9",
  }
};

const SHADOWS = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
};

/* ===================== MODAL BASE ===================== */
const overlayStyles = {
  position: "fixed",
  inset: 0,
  zIndex: 20000,
  background: "rgba(0, 0, 0, 0.70)",
  backdropFilter: "blur(2px)",
  animation: "fadeIn 0.2s ease-out",
};

const wrapperStyles = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "22px",
  boxSizing: "border-box",
};

const cardStyles = {
  width: "min(1200px, 96vw)",
  height: "min(88vh, 980px)",
  background: COLORS.bg.primary,
  borderRadius: "18px",
  overflow: "hidden",
  boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
  display: "flex",
  flexDirection: "column",
};

const headerStyles = {
  padding: "20px 24px",
  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
  color: "#fff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  borderBottom: `1px solid ${COLORS.border}`,
};

const bodyStyles = {
  padding: "24px",
  overflowY: "auto",
  flex: 1,
  background: COLORS.bg.secondary,
};

/* ===================== REACT-SELECT PROFISSIONAL ===================== */
const selectStyles = {
  container: (base) => ({ ...base, width: "100%" }),
  control: (base, state) => ({
    ...base,
    minHeight: 46,
    height: 46,
    borderRadius: 12,
    borderColor: state.isFocused ? COLORS.accent : COLORS.border,
    boxShadow: state.isFocused ? `0 0 0 3px rgba(59, 130, 246, 0.15)` : SHADOWS.sm,
    fontSize: 14,
    backgroundColor: COLORS.bg.primary,
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: state.isFocused ? COLORS.accent : COLORS.text.muted,
    },
  }),
  valueContainer: (base) => ({ ...base, padding: "0 14px" }),
  indicatorsContainer: (base) => ({ ...base, height: 46, paddingRight: 8 }),
  indicatorSeparator: (base) => ({ ...base, backgroundColor: COLORS.border }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? COLORS.accent : COLORS.text.muted,
    transition: "transform 0.2s ease",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "none",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 12,
    border: `1px solid ${COLORS.border}`,
    boxShadow: SHADOWS.lg,
    marginTop: 4,
    overflow: "hidden",
  }),
  menuList: (base) => ({
    ...base,
    padding: 4,
    maxHeight: 300,
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    backgroundColor: state.isSelected
      ? COLORS.accent
      : state.isFocused
        ? `${COLORS.accent}15`
        : "transparent",
    color: state.isSelected ? "#fff" : COLORS.text.primary,
    cursor: "pointer",
    transition: "all 0.15s ease",
    margin: "2px 0",
  }),
  placeholder: (base) => ({ ...base, color: COLORS.text.light }),
  noOptionsMessage: (base) => ({ ...base, color: COLORS.text.muted, fontSize: 14 }),
  loadingMessage: (base) => ({ ...base, color: COLORS.text.muted, fontSize: 14 }),
  menuPortal: (base) => ({ ...base, zIndex: 99999 }),
};

/* ===================== CONSTANTES ===================== */
const VIAS = [
  { value: "IMM", label: "Intramamária (IMM)", icon: "🥛" },
  { value: "IM", label: "Intramuscular (IM)", icon: "💉" },
  { value: "SC", label: "Subcutânea (SC)", icon: "💉" },
  { value: "IV", label: "Intravenosa (IV)", icon: "💉" },
  { value: "VO", label: "Oral (VO)", icon: "💊" },
  { value: "TOP", label: "Tópica (TOP)", icon: "🧴" },
];

const UNIDADES = [
  { value: "mL", label: "mL (Mililitros)" },
  { value: "mg", label: "mg (Miligramas)" },
  { value: "g", label: "g (Gramas)" },
  { value: "UI", label: "UI (Unidades Internacionais)" },
  { value: "bisnaga", label: "Bisnaga(s)" },
  { value: "comprimido", label: "Comprimido(s)" },
  { value: "dose", label: "Dose(s)" },
];

function toInt(v, fallback = 0) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

function isUuid(v) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v || "").trim());
}

function isFarmaciaCategoria(cat) {
  const s = String(cat || "").toLowerCase();
  return (
    s.includes("farm") ||
    s.includes("medic") ||
    s.includes("saúde") ||
    s.includes("saude") ||
    s.includes("veter") ||
    s.includes("antib")
  );
}

/* ===================== MODELO: DIA -> APLICAÇÕES ===================== */
function aplicacaoVazia() {
  return {
    produtoSel: null,
    viaSel: VIAS[0],
    quantidade: "",
    unidadeSel: UNIDADES[0],
  };
}

function diaVazio(dia = 1) {
  return {
    dia,
    aplicacoes: [aplicacaoVazia()],
  };
}

/* ===================== COMPONENTES UI ===================== */
function Label({ children, required = false, tooltip }) {
  return (
    <div style={{
      fontSize: 13,
      color: COLORS.text.secondary,
      marginBottom: 8,
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: 4,
    }}>
      {children}
      {required && <span style={{ color: COLORS.danger }}>*</span>}
      {tooltip && (
        <span style={{
          color: COLORS.text.light,
          fontSize: 11,
          fontWeight: 400,
          marginLeft: 4,
        }}>
          ({tooltip})
        </span>
      )}
    </div>
  );
}

function InputBase({ icon, ...props }) {
  return (
    <div style={{ position: "relative" }}>
      {icon && (
        <span style={{
          position: "absolute",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          color: COLORS.text.light,
          fontSize: 16,
          pointerEvents: "none",
        }}>
          {icon}
        </span>
      )}
      <input
        {...props}
        style={{
          width: "100%",
          height: 46,
          borderRadius: 12,
          border: `1px solid ${COLORS.border}`,
          padding: icon ? "0 14px 0 42px" : "0 14px",
          background: COLORS.bg.primary,
          fontSize: 14,
          color: COLORS.text.primary,
          outline: "none",
          boxSizing: "border-box",
          transition: "all 0.2s ease",
          boxShadow: SHADOWS.sm,
          ...props.style,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = COLORS.accent;
          e.target.style.boxShadow = `0 0 0 3px rgba(59, 130, 246, 0.15)`;
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.target.style.borderColor = COLORS.border;
          e.target.style.boxShadow = SHADOWS.sm;
          props.onBlur?.(e);
        }}
      />
    </div>
  );
}

function Badge({ children, variant = "default", icon }) {
  const variants = {
    default: { bg: COLORS.bg.tertiary, color: COLORS.text.secondary, border: COLORS.border },
    primary: { bg: `${COLORS.accent}15`, color: COLORS.accent, border: `${COLORS.accent}30` },
    success: { bg: `${COLORS.success}15`, color: COLORS.success, border: `${COLORS.success}30` },
    warning: { bg: `${COLORS.warning}15`, color: COLORS.warning, border: `${COLORS.warning}30` },
    danger: { bg: `${COLORS.danger}15`, color: COLORS.danger, border: `${COLORS.danger}30` },
  };

  const style = variants[variant] || variants.default;

  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
      borderRadius: 9999,
      padding: "6px 12px",
      fontSize: 12,
      fontWeight: 600,
    }}>
      {icon && <span>{icon}</span>}
      {children}
    </div>
  );
}

function SectionCard({ title, subtitle, children, icon }) {
  return (
    <div style={{
      background: COLORS.bg.primary,
      borderRadius: 16,
      border: `1px solid ${COLORS.border}`,
      boxShadow: SHADOWS.sm,
      overflow: "hidden",
      marginBottom: 20,
    }}>
      {(title || subtitle) && (
        <div style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${COLORS.borderLight}`,
          background: COLORS.bg.secondary,
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: subtitle ? 4 : 0,
          }}>
            {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
            <h3 style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 700,
              color: COLORS.text.primary,
              letterSpacing: "-0.01em",
            }}>
              {title}
            </h3>
          </div>
          {subtitle && (
            <p style={{
              margin: 0,
              fontSize: 13,
              color: COLORS.text.muted,
              lineHeight: 1.5,
            }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div style={{ padding: 20 }}>
        {children}
      </div>
    </div>
  );
}

function Alert({ type = "error", children }) {
  const styles = {
    error: { bg: "#fef2f2", border: "#fecaca", color: "#991b1b", icon: "⚠️" },
    warning: { bg: "#fffbeb", border: "#fcd34d", color: "#92400e", icon: "⚡" },
    info: { bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af", icon: "ℹ️" },
    success: { bg: "#f0fdf4", border: "#bbf7d0", color: "#166534", icon: "✅" },
  };

  const style = styles[type];

  return (
    <div style={{
      background: style.bg,
      border: `1px solid ${style.border}`,
      color: style.color,
      borderRadius: 12,
      padding: "12px 16px",
      marginBottom: 20,
      fontSize: 13,
      fontWeight: 500,
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}>
      <span>{style.icon}</span>
      <div>{children}</div>
    </div>
  );
}

/* ===================== COMPONENTE PRINCIPAL ===================== */
export default function ModalTratamentoPadrao({ open, onClose, onSaved, sugestoesDoencas, initialDoenca, initialNome }) {
  const { fazendaAtualId } = useFazenda();
  const [salvando, setSalvando] = useState(false);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [doencaSel, setDoencaSel] = useState(null);
  const [dias, setDias] = useState([diaVazio(1)]);
  const [produtosEstoque, setProdutosEstoque] = useState([]);

  const doencaOptions = useMemo(() => {
    const base = (sugestoesDoencas || []).filter((x) => x?.value && x.value !== "todas");
    return base.length ? base : [{ value: "Mastite", label: "Mastite" }];
  }, [sugestoesDoencas]);

  const maiorDia = useMemo(() => {
    const vals = (dias || []).map((d) => toInt(d.dia, 0));
    return vals.length ? Math.max(...vals) : 0;
  }, [dias]);

  const duracaoCalculada = useMemo(() => maiorDia + 1, [maiorDia]);

  const resumoCarencia = useMemo(() => {
    let maxLeite = 0;
    let maxCarne = 0;
    for (const d of dias) {
      for (const ap of (d?.aplicacoes || [])) {
        const meta = ap?.produtoSel?.meta;
        if (!meta) continue;
        maxLeite = Math.max(maxLeite, toInt(meta.carencia_leite_dias, 0));
        maxCarne = Math.max(maxCarne, toInt(meta.carencia_carne_dias, 0));
      }
    }
    return { maxLeite, maxCarne };
  }, [dias]);

  const carregarProdutos = useCallback(async () => {
    setCarregandoProdutos(true);
    setErro("");

    try {
      if (!fazendaAtualId) {
        setProdutosEstoque([]);
        setErro("Selecione uma fazenda para carregar os produtos.");
        return;
      }

      const { data, error } = await supabase
        .from("estoque_produtos")
        .select("*")
        .eq("fazenda_id", fazendaAtualId)
        .order("nome_comercial", { ascending: true });

      if (error) {
        setProdutosEstoque([]);
        setErro(`Erro ao carregar estoque_produtos: ${error.message}`);
        return;
      }

      const filtrados = (data || []).filter((p) => {
        const catOk = isFarmaciaCategoria(p.categoria);
        const tipoOk = String(p.tipo_farmacia || "").trim().length > 0;
        return catOk || tipoOk;
      });

      const options = filtrados
        .map((p) => {
          const nomeProd = String(p.nome_comercial || "").trim();
          if (!nomeProd) return null;
          const unidade = p.unidade_medida ?? p.unidade ?? p.unidade_compra ?? p.unidade_uso ?? "";

          return {
            value: p.id,
            label: nomeProd,
            meta: {
              id: p.id,
              nome: nomeProd,
              categoria: p.categoria,
              unidade_padrao: unidade || null,
              carencia_leite_dias: p.sem_carencia_leite ? 0 : p.carencia_leite_dias,
              carencia_carne_dias: p.sem_carencia_carne ? 0 : p.carencia_carne_dias,
            },
          };
        })
        .filter(Boolean);

      setProdutosEstoque(options);
    } catch {
      setProdutosEstoque([]);
      setErro("Falha ao carregar produtos do estoque. Verifique conexão/RLS.");
    } finally {
      setCarregandoProdutos(false);
    }
  }, [fazendaAtualId]);

  useEffect(() => {
    if (!open) return;
    const initialOption =
      doencaOptions.find((opt) => opt.value === initialDoenca || opt.label === initialDoenca)
      ?? (initialDoenca ? { value: initialDoenca, label: initialDoenca } : null);

    setErro("");
    setNome(initialNome ?? "");
    setDoencaSel(initialOption);
    setDias([diaVazio(1)]);
    carregarProdutos();
  }, [open, carregarProdutos, doencaOptions, initialDoenca, initialNome]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  /* ===================== AÇÕES (DIA/APLICAÇÃO) ===================== */
  const updateDia = (dIdx, patch) => {
    setDias((old) => old.map((d, i) => (i === dIdx ? { ...d, ...patch } : d)));
  };

  const addProximoDia = () => {
    setDias((old) => {
      const maxD = old.length ? Math.max(...old.map((x) => toInt(x.dia, 1))) : 1;
      return [...old, diaVazio(maxD + 1)];
    });
  };

  const rmDia = (dIdx) => {
    setDias((old) => old.filter((_, i) => i !== dIdx));
  };

  const addAplicacaoNoDia = (dIdx) => {
    setDias((old) =>
      old.map((d, i) =>
        i === dIdx
          ? { ...d, aplicacoes: [...(d.aplicacoes || []), aplicacaoVazia()] }
          : d
      )
    );
  };

  const rmAplicacaoNoDia = (dIdx, aIdx) => {
    setDias((old) =>
      old.map((d, i) => {
        if (i !== dIdx) return d;
        const apps = d.aplicacoes || [];
        const next = apps.filter((_, j) => j !== aIdx);
        return { ...d, aplicacoes: next.length ? next : [aplicacaoVazia()] };
      })
    );
  };

  const updateAplicacao = (dIdx, aIdx, patch) => {
    setDias((old) =>
      old.map((d, i) => {
        if (i !== dIdx) return d;
        const apps = d.aplicacoes || [];
        return {
          ...d,
          aplicacoes: apps.map((ap, j) => (j === aIdx ? { ...ap, ...patch } : ap)),
        };
      })
    );
  };

  /* ===================== SALVAR ===================== */
  const salvar = async () => {
    setErro("");

    if (!fazendaAtualId) return setErro("Selecione uma fazenda antes de salvar o protocolo.");

    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return setErro("Informe um nome para o protocolo.");
    if (!doencaSel?.value) return setErro("Selecione a doença/condição.");

    const viasPermitidas = new Set(["IMM", "IM", "SC", "IV", "VO", "TOP"]);
    const itensValidos = [];
    const errosItens = [];
    const ordemPorDia = {};

    dias.forEach((d, dIdx) => {
      const diaNum = toInt(d?.dia, 0);
      const diaLabel = dIdx + 1;

      if (!Number.isInteger(diaNum) || diaNum < 1) {
        errosItens.push(`Dia inválido no bloco ${diaLabel}. Informe um valor inteiro maior ou igual a 1.`);
        return;
      }

      const aplicacoes = d?.aplicacoes || [];
      aplicacoes.forEach((ap, aIdx) => {
        const idxAplicacao = aIdx + 1;
        const itemLabel = `Dia ${diaNum}, aplicação ${idxAplicacao}`;

        const produtoId = String(ap?.produtoSel?.value || ap?.produtoSel?.meta?.id || "").trim();
        if (!isUuid(produtoId)) {
          errosItens.push(`${itemLabel}: produto inválido. Selecione um produto válido do estoque.`);
          return;
        }

        const via = String(ap?.viaSel?.value || "").trim().toUpperCase();
        if (!viasPermitidas.has(via)) {
          errosItens.push(`${itemLabel}: via inválida. Use apenas IMM, IM, SC, IV, VO ou TOP.`);
          return;
        }

        const quantidadeNum = Number.parseFloat(String(ap?.quantidade || "").replace(",", ".").trim());
        if (!Number.isFinite(quantidadeNum) || quantidadeNum <= 0) {
          errosItens.push(`${itemLabel}: quantidade inválida. Informe um número maior que zero.`);
          return;
        }

        const unidade = String(ap?.unidadeSel?.value || "").trim();
        if (!unidade) {
          errosItens.push(`${itemLabel}: unidade obrigatória.`);
          return;
        }

        const produtoNomeSnapshot = String(
          ap?.produtoSel?.meta?.nome || ap?.produtoSel?.label || ""
        ).trim();
        if (!produtoNomeSnapshot) {
          errosItens.push(`${itemLabel}: nome do produto inválido.`);
          return;
        }

        const carenciaLeite = toInt(ap?.produtoSel?.meta?.carencia_leite_dias, 0);
        const carenciaCarne = toInt(ap?.produtoSel?.meta?.carencia_carne_dias, 0);

        ordemPorDia[diaNum] = (ordemPorDia[diaNum] || 0) + 1;
        const ordem = ordemPorDia[diaNum];

        if (!Number.isInteger(ordem) || ordem < 1) {
          errosItens.push(`${itemLabel}: ordem inválida para o dia ${diaNum}.`);
          return;
        }

        itensValidos.push({
          fazenda_id: fazendaAtualId,
          dia: diaNum,
          ordem,
          produto_id: produtoId,
          produto_nome_snapshot: produtoNomeSnapshot,
          via,
          quantidade: quantidadeNum,
          unidade,
          carencia_leite_dias: carenciaLeite,
          carencia_carne_dias: carenciaCarne,
        });
      });
    });

    if (itensValidos.length === 0) {
      return setErro("Adicione ao menos 1 item válido ao tratamento antes de salvar.");
    }

    if (errosItens.length > 0) {
      return setErro(`Existem itens inválidos no tratamento: ${errosItens[0]}`);
    }

    setSalvando(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id ?? null;

      const payload = {
        fazenda_id: fazendaAtualId,
        user_id: userId,
        nome: nomeLimpo,
        doenca: doencaSel.value,
        ultimo_dia: maiorDia,
        duracao_dias: duracaoCalculada,
        carencia_leite_dias_max: resumoCarencia.maxLeite,
        carencia_carne_dias_max: resumoCarencia.maxCarne,
      };

      const { data: protocoloInserido, error: protocoloError } = await supabase
        .from("saude_protocolos")
        .insert([payload])
        .select("id")
        .single();

      if (protocoloError || !protocoloInserido?.id) {
        setErro("Não foi possível salvar. Verifique se a tabela 'saude_protocolos' existe e se o RLS permite insert.");
        return;
      }

      const itensPayload = itensValidos.map((item) => ({
        fazenda_id: item.fazenda_id,
        user_id: userId,
        protocolo_id: protocoloInserido.id,
        dia: item.dia,
        ordem: item.ordem,
        produto_id: item.produto_id,
        produto_nome_snapshot: item.produto_nome_snapshot,
        via: item.via,
        quantidade: item.quantidade,
        unidade: item.unidade,
        carencia_leite_dias: item.carencia_leite_dias,
        carencia_carne_dias: item.carencia_carne_dias,
      }));

      const { error: itensError } = await supabase
        .from("saude_protocolo_itens")
        .insert(itensPayload);

      if (itensError) {
        setErro("Protocolo criado, mas houve erro ao salvar os itens do tratamento.");
        return;
      }

      onSaved?.();
      onClose?.();
    } catch {
      setErro("Falha ao salvar. Verifique conexão e estrutura das tabelas.");
    } finally {
      setSalvando(false);
    }
  };

  /* ===================== UI: CARD DE DIA ===================== */
  const DiaCard = ({ diaObj, dIdx, isLast }) => {
    const diaNum = toInt(diaObj.dia, 1);

    return (
      <div style={{
        background: COLORS.bg.primary,
        borderRadius: 16,
        border: `2px solid ${isLast ? COLORS.accent : COLORS.border}`,
        padding: 18,
        boxShadow: isLast ? `0 4px 12px rgba(59, 130, 246, 0.1)` : SHADOWS.sm,
        transition: "all 0.2s ease",
        position: "relative",
      }}>
        {/* Tag topo */}
        <div style={{
          position: "absolute",
          top: -10,
          left: 20,
          background: isLast ? COLORS.accent : COLORS.text.muted,
          color: "#fff",
          borderRadius: 20,
          padding: "4px 12px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}>
          Dia {diaNum} {isLast && "• Atual"}
        </div>

        {/* APLICAÇÕES */}
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          {(diaObj.aplicacoes || []).map((ap, aIdx) => {
            const hasCarencia =
              ap?.produtoSel?.meta?.carencia_leite_dias > 0 ||
              ap?.produtoSel?.meta?.carencia_carne_dias > 0;

            const isUltimaAplicacao = aIdx === (diaObj.aplicacoes || []).length - 1;

            return (
              <div
                key={`${dIdx}-${aIdx}`}
                style={{
                  background: COLORS.bg.secondary,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                {/* LINHA 1 (compacta): DIA + PRODUTO + VIA */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "110px 1.6fr 1fr",
                  gap: 12,
                  alignItems: "end",
                }}>
                  <div>
                    <Label required tooltip="Dia relativo ao início">Dia</Label>
                    <InputBase
                      type="number"
                      min={1}
                      value={diaObj.dia}
                      onChange={(e) => updateDia(dIdx, { dia: e.target.value })}
                      icon="📅"
                      style={{ height: 46 }}
                    />
                  </div>

                  <div>
                    <Label required>Produto do Estoque</Label>
                    <Select
                      value={ap.produtoSel}
                      onChange={(opt) => updateAplicacao(dIdx, aIdx, { produtoSel: opt })}
                      options={produtosEstoque}
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                      placeholder={carregandoProdutos ? "Carregando..." : "Selecione um produto..."}
                      isLoading={carregandoProdutos}
                      isClearable
                      noOptionsMessage={() => (
                        carregandoProdutos
                          ? "Carregando..."
                          : "Nenhum produto de farmácia encontrado no estoque"
                      )}
                    />
                  </div>

                  <div>
                    <Label required>Via de Administração</Label>
                    <Select
                      value={ap.viaSel}
                      onChange={(opt) => updateAplicacao(dIdx, aIdx, { viaSel: opt })}
                      options={VIAS.map((v) => ({ ...v, label: `${v.icon} ${v.label}` }))}
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                      placeholder="Selecione..."
                    />
                  </div>
                </div>

                {/* Carência */}
                {ap?.produtoSel?.meta && (
                  <div style={{
                    background: hasCarencia ? `${COLORS.warning}10` : `${COLORS.success}10`,
                    border: `1px solid ${hasCarencia ? `${COLORS.warning}30` : `${COLORS.success}30`}`,
                    borderRadius: 10,
                    padding: "10px 14px",
                    marginTop: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}>
                    <span style={{ fontSize: 16 }}>{hasCarencia ? "⏱️" : "✅"}</span>
                    <div style={{ fontSize: 12, color: hasCarencia ? COLORS.warning : COLORS.success, fontWeight: 500 }}>
                      <strong>Carência:</strong> Leite {toInt(ap.produtoSel.meta.carencia_leite_dias, 0)}d •
                      Carne {toInt(ap.produtoSel.meta.carencia_carne_dias, 0)}d
                    </div>
                  </div>
                )}

                {/* LINHA 2 (compacta): QUANTIDADE + UNIDADE + (+ ADICIONAR PRODUTO) + (REMOVER) */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "180px 220px auto auto",
                  gap: 12,
                  alignItems: "end",
                  marginTop: 10,
                }}>
                  <div>
                    <Label required tooltip="Quantidade a ser administrada">Quantidade</Label>
                    <InputBase
                      value={ap.quantidade}
                      onChange={(e) => updateAplicacao(dIdx, aIdx, { quantidade: e.target.value })}
                      placeholder="Ex: 2"
                      icon="⚖️"
                      style={{ height: 46 }}
                    />
                  </div>

                  <div>
                    <Label required>Unidade</Label>
                    <Select
                      value={ap.unidadeSel}
                      onChange={(opt) => updateAplicacao(dIdx, aIdx, { unidadeSel: opt })}
                      options={UNIDADES}
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                      placeholder="Selecione..."
                    />
                  </div>

                  {/* Botão + Adicionar Produto alinhado aqui (como você pediu) */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    {isUltimaAplicacao && (
                      <button
                        onClick={() => addAplicacaoNoDia(dIdx)}
                        style={{
                          height: 46,
                          padding: "0 16px",
                          borderRadius: 12,
                          border: `1px solid ${COLORS.accent}`,
                          background: COLORS.accent,
                          color: "#fff",
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          boxShadow: `0 4px 12px rgba(59, 130, 246, 0.25)`,
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = COLORS.accentHover;
                          e.target.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = COLORS.accent;
                          e.target.style.transform = "none";
                        }}
                        title="Adicionar mais um produto neste mesmo dia"
                      >
                        + Adicionar Produto
                      </button>
                    )}
                  </div>

                  {/* Remover aplicação */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    {(diaObj.aplicacoes || []).length > 1 && (
                      <button
                        onClick={() => rmAplicacaoNoDia(dIdx, aIdx)}
                        style={{
                          height: 46,
                          padding: "0 14px",
                          borderRadius: 12,
                          border: `1px solid ${COLORS.danger}40`,
                          background: `${COLORS.danger}10`,
                          color: COLORS.danger,
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = COLORS.danger;
                          e.target.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = `${COLORS.danger}10`;
                          e.target.style.color = COLORS.danger;
                        }}
                        title="Remover este produto (aplicação)"
                      >
                        🗑️ Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ações do dia (menos poluído): remover dia aqui embaixo */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
        }}>
          <div style={{ fontSize: 12, color: COLORS.text.muted }}>
            Dica: use “Adicionar Produto” para itens no mesmo dia.
          </div>

          {dias.length > 1 && (
            <button
              onClick={() => rmDia(dIdx)}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: `1px solid ${COLORS.danger}40`,
                background: `${COLORS.danger}10`,
                color: COLORS.danger,
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = COLORS.danger;
                e.target.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = `${COLORS.danger}10`;
                e.target.style.color = COLORS.danger;
              }}
              title="Remover este dia inteiro"
            >
              🗓️ Remover Dia
            </button>
          )}
        </div>
      </div>
    );
  };

  const content = (
    <div style={overlayStyles} onMouseDown={onClose}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={wrapperStyles}>
        <div style={cardStyles} onMouseDown={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={headerStyles}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}>
                🏥
              </div>
              <div>
                <div style={{
                  fontWeight: 800,
                  fontSize: 18,
                  letterSpacing: "-0.02em",
                }}>
                  Cadastrar Tratamento Padrão
                </div>
                <div style={{
                  fontSize: 13,
                  opacity: 0.85,
                  marginTop: 2,
                  fontWeight: 400,
                }}>
                  Crie protocolos reutilizáveis para tratamentos veterinários
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255,255,255,0.1)";
              }}
            >
              ✕ Fechar
            </button>
          </div>

          {/* Body */}
          <div style={bodyStyles}>
            {erro && <Alert type="error">{erro}</Alert>}

            {/* Seção: Informações Básicas */}
            <SectionCard
              title="Informações do Protocolo"
              subtitle="Defina um nome identificador e a condição clínica associada a este tratamento"
              icon="📋"
            >
              <div style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr",
                gap: 20,
              }}>
                <div>
                  <Label required tooltip="Nome descritivo do protocolo">Nome do Protocolo</Label>
                  <InputBase
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Mastite Aguda - Protocolo IMM Dias 1-3"
                    icon="📝"
                  />
                </div>

                <div>
                  <Label required tooltip="Doença ou condição tratada">Doença / Condição</Label>
                  <Select
                    value={doencaSel}
                    onChange={setDoencaSel}
                    options={doencaOptions}
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    placeholder="Selecione a condição..."
                  />
                </div>
              </div>

              {/* Badges de resumo */}
              <div style={{
                marginTop: 20,
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}>
                <Badge variant="primary" icon="📅">
                  Último dia: <strong>{maiorDia}</strong>
                </Badge>
                <Badge variant="default" icon="⏱️">
                  Duração total: <strong>{duracaoCalculada} dia(s)</strong>
                </Badge>
                <Badge
                  variant={resumoCarencia.maxLeite > 0 || resumoCarencia.maxCarne > 0 ? "warning" : "success"}
                  icon={resumoCarencia.maxLeite > 0 || resumoCarencia.maxCarne > 0 ? "⚠️" : "✅"}
                >
                  Carência máx: Leite <strong>{resumoCarencia.maxLeite}d</strong> • Carne <strong>{resumoCarencia.maxCarne}d</strong>
                </Badge>
              </div>
            </SectionCard>

            {/* Seção: Itens */}
            <SectionCard
              title="Itens de Aplicação"
              subtitle="Organizado por DIA. Dentro de cada dia, adicione um ou mais produtos."
              icon="💉"
            >
              <div style={{ display: "grid", gap: 16 }}>
                {dias.map((d, dIdx) => (
                  <DiaCard
                    key={dIdx}
                    diaObj={d}
                    dIdx={dIdx}
                    isLast={dIdx === dias.length - 1}
                  />
                ))}
              </div>

              {/* Próximo dia */}
              <div style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 14,
              }}>
                <button
                  onClick={addProximoDia}
                  style={{
                    height: 46,
                    padding: "0 18px",
                    borderRadius: 12,
                    border: `1px solid ${COLORS.accent}`,
                    background: `${COLORS.accent}10`,
                    color: COLORS.accent,
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = `${COLORS.accent}18`;
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = `${COLORS.accent}10`;
                    e.target.style.transform = "none";
                  }}
                  title="Criar um novo dia para o protocolo"
                >
                  + Adicionar Próximo Dia
                </button>
              </div>
            </SectionCard>

            {/* Footer */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 20,
              borderTop: `1px solid ${COLORS.border}`,
            }}>
              <div style={{ fontSize: 13, color: COLORS.text.muted }}>
                <span style={{ color: COLORS.danger }}>*</span> Campos obrigatórios
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={onClose}
                  disabled={salvando}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 12,
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.bg.primary,
                    color: COLORS.text.secondary,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: salvando ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    opacity: salvando ? 0.6 : 1,
                  }}
                >
                  Cancelar
                </button>

                <button
                  onClick={salvar}
                  disabled={salvando}
                  style={{
                    padding: "12px 28px",
                    borderRadius: 12,
                    border: "none",
                    background: salvando ? COLORS.accentHover : COLORS.accent,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: salvando ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: salvando ? "none" : `0 4px 14px rgba(59, 130, 246, 0.35)`,
                  }}
                >
                  {salvando ? (
                    <>
                      <span style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        display: "inline-block",
                      }} />
                      Salvando...
                    </>
                  ) : (
                    <>💾 Salvar Protocolo</>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
