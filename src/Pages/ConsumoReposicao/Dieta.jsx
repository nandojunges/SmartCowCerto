// src/pages/ConsumoReposicao/Dieta.jsx
// ✅ Principal — tabela, totais, modais (Supabase)
// - Carrega dietas do banco ao entrar
// - Editar busca itens em dietas_itens para preencher ModalDieta
// - Excluir remove do banco e recarrega

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { withFazendaId } from "../../lib/fazendaScope";
import { useFazenda } from "../../context/FazendaContext";
import { enqueue, kvGet, kvSet } from "../../offline/localDB";
import ModalDieta from "./ModalDieta";

let MEMO_DIETA = {
  data: null,
  lastAt: 0,
};

const CACHE_DIETA_KEY = "cache:dieta:list";

function dateOnlyToISO(d) {
  if (!d) return new Date().toISOString();
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime()) ? new Date().toISOString() : dt.toISOString();
}

/* helpers simples */
function formatBRL(v) {
  return (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBR(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default function Dieta({ onCountChange }) {
  const { fazendaAtualId } = useFazenda();
  const memoData = MEMO_DIETA.data || {};

  const [dietas, setDietas] = useState(() => memoData.dietas ?? []);
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [sortConfig, setSortConfig] = useState(
    () => memoData.sortConfig ?? { key: null, direction: null }
  );
  const [filtros, setFiltros] = useState(() => memoData.filtros ?? { lote: "__ALL__" });

  // ✅ separa os loadings
  const [loadingLista, setLoadingLista] = useState(() => !memoData.dietas);
  const [atualizandoLista, setAtualizandoLista] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);

  const [erro, setErro] = useState(() => memoData.erro ?? "");

  const [modal, setModal] = useState({ open: false, dieta: null });
  const [excluir, setExcluir] = useState({ open: false, dieta: null });

  const normalizeDietaCache = useCallback((cache) => {
    return Array.isArray(cache) ? cache : [];
  }, []);

  const updateCache = useCallback(async (nextList) => {
    setDietas(nextList);
    await kvSet(CACHE_DIETA_KEY, nextList);
  }, []);

  useEffect(() => {
    const memo = MEMO_DIETA.data;
    if (memo?.dietas === dietas && memo?.sortConfig === sortConfig && memo?.filtros === filtros) {
      return;
    }
    MEMO_DIETA.data = {
      ...(memo || {}),
      dietas,
      sortConfig,
      filtros,
      erro,
    };
    MEMO_DIETA.lastAt = Date.now();
  }, [dietas, sortConfig, filtros, erro]);

  useEffect(() => onCountChange?.(dietas.length), [dietas.length, onCountChange]);

  const loteOptions = useMemo(() => {
    const values = Array.from(new Set((dietas || []).map((d) => d.lote).filter(Boolean))).sort(
      (a, b) => a.localeCompare(b)
    );
    return values;
  }, [dietas]);

  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      if (prev.direction === "desc") return { key: null, direction: null };
      return { key, direction: "asc" };
    });
  };

  const dietasExibidas = useMemo(() => {
    let lista = Array.isArray(dietas) ? [...dietas] : [];

    if (filtros.lote !== "__ALL__") {
      lista = lista.filter((d) => d.lote === filtros.lote);
    }

    if (sortConfig.key) {
      const dir = sortConfig.direction === "desc" ? -1 : 1;
      lista.sort((a, b) => {
        switch (sortConfig.key) {
          case "lote":
            return String(a.lote || "").localeCompare(String(b.lote || "")) * dir;
          case "numVacas":
            return (Number(a.numVacas || 0) - Number(b.numVacas || 0)) * dir;
          case "custoVacaDia":
            return (Number(a.custoVacaDia || 0) - Number(b.custoVacaDia || 0)) * dir;
          case "custoTotal":
            return (Number(a.custoTotal || 0) - Number(b.custoTotal || 0)) * dir;
          case "data":
            return (new Date(a.data).getTime() - new Date(b.data).getTime()) * dir;
          default:
            return 0;
        }
      });
    }

    return lista;
  }, [dietas, filtros, sortConfig]);

  const resumo = useMemo(() => {
    const total = dietasExibidas.length;
    const vacas = dietasExibidas.reduce((acc, d) => acc + Number(d.numVacas || 0), 0);
    const totalCusto = dietasExibidas.reduce((acc, d) => acc + Number(d.custoTotal || 0), 0);
    const custoMedioVaca = vacas ? totalCusto / vacas : 0;
    return { total, totalCusto, custoMedioVaca };
  }, [dietasExibidas]);

  const hasDietas = dietasExibidas.length > 0;

  /** ===================== LOAD DIETAS (BANCO) ===================== */
  const loadDietas = useCallback(async () => {
    const memoFresh = MEMO_DIETA.data && Date.now() - MEMO_DIETA.lastAt < 30000;
    const hasData = Array.isArray(dietas) && dietas.length > 0;

    if (memoFresh && hasData) {
      setLoadingLista(false);
      setAtualizandoLista(false);
      return;
    }

    if (hasData) setAtualizandoLista(true);
    else setLoadingLista(true);

    setErro("");

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const cache = normalizeDietaCache(await kvGet(CACHE_DIETA_KEY));
      setDietas(cache);
      setLoadingLista(false);
      setAtualizandoLista(false);
      return;
    }

    if (!fazendaAtualId) {
      setLoadingLista(false);
      setAtualizandoLista(false);
      setErro("Selecione uma fazenda para carregar as dietas.");
      return;
    }

    const { data, error } = await withFazendaId(
      supabase
        .from("dietas")
        .select(
          `
          id,
          lote_id,
          dia,
          numvacas_snapshot,
          custo_total,
          custo_vaca_dia,
          ativo,
          observacao,
          created_at,
          lotes ( nome )
        `
        ),
      fazendaAtualId
    ).order("dia", { ascending: false });

    if (error) {
      console.error("Erro loadDietas:", error);
      setErro(error?.message || "Erro ao carregar dietas.");
      setLoadingLista(false);
      setAtualizandoLista(false);
      return;
    }

    const list = (data || []).map((r) => ({
      id: r.id,
      lote_id: r.lote_id,
      lote: r?.lotes?.nome || "—",
      numVacas: Number(r.numvacas_snapshot || 0),
      custoTotal: Number(r.custo_total || 0),
      custoVacaDia: Number(r.custo_vaca_dia || 0),
      ativo: r.ativo !== false,
      data: dateOnlyToISO(r.dia),
      dia_db: r.dia,
      observacao: r.observacao || "",
    }));

    await updateCache(list);
    setLoadingLista(false);
    setAtualizandoLista(false);
  }, [dietas, fazendaAtualId, normalizeDietaCache, updateCache]);

  useEffect(() => {
    loadDietas();
  }, [loadDietas]);

  /** ===================== NOVO / EDITAR ===================== */
  const abrirNovo = useCallback(() => {
    // ✅ abre SEM depender do loading da lista
    setModal({
      open: true,
      dieta: {
        id: null,
        lote_id: "",
        lote_nome: "",
        numVacas: 0,
        ingredientes: [{ produto_id: "", quantidade: "" }],
        data: new Date().toISOString(),
        ativo: true,
        observacao: "",
      },
    });
  }, []);

  const abrirEditar = useCallback(
    async (dietaRow) => {
      // ✅ loading só do modal (não trava a lista com overlay)
      setLoadingModal(true);
      setErro("");

      try {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          const ingredientes =
            Array.isArray(dietaRow?.ingredientes) && dietaRow.ingredientes.length
              ? dietaRow.ingredientes
              : null;

          if (!ingredientes) {
            setErro("Sem itens da dieta em cache para edição offline.");
            return;
          }

          setModal({
            open: true,
            dieta: {
              id: dietaRow.id,
              lote_id: dietaRow.lote_id,
              lote_nome: dietaRow.lote,
              numVacas: dietaRow.numVacas,
              data: dietaRow.data,
              ativo: dietaRow.ativo !== false,
              observacao: dietaRow.observacao || "",
              ingredientes,
            },
          });
          return;
        }

        if (!fazendaAtualId) {
          setErro("Selecione uma fazenda para editar dietas.");
          return;
        }

        const { data: itens, error: eItens } = await withFazendaId(
          supabase.from("dietas_itens").select("produto_id, quantidade_kg_vaca"),
          fazendaAtualId
        )
          .eq("dieta_id", dietaRow.id)
          .order("created_at", { ascending: true });

        if (eItens) throw eItens;

        const ingredientes = (itens || []).map((it) => ({
          produto_id: it.produto_id,
          quantidade: String(it.quantidade_kg_vaca ?? ""),
        }));

        setModal({
          open: true,
          dieta: {
            id: dietaRow.id,
            lote_id: dietaRow.lote_id,
            lote_nome: dietaRow.lote,
            numVacas: dietaRow.numVacas,
            data: dietaRow.data,
            ativo: dietaRow.ativo !== false,
            observacao: dietaRow.observacao || "",
            ingredientes: ingredientes.length ? ingredientes : [{ produto_id: "", quantidade: "" }],
          },
        });
      } catch (err) {
        console.error("Erro abrirEditar (itens):", err);
        setErro(err?.message || "Erro ao abrir edição.");
      } finally {
        setLoadingModal(false);
      }
    },
    [fazendaAtualId]
  );

  /** ===================== SALVOU NO MODAL ===================== */
  const salvar = useCallback(
    async (saved) => {
      setModal({ open: false, dieta: null });

      if (saved?.offline) {
        const nextList = (() => {
          const base = Array.isArray(dietas) ? [...dietas] : [];
          const idx = base.findIndex((d) => String(d.id) === String(saved.id));
          if (idx >= 0) base[idx] = { ...base[idx], ...saved };
          else base.push(saved);
          return base.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        })();
        await updateCache(nextList);
        return;
      }

      await loadDietas();
    },
    [dietas, loadDietas, updateCache]
  );

  const toggleAtivo = useCallback(
    async (dieta) => {
      if (!dieta?.id) return;

      const novoValor = !(dieta.ativo !== false);
      const currentList = Array.isArray(dietas) ? dietas : [];
      const nextList = currentList.map((item) =>
        String(item.id) === String(dieta.id) ? { ...item, ativo: novoValor } : item
      );

      setErro("");
      await updateCache(nextList);

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await enqueue("dieta.toggleAtivo", { id: dieta.id, ativo: novoValor });
        return;
      }

      if (!fazendaAtualId) {
        setErro("Selecione uma fazenda para alterar o status da dieta.");
        return;
      }

      const { error } = await withFazendaId(
        supabase.from("dietas").update({ ativo: novoValor }),
        fazendaAtualId
      ).eq("id", dieta.id);

      if (error) {
        console.error("Erro toggleAtivo dieta:", error);
        await updateCache(currentList);
        setErro(error?.message || "Erro ao alterar o status da dieta.");
        await loadDietas();
      }
    },
    [dietas, fazendaAtualId, loadDietas, updateCache]
  );

  /** ===================== EXCLUIR ===================== */
  const pedirExclusao = (dietaRow) => setExcluir({ open: true, dieta: dietaRow });

  const confirmarExclusao = useCallback(async () => {
    const d = excluir.dieta;
    if (!d?.id) {
      setExcluir({ open: false, dieta: null });
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const nextList = (dietas || []).filter((item) => String(item.id) !== String(d.id));
      await updateCache(nextList);
      await enqueue("dieta.delete", { id: d.id });
      setExcluir({ open: false, dieta: null });
      return;
    }

    setLoadingLista(true);
    setErro("");

    try {
      const { error: eItens } = await withFazendaId(
        supabase.from("dietas_itens").delete(),
        fazendaAtualId
      ).eq("dieta_id", d.id);
      if (eItens) throw eItens;

      const { error: eDiet } = await withFazendaId(supabase.from("dietas").delete(), fazendaAtualId)
        .eq("id", d.id);
      if (eDiet) throw eDiet;

      setExcluir({ open: false, dieta: null });
      await loadDietas();
    } catch (err) {
      console.error("Erro excluir dieta:", err);
      setErro(err?.message || "Erro ao excluir dieta.");
      setExcluir({ open: false, dieta: null });
    } finally {
      setLoadingLista(false);
    }
  }, [dietas, excluir.dieta, fazendaAtualId, loadDietas, updateCache]);

  // Estilos inline modernos
  const styles = {
    page: {
      width: "100%",
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      padding: "24px",
      boxSizing: "border-box",
    },
    container: {
      maxWidth: "1400px",
      margin: "0 auto",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "24px",
    },
    titleGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    title: {
      fontSize: "24px",
      fontWeight: 700,
      color: "#0f172a",
      margin: 0,
      letterSpacing: "-0.025em",
    },
    subtitle: {
      fontSize: "14px",
      color: "#64748b",
      margin: 0,
    },
    headerActions: {
      display: "flex",
      gap: "12px",
    },
    primaryButton: {
      padding: "10px 20px",
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      border: "none",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 1px 3px 0 rgba(59, 130, 246, 0.3)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    secondaryButton: {
      padding: "10px 20px",
      backgroundColor: "#ffffff",
      color: "#374151",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s ease",
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
    filterGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
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
      backgroundColor: "#ffffff",
      cursor: "pointer",
      minWidth: "180px",
      outline: "none",
    },
    tableContainer: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      overflow: "hidden",
      position: "relative",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "14px",
    },
    thead: {
      backgroundColor: "#f8fafc",
      borderBottom: "2px solid #e2e8f0",
    },
    th: {
      padding: "16px 20px",
      textAlign: "left",
      fontSize: "12px",
      fontWeight: 700,
      color: "#475569",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      whiteSpace: "nowrap",
      userSelect: "none",
    },
    thSortable: {
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    td: {
      padding: "16px 20px",
      color: "#334155",
      borderBottom: "1px solid #f1f5f9",
      verticalAlign: "middle",
    },
    tr: {
      transition: "background-color 0.15s ease",
    },
    trHover: {
      backgroundColor: "#f8fafc",
    },
    tdCenter: {
      textAlign: "center",
    },
    loteBadge: {
      display: "inline-flex",
      padding: "6px 12px",
      backgroundColor: "#eff6ff",
      color: "#1e40af",
      borderRadius: "8px",
      fontSize: "13px",
      fontWeight: 600,
    },
    loteBadgeInativo: {
      backgroundColor: "#fef3c7",
      color: "#92400e",
    },
    numVacas: {
      fontFamily: "monospace",
      fontSize: "14px",
      fontWeight: 600,
      color: "#0f172a",
      backgroundColor: "#f1f5f9",
      padding: "4px 8px",
      borderRadius: "6px",
      display: "inline-block",
    },
    currency: {
      fontFamily: "monospace",
      fontSize: "14px",
      fontWeight: 600,
      color: "#059669",
    },
    currencyTotal: {
      fontFamily: "monospace",
      fontSize: "14px",
      fontWeight: 700,
      color: "#0f172a",
    },
    date: {
      fontSize: "13px",
      color: "#64748b",
      fontWeight: 500,
    },
    actionButtons: {
      display: "flex",
      gap: "8px",
      justifyContent: "center",
    },
    iconButton: {
      padding: "8px",
      backgroundColor: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "36px",
      height: "36px",
    },
    iconButtonDanger: {
      color: "#ef4444",
    },
    iconButtonToggleInativo: {
      backgroundColor: "#fff7ed",
      color: "#9a3412",
      borderColor: "#fed7aa",
    },
    footer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 24px",
      backgroundColor: "#f8fafc",
      borderTop: "1px solid #e2e8f0",
    },
    footerStats: {
      display: "flex",
      gap: "24px",
      fontSize: "14px",
      color: "#64748b",
    },
    statItem: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    statValue: {
      fontWeight: 700,
      color: "#0f172a",
    },
    statValueSuccess: {
      color: "#059669",
    },
    alert: {
      padding: "12px 16px",
      borderRadius: "8px",
      marginBottom: "20px",
      fontSize: "14px",
      backgroundColor: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #fecaca",
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    emptyState: {
      padding: "48px",
      textAlign: "center",
      color: "#64748b",
    },
  };

  return (
    <section style={styles.page}>
      <div style={styles.container}>
        {/* Header Moderno */}
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <h1 style={styles.title}>Gerenciamento de Dietas</h1>
            <p style={styles.subtitle}>Planeje e acompanhe as dietas dos lotes</p>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.secondaryButton} onClick={loadDietas} disabled={atualizandoLista}>
              {atualizandoLista ? "Atualizando..." : "↻ Atualizar"}
            </button>

            {/* ✅ não bloqueia abrir modal por loading da lista */}
            <button style={styles.primaryButton} onClick={abrirNovo}>
              <span>+</span>
              <span>Nova Dieta</span>
            </button>
          </div>
        </div>

        {/* Alerta de erro */}
        {erro && (
          <div style={styles.alert}>
            <strong>Erro:</strong> {erro}
          </div>
        )}

        {/* Filtros */}
        <div style={styles.filtersBar}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Filtrar por Lote</label>
            <select
              style={styles.select}
              value={filtros.lote}
              onChange={(e) => setFiltros((prev) => ({ ...prev, lote: e.target.value }))}
            >
              <option value="__ALL__">Todos os lotes</option>
              {loteOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela Moderna */}
        <div style={styles.tableContainer}>
          {loadingLista && !hasDietas && (
            <div style={styles.loadingOverlay}>
              <div>Carregando dietas...</div>
            </div>
          )}

          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>
                  <div style={styles.thSortable} onClick={() => toggleSort("lote")}>
                    <span>Lote</span>
                    {sortConfig.key === "lote" && (
                      <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>

                <th style={{ ...styles.th, textAlign: "center" }}>
                  <div
                    style={{ ...styles.thSortable, justifyContent: "center" }}
                    onClick={() => toggleSort("numVacas")}
                  >
                    <span>Nº de Vacas</span>
                    {sortConfig.key === "numVacas" && (
                      <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>

                <th style={{ ...styles.th, textAlign: "right" }}>
                  <div
                    style={{ ...styles.thSortable, justifyContent: "flex-end" }}
                    onClick={() => toggleSort("custoVacaDia")}
                  >
                    <span>Custo Vaca/dia</span>
                    {sortConfig.key === "custoVacaDia" && (
                      <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>

                <th style={{ ...styles.th, textAlign: "right" }}>
                  <div
                    style={{ ...styles.thSortable, justifyContent: "flex-end" }}
                    onClick={() => toggleSort("custoTotal")}
                  >
                    <span>Custo Total</span>
                    {sortConfig.key === "custoTotal" && (
                      <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>

                <th style={{ ...styles.th, textAlign: "right" }}>
                  <span>Custo Vaca/mês</span>
                </th>

                <th style={{ ...styles.th, textAlign: "center" }}>
                  <div
                    style={{ ...styles.thSortable, justifyContent: "center" }}
                    onClick={() => toggleSort("data")}
                  >
                    <span>Data</span>
                    {sortConfig.key === "data" && (
                      <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>

                <th style={{ ...styles.th, textAlign: "center" }}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {!loadingLista && dietasExibidas.length === 0 ? (
                <tr>
                  <td colSpan={7} style={styles.emptyState}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🥗</div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: "8px",
                      }}
                    >
                      Nenhuma dieta encontrada
                    </div>
                    <div style={{ fontSize: "14px" }}>
                      {dietas.length === 0
                        ? "Cadastre sua primeira dieta para começar"
                        : "Tente ajustar os filtros para ver mais resultados"}
                    </div>
                  </td>
                </tr>
              ) : (
                dietasExibidas.map((dieta) => {
                  const rowId = dieta.id;
                  const isHovered = hoveredRowId === rowId;

                  return (
                    <tr
                      key={rowId}
                      style={{
                        ...styles.tr,
                        ...(isHovered ? styles.trHover : {}),
                      }}
                      onMouseEnter={() => setHoveredRowId(rowId)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.loteBadge,
                            ...(dieta.ativo === false ? styles.loteBadgeInativo : {}),
                          }}
                        >
                          {dieta.lote}
                          {dieta.ativo === false ? " (Pausada)" : ""}
                        </span>
                      </td>

                      <td style={{ ...styles.td, ...styles.tdCenter }}>
                        <span style={styles.numVacas}>{dieta.numVacas}</span>
                      </td>

                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <span style={styles.currency}>{formatBRL(dieta.custoVacaDia)}</span>
                      </td>

                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <span style={styles.currencyTotal}>{formatBRL(dieta.custoTotal)}</span>
                      </td>

                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <span style={{ ...styles.currency, opacity: 0.8 }}>
                          {formatBRL(Number(dieta.custoVacaDia || 0) * 30)}
                        </span>
                      </td>

                      <td style={{ ...styles.td, ...styles.tdCenter }}>
                        <span style={styles.date}>{formatDateBR(dieta.data)}</span>
                      </td>

                      <td style={{ ...styles.td, ...styles.tdCenter }}>
                        <div style={styles.actionButtons}>
                          <button
                            style={{
                              ...styles.iconButton,
                              ...(dieta.ativo === false ? styles.iconButtonToggleInativo : {}),
                            }}
                            onClick={() => toggleAtivo(dieta)}
                            title={dieta.ativo === false ? "Ativar dieta" : "Pausar dieta"}
                            disabled={loadingModal}
                          >
                            {dieta.ativo === false ? "▶️" : "⏸"}
                          </button>

                          <button
                            style={styles.iconButton}
                            onClick={() => abrirEditar(dieta)}
                            title="Editar"
                            disabled={loadingModal}
                          >
                            {loadingModal ? "…" : "✏️"}
                          </button>

                          <button
                            style={{ ...styles.iconButton, ...styles.iconButtonDanger }}
                            onClick={() => pedirExclusao(dieta)}
                            title="Excluir"
                            disabled={loadingModal}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Footer com estatísticas */}
          {hasDietas && (
            <div style={styles.footer}>
              <div style={styles.footerStats}>
                <div style={styles.statItem}>
                  <span>Total de dietas:</span>
                  <span style={styles.statValue}>{resumo.total}</span>
                </div>
                <div style={styles.statItem}>
                  <span>Custo total:</span>
                  <span style={{ ...styles.statValue, ...styles.statValueSuccess }}>
                    {formatBRL(resumo.totalCusto)}
                  </span>
                </div>
                <div style={styles.statItem}>
                  <span>Custo médio/vaca:</span>
                  <span style={styles.statValue}>{formatBRL(resumo.custoMedioVaca)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Modal abre independente do loading da lista */}
      {modal.open && (
        <ModalDieta
          value={modal.dieta}
          onCancel={() => setModal({ open: false, dieta: null })}
          onSave={salvar}
        />
      )}

      {excluir.open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: 14,
          }}
          onMouseDown={() => setExcluir({ open: false, dieta: null })}
        >
          <div
            style={{
              width: 520,
              maxWidth: "96vw",
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 18px 55px rgba(0,0,0,0.35)",
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: "#0f172a" }}>
              Confirmar exclusão
            </div>

            <div style={{ color: "#64748b", marginBottom: 24, lineHeight: 1.5 }}>
              Deseja excluir a dieta do lote <strong>"{excluir.dieta?.lote || "—"}"</strong> na data{" "}
              <strong>{formatDateBR(excluir.dieta?.data)}</strong>?
              <br />
              <span style={{ fontSize: 13, color: "#ef4444" }}>Esta ação não pode ser desfeita.</span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onClick={() => setExcluir({ open: false, dieta: null })}
              >
                Cancelar
              </button>

              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={confirmarExclusao}
              >
                Excluir Dieta
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
