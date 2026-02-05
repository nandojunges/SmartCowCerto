import React, { useMemo, useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useFazenda } from "../../context/FazendaContext";
import {
  Modal,
  CadastroCicloModal,
  PlanoSemanal,
  DIAS,
  DIAS_COMPLETOS,
  TIPOS,
  formatBRL,
  convToMl,
  parseCond,
  vezesPorDia,
  isNum,
  formatGrupoEquivalenciaLabel,
} from "./ModalLimpeza";

/** =========================================================
 *  LIMPEZA — LAYOUT MODERNO + FUNCIONALIDADE MELHORADA
 *  - CRUD integrado ao Supabase
 *  - UX: chips de dias, badges visuais, tooltips
 * ========================================================= */

/* ==================== Componente principal ==================== */
export default function Limpeza() {
  const { fazendaAtualId } = useFazenda();

  const [precoPorML] = useState({});
  const [estoqueML] = useState({});
  const [gruposFuncionaisOptions, setGruposFuncionaisOptions] = useState([]);
  const [avisoGruposHigiene, setAvisoGruposHigiene] = useState("");
  const [ciclos, setCiclos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [filtros, setFiltros] = useState({ tipo: "__ALL__" });
  const [modal, setModal] = useState({ open: false, index: null, ciclo: null });
  const [planoDe, setPlanoDe] = useState(null);
  const [excluirCicloId, setExcluirCicloId] = useState(null);

  const carregarGruposFuncionais = useCallback(async () => {
    if (!fazendaAtualId) {
      setGruposFuncionaisOptions([]);
      setAvisoGruposHigiene("");
      return [];
    }

    const produtosRes = await supabase
      .from("estoque_produtos")
      .select("grupo_equivalencia,categoria")
      .eq("fazenda_id", fazendaAtualId)
      .eq("categoria", "Higiene");

    if (produtosRes.error) {
      throw produtosRes.error;
    }

    const grupos = Array.from(
      new Set(
        (produtosRes.data || [])
          .map((p) => String(p.grupo_equivalencia || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));

    const options = grupos.map((grupoEquivalencia) => ({
      value: grupoEquivalencia,
      label: formatGrupoEquivalenciaLabel(grupoEquivalencia),
    }));

    setGruposFuncionaisOptions(options);
    setAvisoGruposHigiene(
      options.length
        ? ""
        : "Cadastre produtos com categoria Higiene e grupo_equivalencia no estoque."
    );
    return options;
  }, [fazendaAtualId]);

  const condicaoParaBanco = (condicao) => {
    const cond = parseCond(condicao);
    if (cond?.tipo === "cada") return `A cada ${Number(cond.intervalo) || 1} ordenhas`;
    if (cond?.tipo === "manha") return "Somente manhã";
    if (cond?.tipo === "tarde") return "Somente tarde";
    return "Sempre";
  };

  useEffect(() => {
    const carregarDados = async () => {
      if (!fazendaAtualId) {
        setCiclos([]);
        setGruposFuncionaisOptions([]);
        return;
      }

      setLoading(true);
      setErro("");

      const ciclosRes = await supabase
        .from("limpeza_ciclos")
        .select("id,nome,tipo_equipamento,dias_semana,frequencia_dia,ativo,created_at,updated_at")
        .eq("fazenda_id", fazendaAtualId)
        .order("nome", { ascending: true });

      let gruposOptions = [];
      try {
        gruposOptions = await carregarGruposFuncionais();
      } catch (gruposError) {
        console.error("Erro ao carregar grupos funcionais:", gruposError);
      }

      if (ciclosRes.error) {
        console.error("Erro ao carregar limpeza:", ciclosRes.error);
        setErro("Não foi possível carregar os ciclos de limpeza.");
        setLoading(false);
        return;
      }

      const cicloIds = (ciclosRes.data || []).map((ciclo) => ciclo.id).filter(Boolean);
      let etapasData = [];
      if (cicloIds.length > 0) {
        const etapasRes = await supabase
          .from("limpeza_etapas")
          .select("id,ciclo_id,ordem,grupo_equivalencia,quantidade_ml,condicao,complementar")
          .eq("fazenda_id", fazendaAtualId)
          .in("ciclo_id", cicloIds)
          .order("ordem", { ascending: true });

        if (etapasRes.error) {
          console.error("Erro ao carregar etapas de limpeza:", etapasRes.error);
          setErro("Não foi possível carregar as etapas de limpeza.");
          setLoading(false);
          return;
        }
        etapasData = etapasRes.data || [];
      }

      const etapasPorCiclo = (etapasData || []).reduce((acc, etapa) => {
        const cicloId = etapa.ciclo_id;
        if (!acc[cicloId]) acc[cicloId] = [];
        acc[cicloId].push({
          grupo_equivalencia: etapa.grupo_equivalencia || "",
          quantidade: Number(etapa.quantidade_ml) || "",
          unidade: "mL",
          condicao: parseCond(etapa.condicao),
          complementar: !!etapa.complementar,
        });
        return acc;
      }, {});

      const ciclosMontados = (ciclosRes.data || []).map((ciclo) => ({
        id: ciclo.id,
        nome: ciclo.nome || "",
        tipo: ciclo.tipo_equipamento || "",
        diasSemana: Array.isArray(ciclo.dias_semana) ? ciclo.dias_semana : [],
        frequencia: Number(ciclo.frequencia_dia) || 1,
        etapas: etapasPorCiclo[ciclo.id] || [],
      }));

      setCiclos(ciclosMontados);
      setGruposFuncionaisOptions(gruposOptions);
      setLoading(false);
    };

    carregarDados();
  }, [carregarGruposFuncionais, fazendaAtualId]);

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
            grupo_equivalencia: gruposFuncionaisOptions[0]?.value || "",
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
    if (!Array.isArray(c?.etapas) || c.etapas.length === 0) return "Adicione ao menos uma etapa.";
    for (let i = 0; i < c.etapas.length; i++) {
      const e = c.etapas[i];
      if (!String(e?.grupo_equivalencia || "").trim()) return `Selecione o grupo funcional da Etapa ${i + 1}.`;
      if (!isNum(e?.quantidade) || Number(e.quantidade) <= 0)
        return `Informe a quantidade válida na Etapa ${i + 1}.`;
    }
    return null;
  };

  const salvar = async (cicloFinal) => {
    const msg = validarCiclo(cicloFinal);
    if (msg) {
      alert(`❌ ${msg}`);
      return;
    }

    if (!fazendaAtualId) {
      alert("❌ Selecione uma fazenda antes de salvar.");
      return;
    }

    setLoading(true);

    const cicloId = String(cicloFinal.id || "").trim() || crypto.randomUUID();

    const cicloPayload = {
      id: cicloId,
      fazenda_id: fazendaAtualId,
      nome: String(cicloFinal.nome || "").trim(),
      tipo_equipamento: cicloFinal.tipo,
      dias_semana: cicloFinal.diasSemana || [],
      frequencia_dia: Number(cicloFinal.frequencia) || 1,
      ativo: true,
    };

    const { data: cicloSalvo, error: cicloError } = await supabase
      .from("limpeza_ciclos")
      .upsert(cicloPayload, { onConflict: "id" })
      .select("id")
      .single();

    if (cicloError) {
      console.error("Erro ao salvar ciclo:", cicloError);
      setErro("Falha ao salvar ciclo de limpeza.");
      setLoading(false);
      return;
    }

    const cicloIdSalvo = cicloSalvo?.id || cicloId;

    const { error: delEtapasError } = await supabase
      .from("limpeza_etapas")
      .delete()
      .eq("fazenda_id", fazendaAtualId)
      .eq("ciclo_id", cicloIdSalvo);

    if (delEtapasError) {
      console.error("Erro ao limpar etapas antigas:", delEtapasError);
      setErro("Falha ao atualizar etapas do ciclo.");
      setLoading(false);
      return;
    }

    const etapasPayload = (cicloFinal.etapas || []).map((etapa, idx) => ({
      fazenda_id: fazendaAtualId,
      ciclo_id: cicloIdSalvo,
      ordem: idx + 1,
      grupo_equivalencia: String(etapa.grupo_equivalencia || "").trim(),
      quantidade_ml: Number(convToMl(etapa.quantidade, etapa.unidade)),
      condicao: condicaoParaBanco(etapa.condicao),
      complementar: !!etapa.complementar,
    }));

    if (etapasPayload.length > 0) {
      const { error: etapasError } = await supabase.from("limpeza_etapas").insert(etapasPayload);
      if (etapasError) {
        console.error("Erro ao inserir etapas:", etapasError);
        setErro("Falha ao salvar etapas de limpeza.");
        setLoading(false);
        return;
      }
    }

    const { data: ciclosAtualizados } = await supabase
      .from("limpeza_ciclos")
      .select("id,nome,tipo_equipamento,dias_semana,frequencia_dia,ativo,created_at,updated_at")
      .eq("fazenda_id", fazendaAtualId)
      .order("nome", { ascending: true });

    const cicloIdsAtualizados = (ciclosAtualizados || []).map((ciclo) => ciclo.id).filter(Boolean);
    let etapasAtualizadas = [];
    if (cicloIdsAtualizados.length > 0) {
      const { data } = await supabase
        .from("limpeza_etapas")
        .select("ciclo_id,ordem,grupo_equivalencia,quantidade_ml,condicao,complementar")
        .eq("fazenda_id", fazendaAtualId)
        .in("ciclo_id", cicloIdsAtualizados)
        .order("ordem", { ascending: true });
      etapasAtualizadas = data || [];
    }

    const etapasPorCiclo = (etapasAtualizadas || []).reduce((acc, etapa) => {
      if (!acc[etapa.ciclo_id]) acc[etapa.ciclo_id] = [];
      acc[etapa.ciclo_id].push({
        grupo_equivalencia: etapa.grupo_equivalencia || "",
        quantidade: Number(etapa.quantidade_ml) || "",
        unidade: "mL",
        condicao: parseCond(etapa.condicao),
        complementar: !!etapa.complementar,
      });
      return acc;
    }, {});

    setCiclos(
      (ciclosAtualizados || []).map((ciclo) => ({
        id: ciclo.id,
        nome: ciclo.nome || "",
        tipo: ciclo.tipo_equipamento || "",
        diasSemana: Array.isArray(ciclo.dias_semana) ? ciclo.dias_semana : [],
        frequencia: Number(ciclo.frequencia_dia) || 1,
        etapas: etapasPorCiclo[ciclo.id] || [],
      }))
    );

    setModal({ open: false, index: null, ciclo: null });
    setErro("");
    setLoading(false);
  };

  const confirmarExclusao = async () => {
    if (!fazendaAtualId || !excluirCicloId) return;

    const { error: excluirError } = await supabase
      .from("limpeza_ciclos")
      .delete()
      .eq("fazenda_id", fazendaAtualId)
      .eq("id", excluirCicloId);

    if (excluirError) {
      console.error("Erro ao excluir ciclo:", excluirError);
      setErro("Não foi possível excluir o ciclo.");
      return;
    }

    setCiclos((prev) => prev.filter((c) => c.id !== excluirCicloId));
    setExcluirCicloId(null);
  };

  // ===== Cálculos =====
  const custoDiarioValor = useCallback((c) => {
    const freq = Number(c?.frequencia) || 1;
    return (c?.etapas || []).reduce((acc, e) => {
      const cond = parseCond(e.condicao);
      const vezes = vezesPorDia(cond, freq);
      const ml = convToMl(e.quantidade, e.unidade);
      const preco = precoPorML?.[e.grupo_equivalencia] ?? 0;
      return acc + ml * vezes * preco;
    }, 0);
  }, [precoPorML]);

  const duracaoEstimadaValor = (c) => {
    const freq = Number(c?.frequencia) || 1;
    let minDias = Infinity;

    (c?.etapas || []).forEach((e) => {
      const cond = parseCond(e.condicao);
      const vezes = vezesPorDia(cond, freq);
      const mlDia = convToMl(e.quantidade, e.unidade) * vezes;
      const estoque = estoqueML?.[e.grupo_equivalencia] ?? 0;
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
        if (sortConfig.key === "custo") return (custoDiarioValor(a) - custoDiarioValor(b)) * dir;
        return 0;
      });
    }
    return lista;
  }, [ciclos, filtros, sortConfig, custoDiarioValor]);

  const resumo = useMemo(() => {
    const total = ciclosExibidos.length;
    const totalEtapas = ciclosExibidos.reduce((acc, c) => acc + (c.etapas?.length || 0), 0);
    const custoTotal = ciclosExibidos.reduce((acc, c) => acc + custoDiarioValor(c), 0);
    return {
      total,
      totalEtapas,
      custoMedio: total ? custoTotal / total : 0,
      custoTotal,
    };
  }, [ciclosExibidos, custoDiarioValor]);

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
      padding: "10px 20px",
      backgroundColor: "#3b82f6",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
      boxShadow: "0 1px 3px rgba(59,130,246,0.3)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    secondaryButton: {
      padding: "10px 20px",
      backgroundColor: "#fff",
      color: "#374151",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: 500,
      cursor: "pointer",
    },
    filtersBar: {
      display: "flex",
      gap: "16px",
      marginBottom: "24px",
      padding: "20px",
      backgroundColor: "#f8fafc",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      alignItems: "center",
    },
    filterGroup: { display: "flex", flexDirection: "column", gap: "6px" },
    filterLabel: {
      fontSize: "12px",
      fontWeight: 600,
      color: "#475569",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    select: {
      padding: "8px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      fontSize: "14px",
      backgroundColor: "#fff",
      minWidth: "180px",
    },
    tableContainer: {
      backgroundColor: "#fff",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      overflow: "hidden",
      position: "relative",
    },
    table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
    thead: { backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" },
    th: {
      padding: "16px 20px",
      textAlign: "left",
      fontSize: "12px",
      fontWeight: 700,
      color: "#475569",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      whiteSpace: "nowrap",
    },
    thSortable: { cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
    td: {
      padding: "16px 20px",
      color: "#334155",
      borderBottom: "1px solid #f1f5f9",
      verticalAlign: "middle",
    },
    tr: { transition: "background-color 0.15s" },
    trHover: { backgroundColor: "#f8fafc" },
    tdCenter: { textAlign: "center" },
    tipoBadge: {
      display: "inline-flex",
      padding: "6px 12px",
      backgroundColor: "#eff6ff",
      color: "#1e40af",
      borderRadius: "8px",
      fontSize: "13px",
      fontWeight: 600,
    },
    diasContainer: { display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "center" },
    diaBadge: {
      width: "28px",
      height: "28px",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "11px",
      fontWeight: 700,
    },
    diaAtivo: { backgroundColor: "#3b82f6", color: "#fff" },
    diaInativo: { backgroundColor: "#f1f5f9", color: "#94a3b8" },
    freqBadge: {
      fontFamily: "monospace",
      fontSize: "14px",
      fontWeight: 600,
      color: "#0f172a",
      backgroundColor: "#f1f5f9",
      padding: "4px 8px",
      borderRadius: "6px",
    },
    custoBadge: { fontFamily: "monospace", fontSize: "14px", fontWeight: 700, color: "#059669" },
    duracaoBadge: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#7c3aed",
      backgroundColor: "#f3e8ff",
      padding: "4px 10px",
      borderRadius: "9999px",
    },
    etapasText: { fontSize: "13px", color: "#64748b", lineHeight: 1.4, maxWidth: "300px" },
    actionButtons: { display: "flex", gap: "8px", justifyContent: "center" },
    iconButton: {
      padding: "8px",
      backgroundColor: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      width: "36px",
      height: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s",
    },
    iconButtonDanger: { color: "#ef4444" },
    footer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 24px",
      backgroundColor: "#f8fafc",
      borderTop: "1px solid #e2e8f0",
    },
    footerStats: { display: "flex", gap: "24px", fontSize: "14px", color: "#64748b", flexWrap: "wrap" },
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
            <button style={styles.primaryButton} onClick={abrirCadastro} disabled={loading}>
              <span>+</span>
              <span>{loading ? "Carregando..." : "Novo Ciclo"}</span>
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
              onChange={(e) => setFiltros((prev) => ({ ...prev, tipo: e.target.value }))}
            >
              <option value="__ALL__">Todos os tipos</option>
              {tipoOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
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
                <th style={{ ...styles.th, textAlign: "center" }}>Tipo</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Frequência</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Dias da Semana</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Duração Est.</th>
                <th style={{ ...styles.th, textAlign: "right" }}>
                  <div style={{ ...styles.thSortable, justifyContent: "flex-end" }} onClick={() => toggleSort("custo")}>
                    <span>Custo Diário</span>
                    {sortConfig.key === "custo" && <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                  </div>
                </th>
                <th style={styles.th}>Resumo das Etapas</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {ciclosExibidos.length === 0 ? (
                <tr>
                  <td colSpan={8} style={styles.emptyState}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🧼</div>
                    <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>
                      Nenhum ciclo cadastrado
                    </div>
                    <div>Cadastre seu primeiro protocolo de limpeza</div>
                  </td>
                </tr>
              ) : (
                ciclosExibidos.map((c, i) => {
                  const rowId = c.id || i;
                  const isHovered = hoveredRowId === rowId;
                  const duracao = duracaoEstimadaValor(c);

                  return (
                    <tr
                      key={rowId}
                      style={{ ...styles.tr, ...(isHovered ? styles.trHover : {}) }}
                      onMouseEnter={() => setHoveredRowId(rowId)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      <td style={{ ...styles.td, fontWeight: 600, color: "#0f172a" }}>{c.nome}</td>

                      <td style={{ ...styles.td, ...styles.tdCenter }}>
                        <span style={styles.tipoBadge}>{c.tipo}</span>
                      </td>

                      <td style={{ ...styles.td, ...styles.tdCenter }}>
                        <span style={styles.freqBadge}>{c.frequencia}x/dia</span>
                      </td>

                      <td style={{ ...styles.td, ...styles.tdCenter }}>
                        <div style={styles.diasContainer}>
                          {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                            <div
                              key={d}
                              style={{
                                ...styles.diaBadge,
                                ...(c.diasSemana?.includes(d) ? styles.diaAtivo : styles.diaInativo),
                              }}
                              title={DIAS_COMPLETOS[d]}
                            >
                              {DIAS[d]}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td style={{ ...styles.td, ...styles.tdCenter }}>
                        {duracao ? <span style={styles.duracaoBadge}>{duracao} dias</span> : <span style={{ color: "#94a3b8" }}>—</span>}
                      </td>

                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <span style={styles.custoBadge}>{formatBRL(custoDiarioValor(c))}</span>
                      </td>

                      <td style={styles.td}>
                        <div
                          style={styles.etapasText}
                          title={c.etapas?.map((e) => `${formatGrupoEquivalenciaLabel(e.grupo_equivalencia)} (${e.quantidade}${e.unidade})`).join(" → ")}
                        >
                          {c.etapas?.map((e, idx) => (
                            <span key={idx}>
                              {idx > 0 && <span style={{ color: "#cbd5e1", margin: "0 4px" }}>→</span>}
                              <span style={{ fontWeight: 500 }}>{formatGrupoEquivalenciaLabel(e.grupo_equivalencia)}</span>
                              <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                                {" "}
                                ({e.quantidade}
                                {e.unidade})
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>

                      <td style={{ ...styles.td, ...styles.tdCenter }}>
                        <div style={styles.actionButtons}>
                          <button style={styles.iconButton} onClick={() => abrirEdicao(i)} title="Editar">
                            ✏️
                          </button>
                          <button style={{ ...styles.iconButton, ...styles.iconButtonDanger }} onClick={() => setExcluirCicloId(c.id)} title="Excluir">
                            🗑️
                          </button>
                          <button style={styles.iconButton} onClick={() => setPlanoDe(c)} title="Ver Plano">
                            📋
                          </button>
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
                <span>
                  <strong style={styles.statValue}>{resumo.total}</strong> ciclos
                </span>
                <span>
                  <strong style={styles.statValue}>{resumo.totalEtapas}</strong> etapas totais
                </span>
                <span>
                  Custo médio:{" "}
                  <strong style={{ ...styles.statValue, color: "#059669" }}>{formatBRL(resumo.custoMedio)}</strong>/dia
                </span>
                <span>
                  Custo total: <strong style={styles.statValue}>{formatBRL(resumo.custoTotal)}</strong>/dia
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAIS */}
      {modal.open && (
        <Modal
          title={modal.ciclo?.id ? "✏️ Editar Ciclo" : "➕ Novo Ciclo de Limpeza"}
          onClose={() => setModal({ open: false, index: null, ciclo: null })}
        >
          <CadastroCicloModal
            value={modal.ciclo}
            onCancel={() => setModal({ open: false, index: null, ciclo: null })}
            onSave={salvar}
            tipos={TIPOS}
            gruposFuncionaisOptions={gruposFuncionaisOptions}
            precoPorML={precoPorML}
          />
        </Modal>
      )}

      {planoDe && (
        <Modal title={`📋 Plano Semanal: ${planoDe.nome}`} onClose={() => setPlanoDe(null)}>
          <PlanoSemanal ciclo={planoDe} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
            <button style={styles.primaryButton} onClick={() => setPlanoDe(null)}>
              Fechar
            </button>
          </div>
        </Modal>
      )}


      {avisoGruposHigiene ? (
        <div
          style={{
            position: "fixed",
            right: 20,
            bottom: erro ? 84 : 20,
            background: "#fffbeb",
            color: "#92400e",
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid #fde68a",
          }}
        >
          {avisoGruposHigiene}
        </div>
      ) : null}

      {erro ? (
        <div style={{ position: "fixed", right: 20, bottom: 20, background: "#fee2e2", color: "#991b1b", padding: "12px 16px", borderRadius: 8, border: "1px solid #fecaca" }}>
          {erro}
        </div>
      ) : null}

      {excluirCicloId !== null && (
        <Modal title="⚠️ Confirmar Exclusão" onClose={() => setExcluirCicloId(null)}>
          <div style={{ color: "#374151", marginBottom: "20px", lineHeight: 1.6 }}>
            Deseja realmente excluir o ciclo <strong>"{ciclos?.find((c) => c.id === excluirCicloId)?.nome}"</strong>?
            <br />
            <span style={{ fontSize: "13px", color: "#ef4444" }}>Esta ação não poderá ser desfeita.</span>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button style={styles.secondaryButton} onClick={() => setExcluirCicloId(null)}>
              Cancelar
            </button>
            <button
              style={{ ...styles.primaryButton, backgroundColor: "#ef4444" }}
              onClick={confirmarExclusao}
            >
              Excluir Ciclo
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
