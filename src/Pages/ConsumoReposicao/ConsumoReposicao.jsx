// src/Pages/ConsumoReposicao/ConsumoReposicao.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Subpáginas reais do teu sistema
import Estoque from "./Estoque";
import Dieta from "./Dieta";
import Lotes from "./Lotes";
import Limpeza from "./Limpeza";
import CalendarioSanitario from "./CalendarioSanitario";

// ✅ Modal de cadastro/edição de produto
import ModalNovoProduto from "./ModalNovoProduto";

// ✅ Supabase + escopo de fazenda (padrão do teu sistema)
import { supabase } from "../../lib/supabaseClient";
import { useFazenda } from "../../context/FazendaContext";

const LS_LAST_TAB = "consumo:subabas:last";

/* ========================= Helpers ========================= */
function toNumber(v, fallback = 0) {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

function pick(obj, ...keys) {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return undefined;
}

/* ========================= Tabs Modernas ========================= */
function ModernTabs({ selected, setSelected, contadores }) {
  const tabs = useMemo(
    () => [
      { id: "estoque", label: "Estoque", icon: "📦" },
      { id: "lotes", label: "Lotes", icon: "🏷️" },
      { id: "dieta", label: "Dietas", icon: "🌾" },
      { id: "limpeza", label: "Limpeza", icon: "🧹" },
      { id: "calendario", label: "Calendário Sanitário", icon: "📅" },
    ],
    []
  );

  const onKey = useCallback(
    (e) => {
      const idx = tabs.findIndex((t) => t.id === selected);
      if (idx === -1) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelected(tabs[(idx + 1) % tabs.length].id);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelected(tabs[(idx - 1 + tabs.length) % tabs.length].id);
      }
    },
    [selected, setSelected, tabs]
  );

  return (
    <div style={styles.tabsContainer} role="tablist" aria-label="Sub-abas de consumo e reposição" onKeyDown={onKey}>
      <div style={styles.tabsWrapper}>
        {tabs.map((t) => {
          const active = selected === t.id;
          const count = contadores?.[t.id];

          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              aria-controls={`pane-${t.id}`}
              onClick={() => setSelected(t.id)}
              tabIndex={active ? 0 : -1}
              style={{
                ...styles.tab,
                ...(active ? styles.tabActive : styles.tabInactive),
              }}
            >
              <span style={styles.tabIcon}>{t.icon}</span>
              <span style={styles.tabLabel}>{t.label}</span>

              {count !== null && count !== undefined && (
                <span style={{ ...styles.badge, ...(active ? styles.badgeActive : styles.badgeInactive) }}>
                  {count}
                </span>
              )}

              {active && <div style={styles.activeIndicator} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ========================= Tabela Estoque (real) ========================= */
function TabelaEstoque({
  produtos,
  carregando,
  erro,
  busca,
  setBusca,
  categoria,
  setCategoria,
  categoriasDisponiveis,
  onNovoProduto,
  onEditarProduto,
  onExcluirProduto,
}) {
  const produtosFiltrados = useMemo(() => {
    const b = (busca || "").toLowerCase().trim();
    return (produtos || []).filter((p) => {
      const okBusca =
        !b ||
        String(p.nome || "").toLowerCase().includes(b) ||
        String(p.categoria || "").toLowerCase().includes(b);

      const okCat = categoria === "Todos" ? true : p.categoria === categoria;
      return okBusca && okCat;
    });
  }, [produtos, busca, categoria]);

  const formatNumber = (num) => {
    if (num === "—") return "—";
    const n = toNumber(num, 0);
    return n.toLocaleString("pt-BR");
  };

  return (
    <div style={styles.tableContainer}>
      <div style={styles.tableHeader}>
        <div>
          <h2 style={styles.tableTitle}>Gerenciamento de Estoque</h2>
          <p style={styles.tableSubtitle}>Visualize e gerencie todos os produtos do seu estoque</p>
        </div>

        <div style={styles.headerActions}>
          <button type="button" style={styles.secondaryButton}>
            Ajustes
          </button>

          <button type="button" style={styles.primaryButton} onClick={onNovoProduto}>
            + Novo Produto
          </button>
        </div>
      </div>

      <div style={styles.filtersBar}>
        <input
          type="text"
          placeholder="Buscar produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={styles.searchInput}
        />

        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={styles.filterSelect}>
          <option value="Todos">Todos</option>
          {categoriasDisponiveis.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {erro ? (
        <div style={{ padding: 16, color: "#b91c1c", background: "#fee2e2", borderRadius: 12, marginBottom: 16 }}>
          {erro}
        </div>
      ) : null}

      {carregando ? <div style={{ padding: 16, color: "#64748b" }}>Carregando estoque...</div> : null}

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={{ ...styles.th, width: "22%" }}>Nome Comercial</th>
              <th style={styles.th}>Categoria</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Comprado</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Em estoque</th>
              <th style={styles.th}>Unid.</th>
              <th style={styles.th}>Validade</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Consumo/dia</th>
              <th style={styles.th}>Prev. término</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Alerta Est.</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Alerta Val.</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Ação</th>
            </tr>
          </thead>

          <tbody>
            {produtosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ ...styles.td, color: "#64748b" }}>
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : (
              produtosFiltrados.map((prod) => (
                <tr key={prod.id} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: 600, color: "#1e293b" }}>{prod.nome}</td>

                  <td style={styles.td}>
                    <span style={{ ...styles.categoryBadge, backgroundColor: "#eef2ff", color: "#1e40af" }}>
                      {prod.categoria || "—"}
                    </span>
                  </td>

                  <td style={{ ...styles.td, textAlign: "right", fontFamily: "monospace", fontSize: "0.9em" }}>
                    {formatNumber(prod.comprado)}
                  </td>

                  <td
                    style={{
                      ...styles.td,
                      textAlign: "right",
                      fontFamily: "monospace",
                      fontSize: "0.9em",
                      fontWeight: 600,
                    }}
                  >
                    {formatNumber(prod.estoque)}
                  </td>

                  <td style={styles.td}>
                    <span style={styles.unitBadge}>{prod.unidade || "—"}</span>
                  </td>

                  <td style={styles.td}>{prod.validade || "—"}</td>

                  <td style={{ ...styles.td, textAlign: "right", color: "#64748b" }}>{prod.consumo || "—"}</td>

                  <td style={{ ...styles.td, color: "#64748b" }}>{prod.prevTermino || "—"}</td>

                  <td style={{ ...styles.td, textAlign: "center" }}>
                    <span style={{ ...styles.statusBadge, backgroundColor: "#dcfce7", color: "#166534" }}>
                      ✓ {prod.alertaEstoque || "OK"}
                    </span>
                  </td>

                  <td style={{ ...styles.td, textAlign: "center" }}>
                    <span style={{ ...styles.statusBadge, backgroundColor: "#dcfce7", color: "#166534" }}>✓ OK</span>
                  </td>

                  <td style={{ ...styles.td, textAlign: "center" }}>
                    <div style={styles.actionButtons}>
                      <button type="button" style={styles.iconButton} title="Editar" onClick={() => onEditarProduto(prod)}>
                        ✏️
                      </button>

                      <button
                        type="button"
                        style={{ ...styles.iconButton, color: "#ef4444" }}
                        title="Excluir"
                        onClick={() => onExcluirProduto(prod)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.tableFooter}>
        <div style={styles.footerStats}>
          <span style={styles.statItem}>
            <strong>Total de itens:</strong> {produtosFiltrados.length}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ========================= Página Principal ========================= */
export default function ConsumoReposicao() {
  const { fazendaAtualId } = useFazenda();

  const [tab, setTab] = useState(() => {
    try {
      return localStorage.getItem(LS_LAST_TAB) || "estoque";
    } catch {
      return "estoque";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_LAST_TAB, tab);
    } catch {}
  }, [tab]);

  // ✅ Estoque (real)
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // ✅ Modal
  const [modalNovoProdutoOpen, setModalNovoProdutoOpen] = useState(false);
  const [editando, setEditando] = useState(null); // raw row do banco (estoque_produtos)

  // ✅ evita injetar CSS repetido
  const injectedRef = useRef(false);
  useEffect(() => {
    if (injectedRef.current) return;
    injectedRef.current = true;

    const hoverStyles = `
      tr:hover td { background-color: #f8fafc; }
      button:hover { opacity: 0.95; transform: translateY(-1px); }
      button:active { transform: translateY(0); }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = hoverStyles;
    document.head.appendChild(styleSheet);

    return () => {
      if (styleSheet?.parentNode) styleSheet.parentNode.removeChild(styleSheet);
    };
  }, []);

  // ✅ Buscar produtos do banco (tabela nova)
  const carregarProdutos = useCallback(async () => {
    if (!fazendaAtualId) return;

    setCarregando(true);
    setErro("");

    try {
      const { data, error } = await supabase
        .from("estoque_produtos")
        .select(
          [
            "id",
            "fazenda_id",
            "nome_comercial",
            "categoria",
            "sub_tipo",
            "forma_compra",
            "tipo_embalagem",
            "tamanho_por_embalagem",
            "unidade_medida",
            "reutilizavel",
            "usos_por_unidade",
            // ✅ nomes corretos do teu schema novo:
            "carencia_leite",
            "carencia_carne",
            "sem_carencia_leite",
            "sem_carencia_carne",
            "ativo",
            "created_at",
            "updated_at",
          ].join(",")
        )
        .eq("fazenda_id", fazendaAtualId)
        .order("nome_comercial", { ascending: true });

      if (error) throw error;

      const { data: lotesData, error: lotesError } = await supabase
        .from("estoque_lotes")
        .select(["id", "produto_id", "validade", "quantidade_atual", "quantidade_inicial", "ativo"].join(","))
        .eq("fazenda_id", fazendaAtualId)
        .eq("ativo", true);

      if (lotesError) throw lotesError;

      const estoquePorProduto = {};
      const compradoPorProduto = {};
      const validadePorProduto = {};
      const hoje = new Date().toISOString().slice(0, 10);

      for (const lote of lotesData || []) {
        const produtoId = lote.produto_id;
        if (!produtoId) continue;

        const qtdAtual = toNumber(lote.quantidade_atual, 0);
        const qtdInicial = toNumber(lote.quantidade_inicial, 0);

        estoquePorProduto[produtoId] = toNumber(estoquePorProduto[produtoId], 0) + qtdAtual;
        compradoPorProduto[produtoId] = toNumber(compradoPorProduto[produtoId], 0) + qtdInicial;

        if (lote.validade) {
          const validade = String(lote.validade).slice(0, 10);
          if (validade >= hoje) {
            if (!validadePorProduto[produtoId] || validade < validadePorProduto[produtoId]) {
              validadePorProduto[produtoId] = validade;
            }
          }
        }
      }

      const adaptados = (data || []).map((row) => {
        return {
          id: row.id,
          nome: row.nome_comercial ?? "—",
          categoria: row.categoria ?? "—",
          unidade: row.unidade_medida ?? "—",

          comprado: toNumber(compradoPorProduto[row.id], 0),
          estoque: toNumber(estoquePorProduto[row.id], 0),
          validade: validadePorProduto[row.id] || "—",
          consumo: "—",
          prevTermino: "—",
          alertaEstoque: "OK",

          _raw: row,
        };
      });

      setProdutos(adaptados);
    } catch (e) {
      setErro(e?.message || "Erro ao carregar estoque");
    } finally {
      setCarregando(false);
    }
  }, [fazendaAtualId]);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  const categoriasDisponiveis = useMemo(() => {
    const set = new Set();
    for (const p of produtos) {
      if (p?.categoria && p.categoria !== "—") set.add(p.categoria);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [produtos]);

  // Contadores nas abas
  const counts = useMemo(
    () => ({
      estoque: produtos.length,
      lotes: null,
      dieta: null,
      limpeza: null,
      calendario: null,
    }),
    [produtos.length]
  );

  // ✅ Abrir/Fechar modal
  const abrirNovoProduto = useCallback(() => {
    setErro("");
    setEditando(null);
    setModalNovoProdutoOpen(true);
  }, []);

  const fecharNovoProduto = useCallback(() => {
    setErro("");
    setModalNovoProdutoOpen(false);
    setEditando(null);
  }, []);

  const editarProduto = useCallback((prod) => {
    setErro("");
    setEditando(prod?._raw || null);
    setModalNovoProdutoOpen(true);
  }, []);

  // ✅ Excluir produto
  const excluirProduto = useCallback(
    async (prod) => {
      if (!prod?.id) return;
      const ok = window.confirm(`Excluir "${prod.nome}"?`);
      if (!ok) return;

      try {
        setErro("");
        const { error } = await supabase
          .from("estoque_produtos")
          .delete()
          .eq("id", prod.id)
          .eq("fazenda_id", fazendaAtualId);

        if (error) throw error;

        setProdutos((prev) => prev.filter((p) => p.id !== prod.id));
      } catch (e) {
        setErro(e?.message || "Erro ao excluir produto");
      }
    },
    [fazendaAtualId]
  );

  /**
   * ✅ SALVAR NO BANCO (insert/update)
   * ModalNovoProduto envia SOMENTE o catálogo (estoque_produtos) em snake_case.
   * IMPORTANTE: o Modal não manda id; então aqui usamos editando?.id para update.
   */
  const onSavedProduto = useCallback(
    async (produtoIn) => {
      if (!fazendaAtualId) return;

      try {
        setErro("");

        const idEdicao = editando?.id ?? null;

        const produtoPayload = produtoIn?.produto ? produtoIn.produto : produtoIn;
        const entradaOpcional = produtoIn?.produto ? produtoIn.entradaOpcional : null;

        const nome = pick(produtoPayload, "nome_comercial", "nomeComercial");
        const categoriaProduto = pick(produtoPayload, "categoria");
        const sub_tipo = pick(produtoPayload, "sub_tipo", "subTipo");
        const forma_compra = pick(produtoPayload, "forma_compra", "formaCompra");
        const tipo_embalagem = pick(produtoPayload, "tipo_embalagem", "tipoEmbalagem");
        const tamanho_por_embalagem = pick(produtoPayload, "tamanho_por_embalagem", "tamanhoPorEmbalagem");
        const unidade_medida = pick(produtoPayload, "unidade_medida", "unidadeMedida");
        const reutilizavel = !!pick(produtoPayload, "reutilizavel");
        const usos_por_unidade = pick(produtoPayload, "usos_por_unidade", "usosPorUnidade");
        const carencia_leite = pick(produtoPayload, "carencia_leite", "carenciaLeiteDias", "carenciaLeite");
        const carencia_carne = pick(produtoPayload, "carencia_carne", "carenciaCarneDias", "carenciaCarne");
        const sem_carencia_leite = !!pick(produtoPayload, "sem_carencia_leite", "semCarenciaLeite");
        const sem_carencia_carne = !!pick(produtoPayload, "sem_carencia_carne", "semCarenciaCarne");
        const ativo = pick(produtoPayload, "ativo") === false ? false : true;

        // ✅ row pronto (tabela nova) - sempre snake_case
        const row = {
          fazenda_id: fazendaAtualId,

          nome_comercial: String(nome || "").trim(),
          categoria: String(categoriaProduto || "").trim(),
          sub_tipo: sub_tipo ?? null,

          forma_compra: forma_compra ?? null,
          tipo_embalagem: tipo_embalagem ?? null,
          tamanho_por_embalagem:
            tamanho_por_embalagem === null || tamanho_por_embalagem === undefined
              ? null
              : Number(tamanho_por_embalagem) > 0
              ? Number(tamanho_por_embalagem)
              : null,

          unidade_medida: unidade_medida ?? null,

          reutilizavel,
          usos_por_unidade:
            usos_por_unidade === null || usos_por_unidade === undefined
              ? null
              : Number(usos_por_unidade) >= 2
              ? Number(usos_por_unidade)
              : null,

          // ✅ schema novo: carencia_leite / carencia_carne (não _dias)
          carencia_leite:
            carencia_leite === null || carencia_leite === undefined
              ? null
              : Number(carencia_leite),
          carencia_carne:
            carencia_carne === null || carencia_carne === undefined
              ? null
              : Number(carencia_carne),

          sem_carencia_leite,
          sem_carencia_carne,

          ativo,
        };

        if (!String(row.nome_comercial || "").trim()) throw new Error("Nome do produto é obrigatório.");
        if (!String(row.categoria || "").trim()) throw new Error("Categoria do produto é obrigatória.");

        if (idEdicao) {
          const { data, error } = await supabase
            .from("estoque_produtos")
            .update(row)
            .eq("id", idEdicao)
            .eq("fazenda_id", fazendaAtualId)
            .select("*")
            .single();

          if (error) throw error;

        } else {
          const { data, error } = await supabase.from("estoque_produtos").insert(row).select("*").single();
          if (error) throw error;

          const quantidadeEntrada = toNumber(entradaOpcional?.quantidade, 0);
          const valorTotalEntrada = toNumber(entradaOpcional?.valor_total, 0);
          const temEntrada =
            quantidadeEntrada > 0 || valorTotalEntrada > 0 || !!entradaOpcional?.validade || !!entradaOpcional?.data_compra;

          if (temEntrada && quantidadeEntrada > 0) {
            const unidadeLote = entradaOpcional?.unidade || row.unidade_medida || null;
            const { data: loteData, error: loteError } = await supabase
              .from("estoque_lotes")
              .insert({
                fazenda_id: fazendaAtualId,
                produto_id: data.id,
                validade: entradaOpcional?.validade || null,
                unidade_medida: unidadeLote,
                quantidade_inicial: quantidadeEntrada,
                quantidade_atual: quantidadeEntrada,
                ativo: true,
                observacao: "Entrada inicial via cadastro do produto",
              })
              .select("*")
              .single();

            if (loteError) throw loteError;

            const valorTotalFinal = valorTotalEntrada > 0 ? valorTotalEntrada : null;
            const valorUnitario =
              valorTotalFinal && quantidadeEntrada > 0 ? Number((valorTotalFinal / quantidadeEntrada).toFixed(6)) : null;
            const dataMovimento = entradaOpcional?.data_compra || new Date().toISOString().slice(0, 10);

            const { error: movimentoError } = await supabase.from("estoque_movimentos").insert({
              fazenda_id: fazendaAtualId,
              produto_id: data.id,
              lote_id: loteData.id,
              tipo: "ENTRADA",
              data_movimento: dataMovimento,
              quantidade: quantidadeEntrada,
              valor_total: valorTotalFinal,
              valor_unitario: valorUnitario,
              observacao: "Entrada inicial via cadastro do produto",
            });

            if (movimentoError) throw movimentoError;
          }
        }

        await carregarProdutos();
        setModalNovoProdutoOpen(false);
        setEditando(null);
      } catch (e) {
        setErro(e?.message || "Erro ao salvar produto");
      }
    },
    [fazendaAtualId, editando, carregarProdutos]
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <ModernTabs selected={tab} setSelected={setTab} contadores={counts} />

        <div style={styles.content}>
          {tab === "estoque" && (
            <div id="pane-estoque" role="tabpanel" aria-labelledby="estoque">
              <TabelaEstoque
                produtos={produtos}
                carregando={carregando}
                erro={erro}
                busca={busca}
                setBusca={setBusca}
                categoria={categoria}
                setCategoria={setCategoria}
                categoriasDisponiveis={categoriasDisponiveis}
                onNovoProduto={abrirNovoProduto}
                onEditarProduto={editarProduto}
                onExcluirProduto={excluirProduto}
              />

              <ModalNovoProduto
                open={modalNovoProdutoOpen}
                onClose={fecharNovoProduto}
                onSaved={onSavedProduto}
                initial={editando}
              />
            </div>
          )}

          {tab === "lotes" && (
            <div id="pane-lotes" role="tabpanel" aria-labelledby="lotes">
              <Lotes />
            </div>
          )}

          {tab === "dieta" && (
            <div id="pane-dieta" role="tabpanel" aria-labelledby="dieta">
              <Dieta />
            </div>
          )}

          {tab === "limpeza" && (
            <div id="pane-limpeza" role="tabpanel" aria-labelledby="limpeza">
              <Limpeza />
            </div>
          )}

          {tab === "calendario" && (
            <div id="pane-calendario" role="tabpanel" aria-labelledby="calendario">
              <CalendarioSanitario />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========================= Estilos ========================= */
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: "24px",
    boxSizing: "border-box",
  },
  container: { maxWidth: "1400px", margin: "0 auto" },

  tabsContainer: { marginBottom: "24px", position: "relative" },
  tabsWrapper: {
    display: "flex",
    gap: "4px",
    backgroundColor: "#f1f5f9",
    padding: "4px",
    borderRadius: "12px",
    width: "fit-content",
    border: "1px solid #e2e8f0",
  },
  tab: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
    background: "transparent",
  },
  tabInactive: { backgroundColor: "transparent", color: "#64748b" },
  tabActive: {
    backgroundColor: "#ffffff",
    color: "#0f172a",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  },
  tabIcon: { fontSize: "16px" },
  tabLabel: { fontSize: "14px" },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "20px",
    height: "20px",
    padding: "0 6px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: 600,
  },
  badgeInactive: { backgroundColor: "#e2e8f0", color: "#64748b" },
  badgeActive: { backgroundColor: "#3b82f6", color: "#ffffff" },
  activeIndicator: {
    position: "absolute",
    bottom: "-4px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    backgroundColor: "#3b82f6",
  },

  content: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
  },

  tableContainer: { padding: "24px" },
  tableHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
  tableTitle: { fontSize: "20px", fontWeight: 600, color: "#0f172a", margin: "0 0 4px 0" },
  tableSubtitle: { fontSize: "14px", color: "#64748b", margin: 0 },
  headerActions: { display: "flex", gap: "12px" },
  primaryButton: {
    padding: "10px 16px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  },
  secondaryButton: {
    padding: "10px 16px",
    backgroundColor: "#ffffff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  },

  filtersBar: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  searchInput: {
    flex: 1,
    maxWidth: "300px",
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  filterSelect: {
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    cursor: "pointer",
  },

  tableWrapper: { overflowX: "auto", borderRadius: "12px", border: "1px solid #e2e8f0" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "14px" },
  theadRow: { backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: 600,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
  },
  tr: { transition: "background-color 0.15s", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "16px", color: "#334155", borderBottom: "1px solid #e2e8f0", verticalAlign: "middle" },

  categoryBadge: { display: "inline-flex", padding: "4px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 500 },
  unitBadge: {
    display: "inline-flex",
    padding: "2px 8px",
    backgroundColor: "#f1f5f9",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: 500,
    color: "#64748b",
    border: "1px solid #e2e8f0",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
  },

  actionButtons: { display: "flex", gap: "8px", justifyContent: "center" },
  iconButton: {
    padding: "6px",
    backgroundColor: "transparent",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
  },

  tableFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "24px",
    paddingTop: "24px",
    borderTop: "1px solid #e2e8f0",
  },
  footerStats: { display: "flex", alignItems: "center", gap: "16px", fontSize: "14px", color: "#64748b" },
  statItem: { display: "flex", gap: "4px" },
};
