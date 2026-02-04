// src/pages/ConsumoReposicao/Limpeza.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";

/** =========================================================
 *  LIMPEZA — LAYOUT MODERNO + FUNCIONALIDADE MELHORADA
 *  - CRUD em memória (preparado para plugar no novo banco)
 *  - UX aprimorada: chips de dias, badges visuais, tooltips
 * ========================================================= */

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DIAS_COMPLETOS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const TIPOS = ["Ordenhadeira", "Resfriador", "Tambo", "Outros"];

let MEMO_LIMPEZA = {
  data: null,
  lastAt: 0,
};

/* ===== helpers ===== */
const formatBRL = (n) =>
  (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const convToMl = (valor, unidade) => {
  const v = Number(valor) || 0;
  const u = String(unidade || "").toLowerCase();
  return u.startsWith("l") ? v * 1000 : v;
};

const parseCond = (c) => {
  if (!c) return { tipo: "sempre" };
  if (typeof c === "object") return c;
  if (String(c).toLowerCase().includes("manhã")) return { tipo: "manha" };
  if (String(c).toLowerCase().includes("tarde")) return { tipo: "tarde" };
  const m = String(c).match(/a cada\s*(\d+)/i);
  if (m) return { tipo: "cada", intervalo: parseInt(m[1], 10) };
  return { tipo: "sempre" };
};

const vezesPorDia = (cond, freq) => {
  switch (cond?.tipo) {
    case "cada":
      return (Number(freq) || 1) / Math.max(1, Number(cond.intervalo) || 1);
    case "manha":
    case "tarde":
      return 1;
    default:
      return Number(freq) || 1;
  }
};

function isNum(n) {
  if (n === "" || n === null || n === undefined) return false;
  const v = Number(n);
  return typeof v === "number" && !Number.isNaN(v);
}

function cryptoId() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {}
  return `id_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

/* ==================== Componente principal ==================== */
export default function Limpeza() {
  const memoData = MEMO_LIMPEZA.data || {};
  
  const [precoPorML, setPrecoPorML] = useState(
    () => memoData.precoPorML ?? {
      "Detergente Alcalino": 0.012,
      "Ácido Nítrico": 0.020,
      "Sanitizante": 0.030,
    }
  );

  const [estoqueML, setEstoqueML] = useState(
    () => memoData.estoqueML ?? {
      "Detergente Alcalino": 25000,
      "Ácido Nítrico": 12000,
      "Sanitizante": 8000,
    }
  );

  const [ciclos, setCiclos] = useState(
    () => memoData.ciclos ?? [
      {
        id: "c1",
        nome: "CIP Ordenhadeira",
        tipo: "Ordenhadeira",
        diasSemana: [1, 2, 3, 4, 5, 6],
        frequencia: 2,
        etapas: [
          {
            produto: "Detergente Alcalino",
            quantidade: 200,
            unidade: "mL",
            condicao: { tipo: "sempre" },
            complementar: false,
          },
          {
            produto: "Sanitizante",
            quantidade: 100,
            unidade: "mL",
            condicao: { tipo: "tarde" },
            complementar: true,
          },
        ],
      },
    ]
  );

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [filtros, setFiltros] = useState({ tipo: "__ALL__" });
  const [modal, setModal] = useState({ open: false, index: null, ciclo: null });
  const [planoDe, setPlanoDe] = useState(null);
  const [excluirIdx, setExcluirIdx] = useState(null);

  // Persistência em memória
  useEffect(() => {
    MEMO_LIMPEZA.data = {
      precoPorML,
      estoqueML,
      ciclos,
    };
    MEMO_LIMPEZA.lastAt = Date.now();
  }, [precoPorML, estoqueML, ciclos]);

  const produtosDisponiveis = useMemo(() => {
    return Object.keys(precoPorML || {}).sort((a, b) => a.localeCompare(b));
  }, [precoPorML]);

  const tipoOptions = useMemo(() => {
    return Array.from(new Set(ciclos.map((c) => c.tipo).filter(Boolean))).sort();
  }, [ciclos]);

  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      if (prev.direction === "desc") return { key: null, direction: null };
      return { key, direction: "asc" };
    });
  };

  // ===== Ações CRUD =====
  const abrirCadastro = () =>
    setModal({
      open: true,
      index: null,
      ciclo: {
        id: null,
        nome: "",
        tipo: "Ordenhadeira",
        diasSemana: [1, 2, 3, 4, 5],
        frequencia: 2,
        etapas: [
          {
            produto: produtosDisponiveis[0] || "",
            quantidade: "",
            unidade: "mL",
            condicao: { tipo: "sempre" },
            complementar: false,
          },
        ],
      },
    });

  const abrirEdicao = (i) =>
    setModal({
      open: true,
      index: i,
      ciclo: JSON.parse(JSON.stringify(ciclos[i])),
    });

  const validarCiclo = (c) => {
    if (!String(c?.nome || "").trim()) return "Informe o nome do ciclo.";
    if (!String(c?.tipo || "").trim()) return "Selecione o tipo do ciclo.";
    if (!Array.isArray(c?.diasSemana) || c.diasSemana.length === 0)
      return "Selecione ao menos um dia da semana.";
    const freq = Number(c?.frequencia || 0);
    if (!freq || freq < 1) return "Frequência inválida.";
    if (!Array.isArray(c?.etapas) || c.etapas.length === 0)
      return "Adicione ao menos uma etapa.";
    for (let i = 0; i < c.etapas.length; i++) {
      const e = c.etapas[i];
      if (!String(e?.produto || "").trim())
        return `Selecione o produto da Etapa ${i + 1}.`;
      if (!isNum(e?.quantidade) || Number(e.quantidade) <= 0)
        return `Informe a quantidade válida na Etapa ${i + 1}.`;
    }
    return null;
  };

  const salvar = (cicloFinal) => {
    const msg = validarCiclo(cicloFinal);
    if (msg) {
      alert(`❌ ${msg}`);
      return;
    }

    setCiclos((prev) => {
      const list = [...prev];
      const id = cicloFinal.id || cryptoId();
      const payload = { ...cicloFinal, id };

      const idx = list.findIndex((c) => c.id === id);
      if (idx >= 0) list[idx] = payload;
      else list.push(payload);

      return list.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
    });

    setModal({ open: false, index: null, ciclo: null });
  };

  const confirmarExclusao = () => {
    setCiclos((prev) => prev.filter((_, i) => i !== excluirIdx));
    setExcluirIdx(null);
  };

  // ===== Cálculos =====
  const custoDiarioValor = (c) => {
    const freq = Number(c.frequencia) || 1;
    return (c.etapas || []).reduce((acc, e) => {
      const cond = parseCond(e.condicao);
      const vezes = vezesPorDia(cond, freq);
      const ml = convToMl(e.quantidade, e.unidade);
      const preco = precoPorML[e.produto] ?? 0;
      return acc + ml * vezes * preco;
    }, 0);
  };

  const duracaoEstimadaValor = (c) => {
    const freq = Number(c.frequencia) || 1;
    let minDias = Infinity;

    (c.etapas || []).forEach((e) => {
      const cond = parseCond(e.condicao);
      const vezes = vezesPorDia(cond, freq);
      const mlDia = convToMl(e.quantidade, e.unidade) * vezes;
      const estoque = estoqueML[e.produto] ?? 0;
      if (mlDia > 0) minDias = Math.min(minDias, estoque / mlDia);
    });

    return !isFinite(minDias) ? null : Math.floor(minDias);
  };

  // ===== Filtros e Sort =====
  const ciclosExibidos = useMemo(() => {
    let lista = [...ciclos];

    if (filtros.tipo !== "__ALL__") {
      lista = lista.filter((c) => c.tipo === filtros.tipo);
    }

    if (sortConfig.key) {
      const dir = sortConfig.direction === "desc" ? -1 : 1;
      lista.sort((a, b) => {
        if (sortConfig.key === "nome")
          return String(a.nome || "").localeCompare(String(b.nome || "")) * dir;
        if (sortConfig.key === "custo")
          return (custoDiarioValor(a) - custoDiarioValor(b)) * dir;
        return 0;
      });
    }
    return lista;
  }, [ciclos, filtros, sortConfig, precoPorML]);

  const resumo = useMemo(() => {
    const total = ciclosExibidos.length;
    const totalEtapas = ciclosExibidos.reduce((acc, c) => acc + (c.etapas?.length || 0), 0);
    const custoTotal = ciclosExibidos.reduce((acc, c) => acc + custoDiarioValor(c), 0);
    return { 
      total, 
      totalEtapas, 
      custoMedio: total ? custoTotal / total : 0,
      custoTotal 
    };
  }, [ciclosExibidos]);

  // ===== Estilos =====
  const styles = {
    page: { width: "100%", minHeight: "100vh", backgroundColor: "#f8fafc", padding: "24px" },
    container: { maxWidth: "1400px", margin: "0 auto" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
    titleGroup: { display: "flex", flexDirection: "column", gap: "4px" },
    title: { fontSize: "24px", fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.025em" },
    subtitle: { fontSize: "14px", color: "#64748b", margin: 0 },
    headerActions: { display: "flex", gap: "12px" },
    primaryButton: {
      padding: "10px 20px", backgroundColor: "#3b82f6", color: "#fff", border: "none",
      borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
      boxShadow: "0 1px 3px rgba(59,130,246,0.3)", display: "flex", alignItems: "center", gap: "8px",
    },
    secondaryButton: {
      padding: "10px 20px", backgroundColor: "#fff", color: "#374151", border: "1px solid #e5e7eb",
      borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: "pointer",
    },
    filtersBar: {
      display: "flex", gap: "16px", marginBottom: "24px", padding: "20px",
      backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", alignItems: "center",
    },
    filterGroup: { display: "flex", flexDirection: "column", gap: "6px" },
    filterLabel: { fontSize: "12px", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" },
    select: { padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", backgroundColor: "#fff", minWidth: "180px" },
    tableContainer: {
      backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden", position: "relative",
    },
    table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
    thead: { backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" },
    th: { padding: "16px 20px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" },
    thSortable: { cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
    td: { padding: "16px 20px", color: "#334155", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" },
    tr: { transition: "background-color 0.15s" },
    trHover: { backgroundColor: "#f8fafc" },
    tdCenter: { textAlign: "center" },
    tipoBadge: { display: "inline-flex", padding: "6px 12px", backgroundColor: "#eff6ff", color: "#1e40af", borderRadius: "8px", fontSize: "13px", fontWeight: 600 },
    diasContainer: { display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "center" },
    diaBadge: { 
      width: "28px", height: "28px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "11px", fontWeight: 700 
    },
    diaAtivo: { backgroundColor: "#3b82f6", color: "#fff" },
    diaInativo: { backgroundColor: "#f1f5f9", color: "#94a3b8" },
    freqBadge: { fontFamily: "monospace", fontSize: "14px", fontWeight: 600, color: "#0f172a", backgroundColor: "#f1f5f9", padding: "4px 8px", borderRadius: "6px" },
    custoBadge: { fontFamily: "monospace", fontSize: "14px", fontWeight: 700, color: "#059669" },
    duracaoBadge: { fontSize: "13px", fontWeight: 600, color: "#7c3aed", backgroundColor: "#f3e8ff", padding: "4px 10px", borderRadius: "9999px" },
    etapasText: { fontSize: "13px", color: "#64748b", lineHeight: 1.4, maxWidth: "300px" },
    actionButtons: { display: "flex", gap: "8px", justifyContent: "center" },
    iconButton: { padding: "8px", backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontSize: "14px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" },
    iconButtonDanger: { color: "#ef4444" },
    footer: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0" },
    footerStats: { display: "flex", gap: "24px", fontSize: "14px", color: "#64748b" },
    statValue: { fontWeight: 700, color: "#0f172a" },
    emptyState: { padding: "48px", textAlign: "center", color: "#64748b" },
  };

  return (
    <section style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <h1 style={styles.title}>Controle de Limpeza</h1>
            <p style={styles.subtitle}>Gerencie ciclos de CIP e protocolos de higienização</p>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.secondaryButton} onClick={() => window.location.reload()}>
              ↻ Atualizar
            </button>
            <button style={styles.primaryButton} onClick={abrirCadastro}>
              <span>+</span>
              <span>Novo Ciclo</span>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div style={styles.filtersBar}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Tipo de Equipamento</label>
            <select 
              style={styles.select}
              value={filtros.tipo}
              onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
            >
              <option value="__ALL__">Todos os tipos</option>
              {tipoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>
                  <div style={styles.thSortable} onClick={() => toggleSort("nome")}>
                    <span>Nome do Ciclo</span>
                    {sortConfig.key === "nome" && <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                  </div>
                </th>
                <th style={{...styles.th, textAlign: "center"}}>Tipo</th>
                <th style={{...styles.th, textAlign: "center"}}>Frequência</th>
                <th style={{...styles.th, textAlign: "center"}}>Dias da Semana</th>
                <th style={{...styles.th, textAlign: "center"}}>Duração Est.</th>
                <th style={{...styles.th, textAlign: "right"}}>
                  <div style={{...styles.thSortable, justifyContent: "flex-end"}} onClick={() => toggleSort("custo")}>
                    <span>Custo Diário</span>
                    {sortConfig.key === "custo" && <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                  </div>
                </th>
                <th style={styles.th}>Resumo das Etapas</th>
                <th style={{...styles.th, textAlign: "center"}}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ciclosExibidos.length === 0 ? (
                <tr>
                  <td colSpan={8} style={styles.emptyState}>
                    <div style={{fontSize: "48px", marginBottom: "16px"}}>🧼</div>
                    <div style={{fontSize: "16px", fontWeight: 600, marginBottom: "8px"}}>Nenhum ciclo cadastrado</div>
                    <div>Cadastre seu primeiro protocolo de limpeza</div>
                  </td>
                </tr>
              ) : (
                ciclosExibidos.map((c, i) => {
                  const rowId = c.id || i;
                  const isHovered = hoveredRowId === rowId;
                  const duracao = duracaoEstimadaValor(c);
                  
                  return (
                    <tr key={rowId} style={{...styles.tr, ...(isHovered ? styles.trHover : {})}}
                        onMouseEnter={() => setHoveredRowId(rowId)}
                        onMouseLeave={() => setHoveredRowId(null)}>
                      <td style={{...styles.td, fontWeight: 600, color: "#0f172a"}}>{c.nome}</td>
                      <td style={{...styles.td, ...styles.tdCenter}}>
                        <span style={styles.tipoBadge}>{c.tipo}</span>
                      </td>
                      <td style={{...styles.td, ...styles.tdCenter}}>
                        <span style={styles.freqBadge}>{c.frequencia}x/dia</span>
                      </td>
                      <td style={{...styles.td, ...styles.tdCenter}}>
                        <div style={styles.diasContainer}>
                          {[0,1,2,3,4,5,6].map(d => (
                            <div key={d} style={{
                              ...styles.diaBadge,
                              ...(c.diasSemana?.includes(d) ? styles.diaAtivo : styles.diaInativo)
                            }} title={DIAS_COMPLETOS[d]}>
                              {DIAS[d]}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={{...styles.td, ...styles.tdCenter}}>
                        {duracao ? (
                          <span style={styles.duracaoBadge}>{duracao} dias</span>
                        ) : (
                          <span style={{color: "#94a3b8"}}>—</span>
                        )}
                      </td>
                      <td style={{...styles.td, textAlign: "right"}}>
                        <span style={styles.custoBadge}>{formatBRL(custoDiarioValor(c))}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.etapasText} title={c.etapas?.map(e => `${e.produto} (${e.quantidade}${e.unidade})`).join(" → ")}>
                          {c.etapas?.map((e, idx) => (
                            <span key={idx}>
                              {idx > 0 && <span style={{color: "#cbd5e1", margin: "0 4px"}}>→</span>}
                              <span style={{fontWeight: 500}}>{e.produto}</span>
                              <span style={{color: "#94a3b8", fontSize: "12px"}}> ({e.quantidade}{e.unidade})</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{...styles.td, ...styles.tdCenter}}>
                        <div style={styles.actionButtons}>
                          <button style={styles.iconButton} onClick={() => abrirEdicao(i)} title="Editar">✏️</button>
                          <button style={{...styles.iconButton, ...styles.iconButtonDanger}} onClick={() => setExcluirIdx(i)} title="Excluir">🗑️</button>
                          <button style={styles.iconButton} onClick={() => setPlanoDe(c)} title="Ver Plano">📋</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Footer */}
          {ciclosExibidos.length > 0 && (
            <div style={styles.footer}>
              <div style={styles.footerStats}>
                <span><strong style={styles.statValue}>{resumo.total}</strong> ciclos</span>
                <span><strong style={styles.statValue}>{resumo.totalEtapas}</strong> etapas totais</span>
                <span>Custo médio: <strong style={{...styles.statValue, color: "#059669"}}>{formatBRL(resumo.custoMedio)}</strong>/dia</span>
                <span>Custo total: <strong style={styles.statValue}>{formatBRL(resumo.custoTotal)}</strong>/dia</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAIS */}
      {modal.open && (
        <Modal title={modal.ciclo?.id ? "✏️ Editar Ciclo" : "➕ Novo Ciclo de Limpeza"} onClose={() => setModal({open: false})}>
          <CadastroCicloModal
            value={modal.ciclo}
            onCancel={() => setModal({open: false})}
            onSave={salvar}
            tipos={TIPOS}
            produtos={produtosDisponiveis}
            precoPorML={precoPorML}
          />
        </Modal>
      )}

      {planoDe && (
        <Modal title={`📋 Plano Semanal: ${planoDe.nome}`} onClose={() => setPlanoDe(null)}>
          <PlanoSemanal ciclo={planoDe} />
          <div style={{display: "flex", justifyContent: "flex-end", marginTop: "20px"}}>
            <button style={styles.primaryButton} onClick={() => setPlanoDe(null)}>Fechar</button>
          </div>
        </Modal>
      )}

      {excluirIdx !== null && (
        <Modal title="⚠️ Confirmar Exclusão" onClose={() => setExcluirIdx(null)}>
          <div style={{color: "#374151", marginBottom: "20px", lineHeight: 1.6}}>
            Deseja realmente excluir o ciclo <strong>"{ciclos[excluirIdx]?.nome}"</strong>?
            <br />
            <span style={{fontSize: "13px", color: "#ef4444"}}>Esta ação não poderá ser desfeita.</span>
          </div>
          <div style={{display: "flex", justifyContent: "flex-end", gap: "12px"}}>
            <button style={styles.secondaryButton} onClick={() => setExcluirIdx(null)}>Cancelar</button>
            <button style={{...styles.primaryButton, backgroundColor: "#ef4444"}} onClick={confirmarExclusao}>Excluir Ciclo</button>
          </div>
        </Modal>
      )}
    </section>
  );
}

/* =================== Sub-componentes =================== */

function CadastroCicloModal({ value, onCancel, onSave, tipos, produtos, precoPorML }) {
  const [form, setForm] = useState(value);
  const [previewCusto, setPreviewCusto] = useState(0);

  useEffect(() => {
    setForm(value);
  }, [value]);

  // Calcular preview de custo em tempo real
  useEffect(() => {
    const freq = Number(form.frequencia) || 1;
    const custo = (form.etapas || []).reduce((acc, e) => {
      const cond = parseCond(e.condicao);
      const vezes = vezesPorDia(cond, freq);
      const ml = convToMl(e.quantidade, e.unidade);
      const preco = precoPorML[e.produto] ?? 0;
      return acc + ml * vezes * preco;
    }, 0);
    setPreviewCusto(custo);
  }, [form, precoPorML]);

  const set = (k, v) => setForm(f => ({...f, [k]: v}));
  
  const toggleDia = (d) => set("diasSemana", 
    form.diasSemana.includes(d) 
      ? form.diasSemana.filter(x => x !== d)
      : [...form.diasSemana, d]
  );

  const setEtapa = (i, campo, val) => {
    const arr = [...form.etapas];
    arr[i] = {...arr[i], [campo]: val};
    set("etapas", arr);
  };

  const addEtapa = () => set("etapas", [...form.etapas, {produto: produtos[0] || "", quantidade: "", unidade: "mL", condicao: {tipo: "sempre"}, complementar: false}]);
  
  const rmEtapa = (i) => set("etapas", form.etapas.filter((_, idx) => idx !== i));

  const styles = {
    formGroup: { marginBottom: "20px" },
    label: { display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" },
    input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" },
    select: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", backgroundColor: "#fff" },
    diasGrid: { display: "flex", gap: "8px", flexWrap: "wrap" },
    diaChip: { 
      padding: "8px 16px", borderRadius: "8px", border: "2px solid #e2e8f0", cursor: "pointer",
      fontSize: "14px", fontWeight: 600, transition: "all 0.2s"
    },
    diaChipAtivo: { backgroundColor: "#3b82f6", color: "#fff", borderColor: "#3b82f6" },
    diaChipInativo: { backgroundColor: "#fff", color: "#64748b" },
    etapaCard: { 
      backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", 
      padding: "16px", marginBottom: "12px" 
    },
    etapaHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
    etapaTitle: { fontWeight: 700, color: "#1e40af" },
    row: { display: "flex", gap: "12px", marginBottom: "12px" },
    col: { flex: 1 },
    checkboxLabel: { display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#374151", cursor: "pointer" },
    previewBox: { 
      backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", 
      padding: "12px 16px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center"
    },
    previewLabel: { fontSize: "13px", color: "#166534", fontWeight: 600 },
    previewValue: { fontSize: "18px", fontWeight: 700, color: "#059669" },
    buttonGroup: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" },
    btnSecondary: { padding: "10px 20px", border: "1px solid #e5e7eb", backgroundColor: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 500 },
    btnPrimary: { padding: "10px 20px", border: "none", backgroundColor: "#3b82f6", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 600 },
    btnAdd: { padding: "8px 16px", border: "2px dashed #cbd5e1", backgroundColor: "#fff", borderRadius: "8px", cursor: "pointer", color: "#64748b", fontWeight: 500, width: "100%", marginTop: "8px" },
    btnRemove: { padding: "6px 12px", fontSize: "12px", color: "#ef4444", border: "1px solid #fecaca", backgroundColor: "#fef2f2", borderRadius: "6px", cursor: "pointer" }
  };

  return (
    <div style={{maxHeight: "70vh", overflow: "auto", paddingRight: "8px"}}>
      {/* Preview de Custo */}
      <div style={styles.previewBox}>
        <span style={styles.previewLabel}>💰 Custo Estimado (Preview)</span>
        <span style={styles.previewValue}>{formatBRL(previewCusto)} / dia</span>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Nome do Ciclo *</label>
        <input style={styles.input} value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Ex: CIP Ordenhadeira Tard" />
      </div>

      <div style={styles.row}>
        <div style={styles.col}>
          <label style={styles.label}>Tipo de Equipamento *</label>
          <select style={styles.select} value={form.tipo} onChange={e => set("tipo", e.target.value)}>
            <option value="">Selecione...</option>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={styles.col}>
          <label style={styles.label}>Frequência por dia *</label>
          <select style={styles.select} value={form.frequencia} onChange={e => set("frequencia", Number(e.target.value))}>
            {[1,2,3,4].map(f => <option key={f} value={f}>{f}x ao dia</option>)}
          </select>
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Dias da Semana *</label>
        <div style={styles.diasGrid}>
          {DIAS.map((dia, idx) => (
            <button key={idx} type="button" onClick={() => toggleDia(idx)}
                    style={{...styles.diaChip, ...(form.diasSemana.includes(idx) ? styles.diaChipAtivo : styles.diaChipInativo)}}>
              {dia}
            </button>
          ))}
        </div>
      </div>

      <div style={{...styles.formGroup, borderTop: "2px solid #e2e8f0", paddingTop: "20px"}}>
        <label style={{...styles.label, fontSize: "16px", color: "#0f172a"}}>Etapas de Limpeza</label>
        
        {form.etapas.map((etapa, i) => (
          <div key={i} style={styles.etapaCard}>
            <div style={styles.etapaHeader}>
              <span style={styles.etapaTitle}>Etapa {i + 1}</span>
              {form.etapas.length > 1 && (
                <button style={styles.btnRemove} onClick={() => rmEtapa(i)}>Remover</button>
              )}
            </div>
            
            <div style={styles.row}>
              <div style={{flex: 2}}>
                <label style={styles.label}>Produto</label>
                <select style={styles.select} value={etapa.produto} onChange={e => setEtapa(i, "produto", e.target.value)}>
                  {produtos.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{flex: 1}}>
                <label style={styles.label}>Qtd</label>
                <input type="number" style={styles.input} value={etapa.quantidade} onChange={e => setEtapa(i, "quantidade", e.target.value)} />
              </div>
              <div style={{flex: 1}}>
                <label style={styles.label}>Unidade</label>
                <select style={styles.select} value={etapa.unidade} onChange={e => setEtapa(i, "unidade", e.target.value)}>
                  <option value="mL">mL</option>
                  <option value="L">Litros</option>
                </select>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Condição de Aplicação</label>
                <select style={styles.select} value={etapa.condicao?.tipo} onChange={e => setEtapa(i, "condicao", {tipo: e.target.value, intervalo: e.target.value === "cada" ? 2 : undefined})}>
                  <option value="sempre">Sempre</option>
                  <option value="manha">Somente Manhã</option>
                  <option value="tarde">Somente Tarde</option>
                  <option value="cada">A cada X ordenhas</option>
                </select>
              </div>
              {etapa.condicao?.tipo === "cada" && (
                <div style={styles.col}>
                  <label style={styles.label}>Intervalo (ordenhas)</label>
                  <input type="number" min="2" style={styles.input} value={etapa.condicao?.intervalo || 2} onChange={e => setEtapa(i, "condicao", {tipo: "cada", intervalo: Number(e.target.value)})} />
                </div>
              )}
            </div>

            <label style={styles.checkboxLabel}>
              <input type="checkbox" checked={etapa.complementar} onChange={e => setEtapa(i, "complementar", e.target.checked)} />
              <span>Etapa complementar (executada junto com a anterior)</span>
            </label>
          </div>
        ))}

        <button style={styles.btnAdd} onClick={addEtapa}>+ Adicionar Etapa</button>
      </div>

      <div style={styles.buttonGroup}>
        <button style={styles.btnSecondary} onClick={onCancel}>Cancelar</button>
        <button style={styles.btnPrimary} onClick={() => onSave(form)}>Salvar Ciclo</button>
      </div>
    </div>
  );
}

function PlanoSemanal({ ciclo }) {
  const freq = Number(ciclo.frequencia) || 1;
  const etapas = ciclo.etapas || [];
  
  return (
    <div style={{display: "flex", flexDirection: "column", gap: "12px", maxHeight: "60vh", overflow: "auto"}}>
      {DIAS.map((diaNome, diaIdx) => {
        if (!ciclo.diasSemana?.includes(diaIdx)) return null;
        
        const execs = [];
        for (let exec = 0; exec < freq; exec++) {
          const horario = freq === 1 ? "Única" : exec === 0 ? "Manhã" : exec === 1 ? "Tarde" : `Ordenha ${exec + 1}`;
          const itens = [];
          
          etapas.forEach((e) => {
            const cond = parseCond(e.condicao);
            let aplicar = true;
            if (cond.tipo === "cada") aplicar = (exec + 1) % (cond.intervalo || 1) === 0;
            else if (cond.tipo === "manha") aplicar = horario === "Manhã";
            else if (cond.tipo === "tarde") aplicar = horario === "Tarde";
            
            if (aplicar) {
              itens.push(`${e.quantidade}${e.unidade} de ${e.produto}`);
            }
          });
          
          if (itens.length) execs.push({horario, itens});
        }
        
        if (execs.length === 0) return null;
        
        return (
          <div key={diaIdx} style={{border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", backgroundColor: "#f8fafc"}}>
            <div style={{fontWeight: 700, color: "#1e40af", marginBottom: "12px", fontSize: "16px"}}>
              {diaNome}
            </div>
            {execs.map((ex, i) => (
              <div key={i} style={{marginBottom: i < execs.length - 1 ? "12px" : 0}}>
                <div style={{fontSize: "13px", fontWeight: 600, color: "#64748b", marginBottom: "6px"}}>{ex.horario}</div>
                <ul style={{margin: 0, paddingLeft: "20px"}}>
                  {ex.itens.map((item, k) => (
                    <li key={k} style={{color: "#334155", fontSize: "14px", marginBottom: "4px"}}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", 
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px"
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: "16px", width: "800px", maxWidth: "95vw", 
        maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", color: "#fff",
          padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <span style={{fontWeight: 700, fontSize: "18px"}}>{title}</span>
          <button onClick={onClose} style={{background: "none", border: "none", color: "#fff", fontSize: "24px", cursor: "pointer"}}>×</button>
        </div>
        <div style={{padding: "24px", overflow: "auto"}}>
          {children}
        </div>
      </div>
    </div>
  );
}