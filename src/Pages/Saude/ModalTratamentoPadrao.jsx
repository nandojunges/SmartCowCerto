// src/pages/Saude/ModalTratamentoPadrao.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Select from "react-select";
import { supabase } from "../../lib/supabaseClient";
import { useFazenda } from "../../context/FazendaContext";
import "../../styles/botoes.css";

/* ===================== DESIGN TOKENS ===================== */
const COLORS = {
  primary: "#0f172a",        // Slate 900 - headers principais
  primaryLight: "#1e293b",   // Slate 800
  accent: "#3b82f6",        // Blue 500 - ações principais
  accentHover: "#2563eb",   // Blue 600
  success: "#10b981",       // Emerald 500
  warning: "#f59e0b",       // Amber 500
  danger: "#ef4444",        // Red 500
  text: {
    primary: "#0f172a",     // Slate 900
    secondary: "#475569",   // Slate 600
    muted: "#64748b",       // Slate 500
    light: "#94a3b8",       // Slate 400
  },
  border: "#e2e8f0",        // Slate 200
  borderLight: "#f1f5f9",   // Slate 100
  bg: {
    primary: "#ffffff",
    secondary: "#f8fafc",   // Slate 50
    tertiary: "#f1f5f9",    // Slate 100
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
  background: "rgba(15, 23, 42, 0.75)", // Mais escuro para foco no modal
  backdropFilter: "blur(4px)",         // Efeito glass moderno
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  padding: "16px",
  animation: "fadeIn 0.2s ease-out",
};

const cardStyles = {
  width: "min(1200px, 95vw)",
  maxHeight: "90vh",
  background: COLORS.bg.primary,
  borderRadius: "20px",
  border: `1px solid ${COLORS.border}`,
  boxShadow: SHADOWS.xl,
  overflow: "hidden",
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
    minHeight: 48,
    height: 48,
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
  indicatorsContainer: (base) => ({ ...base, height: 48, paddingRight: 8 }),
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

function itemVazio() {
  return {
    dia: 0,
    produtoSel: null,
    viaSel: VIAS[0],
    quantidade: "",
    unidadeSel: UNIDADES[0],
  };
}

function toInt(v, fallback = 0) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
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
          height: 48,
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
export default function ModalTratamentoPadrao({ open, onClose, onSaved, sugestoesDoencas }) {
  const { fazendaAtualId } = useFazenda();
  const [salvando, setSalvando] = useState(false);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [doencaSel, setDoencaSel] = useState(null);
  const [itens, setItens] = useState([itemVazio()]);
  const [produtosEstoque, setProdutosEstoque] = useState([]);

  const doencaOptions = useMemo(() => {
    const base = (sugestoesDoencas || []).filter((x) => x?.value && x.value !== "todas");
    return base.length ? base : [{ value: "Mastite", label: "Mastite" }];
  }, [sugestoesDoencas]);

  const maiorDia = useMemo(() => {
    const dias = itens.map((i) => toInt(i.dia, 0));
    return dias.length ? Math.max(...dias) : 0;
  }, [itens]);

  const duracaoCalculada = useMemo(() => maiorDia + 1, [maiorDia]);

  const resumoCarencia = useMemo(() => {
    let maxLeite = 0;
    let maxCarne = 0;
    for (const it of itens) {
      const meta = it?.produtoSel?.meta;
      if (!meta) continue;
      maxLeite = Math.max(maxLeite, toInt(meta.carencia_leite_dias, 0));
      maxCarne = Math.max(maxCarne, toInt(meta.carencia_carne_dias, 0));
    }
    return { maxLeite, maxCarne };
  }, [itens]);

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
        .select(
          "id, nome_comercial, categoria, unidade, tipo_farmacia, carencia_leite_dias, carencia_carne_dias, sem_carencia_leite, sem_carencia_carne"
        )
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

          return {
            value: p.id,
            label: nomeProd,
            meta: {
              id: p.id,
              nome: nomeProd,
              categoria: p.categoria,
              unidade_padrao: p.unidade || null,
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
    setErro("");
    setNome("");
    setDoencaSel(null);
    setItens([itemVazio()]);
    carregarProdutos();
  }, [open, carregarProdutos]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const addItem = () => setItens((old) => [...old, itemVazio()]);
  const rmItem = (idx) => setItens((old) => old.filter((_, i) => i !== idx));
  const updateItem = (idx, patch) => {
    setItens((old) => old.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const salvar = async () => {
    setErro("");
    if (!fazendaAtualId) {
      return setErro("Selecione uma fazenda antes de salvar o protocolo.");
    }
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return setErro("Informe um nome para o protocolo.");
    if (!doencaSel?.value) return setErro("Selecione a doença/condição.");

    const itensValidos = itens
      .map((it) => {
        const dia = toInt(it.dia, 0);
        const produto = it.produtoSel?.meta;
        return {
          dia,
          produto_id: produto?.id || null,
          produto_nome: produto?.nome || null,
          via: it.viaSel?.value || "IMM",
          quantidade: String(it.quantidade || "").trim(),
          unidade: it.unidadeSel?.value || "mL",
          carencia_leite_dias: produto?.carencia_leite_dias ?? null,
          carencia_carne_dias: produto?.carencia_carne_dias ?? null,
        };
      })
      .filter((x) => x.produto_id);

    if (itensValidos.length === 0) {
      return setErro("Adicione ao menos 1 item com produto do estoque (categoria Farmácia/Medicamentos).");
    }

    setSalvando(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id ?? null;

      const payload = {
        nome: nomeLimpo,
        doenca: doencaSel.value,
        itens: itensValidos,
        ultimo_dia: maiorDia,
        duracao_dias: duracaoCalculada,
        carencia_leite_dias_max: resumoCarencia.maxLeite,
        carencia_carne_dias_max: resumoCarencia.maxCarne,
        fazenda_id: fazendaAtualId,
        user_id: userId,
      };

      const { error } = await supabase.from("saude_protocolos").insert([payload]);
      if (error) {
        setErro("Não foi possível salvar. Verifique se a tabela 'saude_protocolos' existe e se o RLS permite insert.");
        return;
      }
      onSaved?.();
    } catch {
      setErro("Falha ao salvar. Verifique conexão e estrutura das tabelas.");
    } finally {
      setSalvando(false);
    }
  };

  const LinhaItem = ({ it, idx, isLast, total }) => {
    const hasCarencia = it.produtoSel?.meta?.carencia_leite_dias > 0 || it.produtoSel?.meta?.carencia_carne_dias > 0;
    
    return (
      <div style={{
        background: COLORS.bg.primary,
        borderRadius: 16,
        border: `2px solid ${isLast ? COLORS.accent : COLORS.border}`,
        padding: 20,
        boxShadow: isLast ? `0 4px 12px rgba(59, 130, 246, 0.1)` : SHADOWS.sm,
        transition: "all 0.2s ease",
        position: "relative",
      }}>
        {/* Indicador de número do item */}
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
          Item {idx + 1} {isLast && "• Atual"}
        </div>

        {/* Grid principal */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "120px 2fr 1.5fr", 
          gap: 16, 
          marginTop: 12,
          marginBottom: 16,
        }}>
          {/* Dia */}
          <div>
            <Label required tooltip="Dia relativo ao início">Dia do Tratamento</Label>
            <InputBase 
              type="number" 
              min={0} 
              value={it.dia} 
              onChange={(e) => updateItem(idx, { dia: e.target.value })}
              icon="📅"
            />
          </div>

          {/* Produto */}
          <div>
            <Label required>Produto do Estoque</Label>
            <Select
              value={it.produtoSel}
              onChange={(opt) => updateItem(idx, { produtoSel: opt })}
              options={produtosEstoque}
              styles={selectStyles}
              menuPortalTarget={document.body}
              placeholder={carregandoProdutos ? "Carregando produtos..." : "Selecione um produto..."}
              isLoading={carregandoProdutos}
              isClearable
              noOptionsMessage={() => (
                carregandoProdutos 
                  ? "Carregando..." 
                  : "Nenhum produto de farmácia encontrado no estoque"
              )}
            />
          </div>

          {/* Via */}
          <div>
            <Label required>Via de Administração</Label>
            <Select
              value={it.viaSel}
              onChange={(opt) => updateItem(idx, { viaSel: opt })}
              options={VIAS.map(v => ({
                ...v,
                label: `${v.icon} ${v.label}`
              }))}
              styles={selectStyles}
              menuPortalTarget={document.body}
              placeholder="Selecione..."
            />
          </div>
        </div>

        {/* Alerta de carência */}
        {it.produtoSel?.meta && (
          <div style={{
            background: hasCarencia ? `${COLORS.warning}10` : `${COLORS.success}10`,
            border: `1px solid ${hasCarencia ? `${COLORS.warning}30` : `${COLORS.success}30`}`,
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ fontSize: 16 }}>{hasCarencia ? "⏱️" : "✅"}</span>
            <div style={{ fontSize: 12, color: hasCarencia ? COLORS.warning : COLORS.success, fontWeight: 500 }}>
              <strong>Carência:</strong> Leite {toInt(it.produtoSel.meta.carencia_leite_dias, 0)}d • 
              Carne {toInt(it.produtoSel.meta.carencia_carne_dias, 0)}d
              {hasCarencia && (
                <span style={{ display: "block", marginTop: 2, opacity: 0.8 }}>
                  Produto com período de carência ativo
                </span>
              )}
            </div>
          </div>
        )}

        {/* Linha de dosagem e ações */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 180px auto", 
          gap: 16,
          alignItems: "end",
        }}>
          {/* Quantidade */}
          <div>
            <Label required tooltip="Quantidade a ser administrada">Quantidade</Label>
            <InputBase 
              value={it.quantidade} 
              onChange={(e) => updateItem(idx, { quantidade: e.target.value })} 
              placeholder="Ex: 10"
              icon="⚖️"
            />
          </div>

          {/* Unidade */}
          <div>
            <Label required>Unidade</Label>
            <Select
              value={it.unidadeSel}
              onChange={(opt) => updateItem(idx, { unidadeSel: opt })}
              options={UNIDADES}
              styles={selectStyles}
              menuPortalTarget={document.body}
              placeholder="Selecione..."
            />
          </div>

          {/* Ações */}
          <div style={{ 
            display: "flex", 
            gap: 8, 
            justifyContent: "flex-end",
          }}>
            {idx > 0 && (
              <button
                onClick={() => rmItem(idx)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: `1px solid ${COLORS.danger}40`,
                  background: `${COLORS.danger}10`,
                  color: COLORS.danger,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = COLORS.danger;
                  e.target.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = `${COLORS.danger}10`;
                  e.target.style.color = COLORS.danger;
                }}
                title="Remover este item"
              >
                🗑️ Remover
              </button>
            )}
            
            {isLast && (
              <button
                onClick={addItem}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: `1px solid ${COLORS.accent}`,
                  background: COLORS.accent,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: `0 4px 12px rgba(59, 130, 246, 0.3)`,
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = COLORS.accentHover;
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = COLORS.accent;
                  e.target.style.transform = "none";
                }}
                title="Adicionar novo item"
              >
                + Adicionar Item
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={overlayStyles} onMouseDown={onClose}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
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
                  placeholder="Ex: Mastite Aguda - Protocolo IMM Dias 0-2"
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

          {/* Seção: Itens de Aplicação */}
          <SectionCard 
            title="Itens de Aplicação" 
            subtitle="Configure os produtos, vias de administração e dosagens para cada dia do tratamento. O dia é relativo ao início do tratamento."
            icon="💉"
          >
            <div style={{ display: "grid", gap: 16 }}>
              {itens.map((it, idx) => (
                <LinhaItem 
                  key={idx} 
                  it={it} 
                  idx={idx} 
                  isLast={idx === itens.length - 1}
                  total={itens.length}
                />
              ))}
            </div>
          </SectionCard>

          {/* Info box */}
          <div style={{
            background: `${COLORS.accent}08`,
            border: `1px dashed ${COLORS.accent}40`,
            borderRadius: 12,
            padding: "16px 20px",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 20,
          }}>
            <span style={{ fontSize: 20 }}>💡</span>
            <div style={{ fontSize: 13, color: COLORS.text.secondary, lineHeight: 1.6 }}>
              <strong>Próximo passo:</strong> Após salvar este protocolo, você poderá utilizá-lo no modal 
              <strong> "Iniciar Tratamento"</strong>. Basta selecionar o animal e a data de início, 
              e o sistema calculará automaticamente as datas reais de aplicação e o término do período de carência.
            </div>
          </div>

          {/* Footer Actions */}
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
                onMouseEnter={(e) => {
                  if (!salvando) {
                    e.target.style.borderColor = COLORS.text.muted;
                    e.target.style.color = COLORS.text.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = COLORS.border;
                  e.target.style.color = COLORS.text.secondary;
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
                  transform: salvando ? "scale(0.98)" : "scale(1)",
                }}
                onMouseEnter={(e) => {
                  if (!salvando) {
                    e.target.style.background = COLORS.accentHover;
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = `0 6px 20px rgba(59, 130, 246, 0.4)`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = COLORS.accent;
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = salvando ? "none" : `0 4px 14px rgba(59, 130, 246, 0.35)`;
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
                  <>
                    💾 Salvar Protocolo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
