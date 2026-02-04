// src/pages/ConsumoReposicao/Estoque.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import Select from "react-select";
import { supabase } from "../../lib/supabaseClient";
import { withFazendaId } from "../../lib/fazendaScope";
import { useFazenda } from "../../context/FazendaContext";
import { enqueue, kvGet, kvSet } from "../../offline/localDB";

import "../../styles/tabelaModerna.css";
import "../../styles/botoes.css";

import ModalAjustesEstoque from "./ModalAjustesEstoque";
import ModalNovoProduto from "./ModalNovoProduto";

let MEMO_ESTOQUE = {
  data: null,
  lastAt: 0,
};

/* ===================== CACHE KEY (único) ===================== */
const CACHE_ESTOQUE_KEY = "cache:estoque:list";

/** ✅ Invalida o cache/memo do Estoque (usar após deletes/resets/ações críticas) */
async function invalidarCacheEstoque() {
  MEMO_ESTOQUE = { data: null, lastAt: 0 };
  await kvSet(CACHE_ESTOQUE_KEY, null);
}

/* ===================== MODAL BASE (somente para excluir) ===================== */
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalCard = {
  background: "#fff",
  borderRadius: "1rem",
  width: "620px",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  fontFamily: "Poppins, sans-serif",
  overflow: "hidden",
};

const modalHeader = {
  background: "#1e40af",
  color: "#fff",
  padding: "1rem 1.2rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

/* ===================== REACT-SELECT (compacto) ===================== */
const rsStylesCompact = {
  container: (base) => ({ ...base, width: 240, minWidth: 240 }),
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    height: 38,
    borderRadius: 10,
    borderColor: state.isFocused ? "#2563eb" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : "none",
    ":hover": { borderColor: "#2563eb" },
    fontSize: 14,
  }),
  valueContainer: (base) => ({ ...base, padding: "0 10px" }),
  indicatorsContainer: (base) => ({ ...base, height: 38 }),
  menuPortal: (base) => ({ ...base, zIndex: 100000 }),
  menu: (base) => ({ ...base, zIndex: 100000 }),
};

function normalizeEstoqueCache(cache) {
  return Array.isArray(cache) ? cache : [];
}

function generateLocalId() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {}
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function sortProdutosByNome(list) {
  return [...(Array.isArray(list) ? list : [])].sort((a, b) =>
    String(a.nomeComercial || "").localeCompare(String(b.nomeComercial || ""))
  );
}

function toDateOnly(v) {
  if (!v) return null;
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function safeNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/* ===================== ENUMS (schema Supabase) ===================== */
const FORMA_COMPRA_ENUM = {
  EMBALADO: "EMBALADO",
  A_GRANEL: "A_GRANEL",
};

function normalizeFormaCompra(input, produtoUi) {
  const raw = String(input || "").trim();
  const up = raw.toUpperCase();

  // aceita já no formato do enum
  if (up === FORMA_COMPRA_ENUM.EMBALADO) return FORMA_COMPRA_ENUM.EMBALADO;
  if (up === FORMA_COMPRA_ENUM.A_GRANEL) return FORMA_COMPRA_ENUM.A_GRANEL;

  // aceita rótulos comuns
  if (["EMBALADO", "EMBALADA", "PACOTE", "SACO", "CAIXA"].includes(up)) return FORMA_COMPRA_ENUM.EMBALADO;
  if (["GRANEL", "A GRANEL", "A_GRANEL"].includes(up)) return FORMA_COMPRA_ENUM.A_GRANEL;

  // fallback inteligente: se veio tipo/tamanho de embalagem, assume EMBALADO, senão A_GRANEL
  const hasEmbalagem =
    !!produtoUi?.tipoEmbalagem ||
    produtoUi?.tamanhoPorEmbalagem != null ||
    produtoUi?.tamanho_por_embalagem != null;

  return hasEmbalagem ? FORMA_COMPRA_ENUM.EMBALADO : FORMA_COMPRA_ENUM.A_GRANEL;
}

export default function Estoque({ onCountChange }) {
  const { fazendaAtualId } = useFazenda();
  const memoData = MEMO_ESTOQUE.data || {};

  const categoriasFixas = useMemo(
    () => [
      { value: "Todos", label: "Todos" },
      { value: "Cozinha", label: "Cozinha" },
      { value: "Higiene e Limpeza", label: "Higiene e Limpeza" },
      { value: "Farmácia", label: "Farmácia" },
      { value: "Reprodução", label: "Reprodução" },
      { value: "Materiais Gerais", label: "Materiais Gerais" },
    ],
    []
  );

  const [minimos, setMinimos] = useState(() => ({
    Cozinha: 5,
    "Higiene e Limpeza": 2,
    Farmácia: 2,
    Reprodução: 1,
    "Materiais Gerais": 1,
  }));

  const [tourosBase] = useState(() => []); // mock

  const [produtos, setProdutos] = useState(() => memoData.produtos ?? []);
  const [loading, setLoading] = useState(() => !memoData.produtos);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState(() => memoData.erro ?? "");

  const [categoriaSelecionada, setCategoriaSelecionada] = useState(
    () => memoData.categoriaSelecionada ?? categoriasFixas[0]
  );
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [hoveredColKey, setHoveredColKey] = useState(null);
  const [sortConfig, setSortConfig] = useState(() => memoData.sortConfig ?? { key: null, direction: null });
  const [openPopoverKey, setOpenPopoverKey] = useState(null);
  const [filtros, setFiltros] = useState(() => memoData.filtros ?? { unidade: "__ALL__" });

  // modais
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [mostrarAjustes, setMostrarAjustes] = useState(false);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);
  const [editar, setEditar] = useState({ abrir: false, item: null });

  useEffect(() => {
    MEMO_ESTOQUE.data = {
      produtos,
      erro,
      categoriaSelecionada,
      sortConfig,
      filtros,
    };
  }, [produtos, erro, categoriaSelecionada, sortConfig, filtros]);

  const updateCache = useCallback(async (nextList) => {
    setProdutos(nextList);
    MEMO_ESTOQUE.lastAt = Date.now();
    MEMO_ESTOQUE.data = {
      ...(MEMO_ESTOQUE.data || {}),
      produtos: nextList,
    };
    await kvSet(CACHE_ESTOQUE_KEY, nextList);
  }, []);

  function requireFazendaId() {
    if (!fazendaAtualId) throw new Error("Selecione uma fazenda para continuar.");
    return fazendaAtualId;
  }

  // ✅ Busca rápida do produto (nome + unidade) para descrever a compra no Financeiro
  async function getProdutoInfo(produtoId) {
    try {
      const { data, error } = await withFazendaId(
        supabase
          .from("estoque_produtos")
          .select("id, nome_comercial, unidade_medida, unidade, categoria")
          .eq("id", produtoId),
        requireFazendaId()
      ).single();

      if (error) throw error;

      return {
        nome: data?.nome_comercial || null,
        unidade: data?.unidade_medida || data?.unidade || null,
        categoria: data?.categoria || null,
      };
    } catch (e) {
      console.warn("Não foi possível buscar info do produto (ok).", e);
      return { nome: null, unidade: null, categoria: null };
    }
  }

  // ✅ Registra a compra (entrada de lote) como SAÍDA de caixa no Financeiro
  async function registrarCompraNoFinanceiro({ produtoId, loteId, quantidade, valorTotal, validadeISO }) {
    const vTotal = Number(valorTotal || 0);
    const qtd = Number(quantidade || 0);
    if (!Number.isFinite(vTotal) || vTotal <= 0) return;
    if (!Number.isFinite(qtd) || qtd <= 0) return;

    const info = await getProdutoInfo(produtoId);
    const desc = info?.nome ? `Compra estoque: ${info.nome}` : `Compra estoque (produto)`;
    const unidade = info?.unidade || null;
    const unit = qtd > 0 ? vTotal / qtd : null;

    const payloadBase = {
      fazenda_id: requireFazendaId(),
      data: toDateOnly(new Date()),
      tipo: "SAIDA",
      categoria: "Estoque (Compra)",
      origem: "Estoque",
      descricao: desc,
      quantidade: qtd,
      unidade,
      valor_unitario: unit,
      valor_total: vTotal,
      observacao: validadeISO
        ? `Entrada de lote • Validade: ${new Date(`${validadeISO}T00:00:00`).toLocaleDateString("pt-BR")}`
        : `Entrada de lote`,
    };

    try {
      await supabase.from("financeiro_lancamentos").insert([
        {
          ...payloadBase,
          source_table: "estoque_lotes",
          source_id: loteId || null,
          impacta_caixa: true,
          detalhes: {
            produto_id: produtoId,
            lote_id: loteId || null,
            validade: validadeISO || null,
          },
        },
      ]);
      return;
    } catch (e) {
      console.warn("Financeiro: sem colunas extras de rastreio (ok).", e);
    }

    try {
      await supabase.from("financeiro_lancamentos").insert([payloadBase]);
    } catch (e2) {
      console.warn("Não foi possível registrar a compra no Financeiro.", e2);
    }
  }

  /* ===================== LOAD (Supabase) ===================== */
  const carregar = useCallback(
    async (categoriaOpt = categoriaSelecionada, opts = {}) => {
      const { force = false } = opts;

      const memo = MEMO_ESTOQUE.data;
      const memoFresh = memo && Date.now() - MEMO_ESTOQUE.lastAt < 30000;
      const memoCategoria = memo?.categoriaSelecionada?.value;
      const categoriaAtual = categoriaOpt?.value;

      const hasProdutos = Array.isArray(produtos) && produtos.length > 0;
      const podeBackground = memoFresh && memoCategoria === categoriaAtual && hasProdutos && !force;

      try {
        if (podeBackground) setAtualizando(true);
        else setLoading(true);

        setErro("");

        // OFFLINE -> usa cache e sai
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          const cache = normalizeEstoqueCache(await kvGet(CACHE_ESTOQUE_KEY));
          setProdutos(cache);
          MEMO_ESTOQUE.lastAt = Date.now();
          MEMO_ESTOQUE.data = { ...(MEMO_ESTOQUE.data || {}), produtos: cache };
          setLoading(false);
          setAtualizando(false);
          return;
        }

        const fazId = requireFazendaId();

        // ✅ PRODUTOS (schema novo tolerante)
        const { data: produtosDb, error: errP } = await withFazendaId(
          supabase
            .from("estoque_produtos")
            .select(
              `
              id,
              nome_comercial,
              categoria,
              unidade_medida,
              unidade,
              sub_tipo,
              forma_compra,
              tipo_embalagem,
              tamanho_por_embalagem,
              reutilizavel,
              usos_por_unidade,
              carencia_leite,
              carencia_carne,
              sem_carencia_leite,
              sem_carencia_carne,
              ativo,
              created_at,
              updated_at
            `
            ),
          fazId
        ).order("nome_comercial", { ascending: true });

        if (errP) throw errP;

        const uiBase = (produtosDb || []).map(dbToUiProduto);

        // ✅ LOTES (para "Comprado/Em estoque/Valor/Validade")
        const ids = uiBase.map((p) => p.id).filter(Boolean);
        let lotes = [];

        if (ids.length > 0) {
          const { data: lotesDb, error: errL } = await withFazendaId(
            supabase
              .from("estoque_lotes")
              .select(
                `
                id,
                produto_id,
                data_entrada,
                validade,
                data_validade,
                quantidade_inicial,
                quantidade_atual,
                quantidade,
                valor_total,
                valor_total_pago
              `
              ),
            fazId
          ).in("produto_id", ids);

          if (errL) throw errL;
          lotes = Array.isArray(lotesDb) ? lotesDb : [];
        }

        const agregados = agregarLotesPorProduto(lotes);

        let lista = uiBase.map((p) => {
          const agg = agregados[p.id];

          return {
            ...p,
            compradoTotal: safeNum(agg?.compradoTotal, 0),
            quantidade: safeNum(agg?.emEstoque, 0),
            valorTotal: safeNum(agg?.valorTotalRestante, 0),
            validade: agg?.validadeMaisProxima || null,
            prevTerminoDias: null,
            meta: p.meta || {},
          };
        });

        const touros = normalizeTouros(tourosBase);
        lista = mesclarTourosNoEstoque(lista, touros);

        if (categoriaOpt?.value && categoriaOpt.value !== "Todos") {
          lista = lista.filter((p) => p.categoria === categoriaOpt.value);
        }

        await updateCache(Array.isArray(lista) ? lista : []);
      } catch (e) {
        console.error(e);
        try {
          const cache = normalizeEstoqueCache(await kvGet(CACHE_ESTOQUE_KEY));
          setProdutos(cache);
        } catch {}
        setErro(e?.message ? String(e.message) : "Erro ao carregar estoque (Supabase).");
      } finally {
        setLoading(false);
        setAtualizando(false);
      }
    },
    [categoriaSelecionada, fazendaAtualId, produtos, tourosBase, updateCache]
  );

  useEffect(() => {
    carregar(categoriaSelecionada, { force: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaSelecionada?.value, fazendaAtualId]);

  useEffect(() => {
    onCountChange?.(produtos.length || 0);
  }, [produtos.length, onCountChange]);

  const produtosFiltrados = useMemo(() => {
    if (categoriaSelecionada?.value === "Todos") return produtos;
    return produtos.filter((p) => p.categoria === categoriaSelecionada.value);
  }, [produtos, categoriaSelecionada]);

  const unidadeOptions = useMemo(() => {
    const values = Array.from(new Set((produtos || []).map((p) => p.unidade).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
    return values;
  }, [produtos]);

  const colunas = useMemo(
    () => [
      "Produto",
      "Categoria",
      "Comprado",
      "Em estoque",
      "Unid.",
      "Valor em estoque (R$)",
      "Validade mais próxima",
      "Prev. término",
      "Alerta Estoque",
      "Alerta Validade",
      "Ação",
    ],
    []
  );

  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      if (prev.direction === "desc") return { key: null, direction: null };
      return { key, direction: "asc" };
    });
  };

  const handleTogglePopover = (key) => {
    setOpenPopoverKey((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
    if (!openPopoverKey) return undefined;
    const handleClick = (event) => {
      if (event.target.closest('[data-filter-trigger="true"]')) return;
      setOpenPopoverKey(null);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [openPopoverKey]);

  const produtosExibidos = useMemo(() => {
    let lista = Array.isArray(produtosFiltrados) ? [...produtosFiltrados] : [];

    if (filtros.unidade !== "__ALL__") {
      lista = lista.filter((p) => p.unidade === filtros.unidade);
    }

    if (sortConfig.key) {
      const dir = sortConfig.direction === "desc" ? -1 : 1;
      lista.sort((a, b) => {
        switch (sortConfig.key) {
          case "produto":
            return String(a.nomeComercial || "").localeCompare(String(b.nomeComercial || "")) * dir;
          case "estoque":
            return (Number(a.quantidade || 0) - Number(b.quantidade || 0)) * dir;
          case "validade": {
            const da = a.validade ? new Date(a.validade).getTime() : 9e15;
            const db = b.validade ? new Date(b.validade).getTime() : 9e15;
            return (da - db) * dir;
          }
          default:
            return 0;
        }
      });
    }

    return lista;
  }, [produtosFiltrados, filtros, sortConfig]);

  const resumo = useMemo(() => {
    const total = produtosExibidos.length;
    const valorTotal = produtosExibidos.reduce((acc, p) => acc + Number(p.valorTotal || 0), 0);
    const abaixoMinimo = produtosExibidos.filter((p) => {
      const min = minimos[p.categoria] ?? 1;
      return Number(p.quantidade || 0) <= min;
    }).length;
    return { total, valorTotal, abaixoMinimo };
  }, [produtosExibidos, minimos]);

  const hasProdutos = produtosExibidos.length > 0;

  /* ===================== CRUD PRODUTO ===================== */
  async function salvarNovoProduto(produtoUi) {
    console.warn("Cadastro via Estoque está desativado.", produtoUi);
    throw new Error("Cadastro de produtos é feito na aba Consumo/Reposição.");
  }

  async function salvarEdicaoProduto(id, produtoUi) {
    console.warn("Edição via Estoque está desativada.", id, produtoUi);
    throw new Error("Edição de produtos é feita na aba Consumo/Reposição.");
  }

  async function excluirProduto(id) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const nextList = produtos.filter((p) => p.id !== id);
      await updateCache(nextList);
      await enqueue("estoque.produto.delete", { id });
      return true;
    }

    const { error } = await withFazendaId(supabase.from("estoque_produtos").delete(), requireFazendaId()).eq("id", id);
    if (error) throw error;

    MEMO_ESTOQUE.lastAt = 0;
    return true;
  }

  /* ===================== LOTE (ENTRADA) ===================== */
  async function criarEntradaLote(produtoId, lote) {
    if (!lote) return;

    const quantidade = Number(lote.quantidade || 0);
    const valorTotal = Number(lote.valorTotal || 0);
    const validade = lote.validade ? toDateOnly(lote.validade) : null;

    if (!Number.isFinite(quantidade) || quantidade <= 0) return;

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const loteId = generateLocalId();

      const nextList = produtos.map((p) => {
        if (p.id !== produtoId) return p;

        const compradoTotal = Number(p.compradoTotal || 0) + quantidade;
        const quantidadeAtual = Number(p.quantidade || 0) + quantidade;
        const valorTotalAtual = Number(p.valorTotal || 0) + (Number.isFinite(valorTotal) ? valorTotal : 0);

        const validadeAtual = p.validade ? new Date(p.validade) : null;
        const validadeNova = validade ? new Date(validade) : null;
        const validadeAtualOk = validadeAtual && !Number.isNaN(validadeAtual.getTime()) ? validadeAtual : null;
        const validadeNovaOk = validadeNova && !Number.isNaN(validadeNova.getTime()) ? validadeNova : null;

        const validadeFinalDate =
          validadeAtualOk && validadeNovaOk
            ? validadeNovaOk < validadeAtualOk
              ? validadeNovaOk
              : validadeAtualOk
            : validadeNovaOk || validadeAtualOk;

        const validadeFinal = validadeFinalDate ? validadeFinalDate.toISOString() : p.validade || null;

        return {
          ...p,
          compradoTotal,
          quantidade: quantidadeAtual,
          valorTotal: valorTotalAtual,
          validade: validadeFinal,
        };
      });

      await updateCache(sortProdutosByNome(nextList));

      await enqueue("estoque.lote.insert", {
        lote: {
          id: loteId,
          fazenda_id: fazendaAtualId || null,
          produto_id: produtoId,
          data_entrada: toDateOnly(new Date()),
          validade,
          quantidade_inicial: quantidade,
          quantidade_atual: quantidade,
          valor_total: Number.isFinite(valorTotal) ? valorTotal : 0,
        },
        movimento: {
          fazenda_id: fazendaAtualId || null,
          produto_id: produtoId,
          lote_id: loteId,
          tipo: "entrada",
          quantidade,
          valor_total: Number.isFinite(valorTotal) ? valorTotal : 0,
          data_movimento: toDateOnly(new Date()),
        },
      });
      return;
    }

    const { data: loteCriado, error } = await supabase
      .from("estoque_lotes")
      .insert({
        fazenda_id: requireFazendaId(),
        produto_id: produtoId,
        data_entrada: toDateOnly(new Date()),
        validade,
        quantidade_inicial: quantidade,
        quantidade_atual: quantidade,
        valor_total: Number.isFinite(valorTotal) ? valorTotal : 0,
      })
      .select("id")
      .single();

    if (error) throw error;

    try {
      await supabase.from("estoque_movimentos").insert({
        fazenda_id: requireFazendaId(),
        produto_id: produtoId,
        lote_id: loteCriado?.id || null,
        tipo: "entrada",
        quantidade,
        valor_total: Number.isFinite(valorTotal) ? valorTotal : 0,
        data_movimento: toDateOnly(new Date()),
      });
    } catch (e) {
      console.warn("Movimentos não registrados (ok se ainda não implementado).", e);
    }

    try {
      await registrarCompraNoFinanceiro({
        produtoId,
        loteId: loteCriado?.id || null,
        quantidade,
        valorTotal: Number.isFinite(valorTotal) ? valorTotal : 0,
        validadeISO: validade,
      });
    } catch (e) {
      console.warn("Não foi possível registrar a compra no Financeiro (ok).", e);
    }

    MEMO_ESTOQUE.lastAt = 0;
  }

  return (
    <section className="w-full py-6 font-sans">
      <div className="px-2 md:px-4 lg:px-6">
        <div
          className="mb-3"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "nowrap",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "nowrap" }}>
            <button className="botao-acao pequeno" style={{ whiteSpace: "nowrap" }} onClick={() => setMostrarCadastro(true)}>
              + Novo Produto
            </button>

            <button className="botao-cancelar pequeno" style={{ whiteSpace: "nowrap" }} onClick={() => setMostrarAjustes(true)}>
              Ajustes
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", flexWrap: "nowrap" }}>
            <Select
              options={categoriasFixas}
              value={categoriaSelecionada}
              onChange={setCategoriaSelecionada}
              menuPortalTarget={document.body}
              styles={rsStylesCompact}
            />
          </div>
        </div>

        {erro && <div className="mb-3 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-2 rounded">{erro}</div>}

        <div className="st-filter-hint">
          Dica: clique no título das colunas habilitadas para ordenar/filtrar. Clique novamente para fechar.
        </div>

        {atualizando && hasProdutos && <div className="text-xs text-slate-500 mb-2">Atualizando estoque...</div>}

        <div className="st-table-container">
          <div className="st-table-wrap">
            <table
              className="st-table st-table--darkhead"
              onMouseLeave={() => {
                setHoveredRowId(null);
                setHoveredColKey(null);
              }}
            >
              <colgroup>
                <col style={{ width: "20%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>

              <thead>
                <tr>
                  <th className="col-nome" onMouseEnter={() => setHoveredColKey("produto")}>
                    <button type="button" onClick={() => toggleSort("produto")} style={thBtnStyle}>
                      <span className="st-th-label">Produto</span>
                      {sortConfig.key === "produto" && sortConfig.direction && (
                        <span style={{ fontSize: 12, opacity: 0.7 }}>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                      )}
                    </button>
                  </th>

                  <th className="col-categoria" style={{ position: "relative" }}>
                    <button
                      type="button"
                      data-filter-trigger="true"
                      onClick={() => handleTogglePopover("categoria")}
                      style={thBtnStyle}
                    >
                      <span className="st-th-label">Categoria</span>
                    </button>

                    {openPopoverKey === "categoria" && (
                      <div className="st-filter-popover" onClick={(event) => event.stopPropagation()}>
                        <label className="st-filter__label">
                          Categoria
                          <select
                            className="st-filter-input"
                            value={categoriaSelecionada?.value || "Todos"}
                            onChange={(event) => {
                              const value = event.target.value;
                              const opt = categoriasFixas.find((c) => c.value === value) || categoriasFixas[0];
                              setCategoriaSelecionada(opt);
                            }}
                          >
                            {categoriasFixas.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    )}
                  </th>

                  <th className="st-td-center col-comprado">
                    <span className="st-th-label">Comprado</span>
                  </th>

                  <th className="st-td-center col-estoque" onMouseEnter={() => setHoveredColKey("estoque")}>
                    <button type="button" onClick={() => toggleSort("estoque")} style={thBtnStyle}>
                      <span className="st-th-label">Em estoque</span>
                      {sortConfig.key === "estoque" && sortConfig.direction && (
                        <span style={{ fontSize: 12, opacity: 0.7 }}>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                      )}
                    </button>
                  </th>

                  <th className="st-td-center col-unidade" style={{ position: "relative" }}>
                    <button
                      type="button"
                      data-filter-trigger="true"
                      onClick={() => handleTogglePopover("unidade")}
                      style={thBtnStyle}
                    >
                      <span className="st-th-label">Unid.</span>
                    </button>

                    {openPopoverKey === "unidade" && (
                      <div className="st-filter-popover" onClick={(event) => event.stopPropagation()}>
                        <label className="st-filter__label">
                          Unidade
                          <select
                            className="st-filter-input"
                            value={filtros.unidade}
                            onChange={(event) =>
                              setFiltros((prev) => ({
                                ...prev,
                                unidade: event.target.value,
                              }))
                            }
                          >
                            <option value="__ALL__">Todas</option>
                            {unidadeOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    )}
                  </th>

                  <th className="st-td-center col-valor">
                    <span className="st-th-label">Valor em estoque (R$)</span>
                  </th>

                  <th className="st-td-center col-validade" onMouseEnter={() => setHoveredColKey("validade")}>
                    <button type="button" onClick={() => toggleSort("validade")} style={thBtnStyle}>
                      <span className="st-th-label">Validade mais próxima</span>
                      {sortConfig.key === "validade" && sortConfig.direction && (
                        <span style={{ fontSize: 12, opacity: 0.7 }}>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                      )}
                    </button>
                  </th>

                  <th className="st-td-center col-prev">
                    <span className="st-th-label">Prev. término</span>
                  </th>

                  <th className="st-td-center col-alerta-estoque">
                    <span className="st-th-label">Alerta Estoque</span>
                  </th>

                  <th className="st-td-center col-alerta-validade">
                    <span className="st-th-label">Alerta Validade</span>
                  </th>

                  <th className="st-td-center col-acoes">
                    <span className="st-th-label">Ação</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading && !hasProdutos ? (
                  <tr className="st-empty">
                    <td colSpan={colunas.length} style={{ textAlign: "center" }}>
                      Carregando…
                    </td>
                  </tr>
                ) : produtosExibidos.length === 0 ? (
                  <tr className="st-empty">
                    <td colSpan={colunas.length} style={{ textAlign: "center" }}>
                      Nenhum produto cadastrado.
                    </td>
                  </tr>
                ) : (
                  produtosExibidos.map((p, idx) => {
                    const est = alertaEstoque(p, minimos[p.categoria]);
                    const val = alertaValidade(p.validade);
                    const readOnly = !!p?.meta?.readOnly;
                    const rowId = p.id || p._virtualId || idx;
                    const rowHover = hoveredRowId === rowId;

                    return (
                      <tr key={rowId} className={rowHover ? "st-row-hover" : ""}>
                        <td
                          className={`${hoveredColKey === "produto" ? "st-col-hover" : ""} ${
                            rowHover ? "st-row-hover" : ""
                          } ${rowHover && hoveredColKey === "produto" ? "st-cell-hover" : ""}`}
                          title={p.nomeComercial || ""}
                          onMouseEnter={() => {
                            setHoveredRowId(rowId);
                            setHoveredColKey("produto");
                          }}
                        >
                          {p.nomeComercial || "—"}
                          {readOnly ? <span className="ml-2 text-[12px] text-gray-500">🔒</span> : null}
                        </td>

                        <td className="st-td-center">{p.categoria || "—"}</td>

                        <td className="st-td-center st-num">{formatQtd(p.compradoTotal)}</td>

                        <td
                          className={`st-td-center st-num ${hoveredColKey === "estoque" ? "st-col-hover" : ""} ${
                            rowHover ? "st-row-hover" : ""
                          } ${rowHover && hoveredColKey === "estoque" ? "st-cell-hover" : ""}`}
                          onMouseEnter={() => {
                            setHoveredRowId(rowId);
                            setHoveredColKey("estoque");
                          }}
                        >
                          {formatQtd(p.quantidade)}
                        </td>

                        <td className="st-td-center">{p.unidade || "—"}</td>

                        <td className="st-td-center st-num">{formatBRL(p.valorTotal)}</td>

                        <td
                          className={`st-td-center ${hoveredColKey === "validade" ? "st-col-hover" : ""} ${
                            rowHover ? "st-row-hover" : ""
                          } ${rowHover && hoveredColKey === "validade" ? "st-cell-hover" : ""}`}
                          onMouseEnter={() => {
                            setHoveredRowId(rowId);
                            setHoveredColKey("validade");
                          }}
                        >
                          {formatVal(p.validade)}
                        </td>

                        <td className="st-td-center st-num">{p.prevTerminoDias != null ? `${p.prevTerminoDias} d` : "—"}</td>

                        <td className="st-td-center">
                          <span className={`st-pill ${est.variant}`}>{est.label}</span>
                        </td>

                        <td className="st-td-center">
                          <span className={`st-pill ${val.variant}`}>{val.label}</span>
                        </td>

                        <td className="st-td-center">
                          {readOnly ? (
                            <span className="st-text">—</span>
                          ) : (
                            <div style={{ display: "inline-flex", gap: 8 }}>
                              <button className="st-btn" onClick={() => setEditar({ abrir: true, item: p })}>
                                Editar
                              </button>
                              <button className="st-btn" onClick={() => setProdutoParaExcluir(p)}>
                                Excluir
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              <tfoot>
                <tr className="st-summary-row">
                  <td colSpan={11}>
                    <div className="st-summary-row__content">
                      <span>Total de itens exibidos: {resumo.total}</span>
                      <span>Valor total: {formatBRL(resumo.valorTotal)}</span>
                      <span>Itens abaixo do mínimo: {resumo.abaixoMinimo}</span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ===================== MODAIS ===================== */}
        <ModalNovoProduto
          open={mostrarCadastro}
          onClose={() => setMostrarCadastro(false)}
          onSaved={async () => {
            try {
              setErro("");
              await salvarNovoProduto();
            } catch (e) {
              console.error(e);
              setErro(e?.message ? String(e.message) : "Não foi possível salvar o produto.");
            }
          }}
        />

        <ModalNovoProduto
          open={editar.abrir}
          initial={editar.item}
          onClose={() => setEditar({ abrir: false, item: null })}
          onSaved={async () => {
            try {
              setErro("");
              await salvarEdicaoProduto();
            } catch (e) {
              console.error(e);
              setErro(e?.message ? String(e.message) : "Não foi possível salvar a edição.");
            }
          }}
        />

        {produtoParaExcluir && (
          <ModalSimples title="Confirmar exclusão" onClose={() => setProdutoParaExcluir(null)}>
            <div className="mb-3 text-[14px] text-[#374151]">
              Excluir <b>{produtoParaExcluir.nomeComercial}</b>?
            </div>

            <div className="flex justify-end gap-2">
              <button className="botao-cancelar pequeno" onClick={() => setProdutoParaExcluir(null)}>
                Cancelar
              </button>
              <button
                className="botao-excluir"
                onClick={async () => {
                  try {
                    setErro("");
                    if (!produtoParaExcluir?.id) {
                      setErro("Produto sem ID para excluir.");
                      return;
                    }

                    await excluirProduto(produtoParaExcluir.id);
                    setProdutoParaExcluir(null);

                    await invalidarCacheEstoque();
                    await carregar(categoriaSelecionada, { force: true });
                  } catch (e) {
                    console.error(e);
                    setErro(e?.message ? String(e.message) : "Não foi possível excluir o produto.");
                  }
                }}
              >
                Excluir
              </button>
            </div>
          </ModalSimples>
        )}

        {mostrarAjustes && (
          <ModalAjustesEstoque
            open={mostrarAjustes}
            minimos={minimos}
            onChange={setMinimos}
            onClose={() => setMostrarAjustes(false)}
          />
        )}
      </div>
    </section>
  );
}

/* ===================== MODAL SIMPLES ===================== */
function ModalSimples({ title, children, onClose }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div style={overlay} onMouseDown={onClose}>
      <div style={modalCard} onMouseDown={(e) => e.stopPropagation()}>
        <div style={modalHeader}>
          <span style={{ fontWeight: "bold" }}>{title}</span>
          <button className="px-2 text-white/90 hover:text-white" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

/* ===================== HELPERS ===================== */
function alertaEstoque(p, min = 1) {
  const q = Number(p.quantidade || 0);
  if (q <= 0) return { label: "Insuficiente", variant: "st-pill--warn" };
  if (q <= min) return { label: "Estoque baixo", variant: "st-pill--warn" };
  return { label: "OK", variant: "st-pill--ok" };
}

function alertaValidade(v) {
  if (!v) return { label: "—", variant: "st-pill--mute" };
  const d = new Date(v);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  const dias = Math.ceil((dd - hoje) / 86400000);

  if (dias < 0) return { label: "Vencido", variant: "st-pill--warn" };
  if (dias <= 30) return { label: `Vence em ${dias}d`, variant: "st-pill--warn" };
  return { label: "OK", variant: "st-pill--ok" };
}

function formatVal(v) {
  if (!v) return "—";
  const dt = new Date(v);
  return Number.isNaN(dt.getTime()) ? String(v) : dt.toLocaleDateString("pt-BR");
}

function formatQtd(v) {
  const n = Number(v || 0);
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 3 });
}

function formatBRL(v) {
  return (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const thBtnStyle = {
  background: "transparent",
  border: "none",
  padding: 0,
  margin: 0,
  font: "inherit",
  color: "inherit",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

/* ===================== ADAPTERS ===================== */
function dbToUiProduto(d) {
  return {
    id: d.id,
    nomeComercial: d.nome_comercial ?? "",
    categoria: d.categoria ?? "",
    unidade: d.unidade_medida ?? d.unidade ?? "",
    formaCompra: d.forma_compra ?? null,
    tipoEmbalagem: d.tipo_embalagem ?? null,
    tamanhoPorEmbalagem: d.tamanho_por_embalagem ?? null,
    compradoTotal: 0,
    quantidade: 0,
    valorTotal: 0,
    validade: null,
    prevTerminoDias: null,
    meta: {},
    _raw: d,
  };
}

function uiToDbProduto(p) {
  const nome = String(p?.nomeComercial || "").trim();
  const categoria = String(p?.categoria || "").trim();
  const unidade = String(p?.unidade || "").trim();

  const formaNorm = normalizeFormaCompra(p?.formaCompra, p);

  return {
    nome_comercial: nome,
    categoria,
    unidade_medida: unidade,
    forma_compra: formaNorm, // ✅ NOT NULL + enum
    // se tu quiser persistir isso futuramente, já fica plugável:
    tipo_embalagem: p?.tipoEmbalagem ?? p?.tipo_embalagem ?? null,
    tamanho_por_embalagem:
      p?.tamanhoPorEmbalagem != null
        ? Number(String(p.tamanhoPorEmbalagem).replace(",", "."))
        : p?.tamanho_por_embalagem != null
        ? Number(String(p.tamanho_por_embalagem).replace(",", "."))
        : null,
  };
}

/* ===================== LOTES -> AGREGADOS (tolerante) ===================== */
function agregarLotesPorProduto(lotesDb) {
  const lotes = Array.isArray(lotesDb) ? lotesDb : [];
  const by = {};

  for (const l of lotes) {
    const pid = l.produto_id;
    if (!pid) continue;

    const qtdAtual = safeNum(l.quantidade_atual ?? l.quantidade ?? 0, 0);
    const qtdIni = safeNum(l.quantidade_inicial ?? l.quantidade_inicial_original ?? l.quantidade ?? 0, 0);

    const valorTotalLote = safeNum(l.valor_total ?? l.valor_total_pago ?? 0, 0);
    const unit = qtdIni > 0 ? valorTotalLote / qtdIni : 0;

    if (!by[pid]) {
      by[pid] = {
        compradoTotal: 0,
        emEstoque: 0,
        valorTotalRestante: 0,
        validadeMaisProxima: null,
      };
    }

    by[pid].compradoTotal += qtdIni;
    by[pid].emEstoque += qtdAtual;
    by[pid].valorTotalRestante += qtdAtual * unit;

    const validade = l.validade ?? l.data_validade ?? null;

    if (qtdAtual > 0 && validade) {
      const dt = new Date(validade);
      if (!Number.isNaN(dt.getTime())) {
        const atual = by[pid].validadeMaisProxima ? new Date(by[pid].validadeMaisProxima) : null;
        if (!atual || dt < atual) by[pid].validadeMaisProxima = dt.toISOString();
      }
    }
  }

  Object.keys(by).forEach((pid) => {
    by[pid].compradoTotal = safeNum(by[pid].compradoTotal, 0);
    by[pid].emEstoque = safeNum(by[pid].emEstoque, 0);
    by[pid].valorTotalRestante = safeNum(by[pid].valorTotalRestante, 0);
  });

  return by;
}

/* ===================== TOUROS (mock) ===================== */
function normalizeTouros(arr) {
  const data = Array.isArray(arr) ? arr : [];
  return data.map((t) => ({
    _virtualId: t.id,
    id: null,
    nomeComercial: t.nome || "Touro (Sêmen)",
    categoria: "Reprodução",
    compradoTotal: Number(t.doses ?? 0),
    quantidade: Number(t.doses ?? 0),
    unidade: "doses",
    valorTotal: Number(t.valorTotal ?? 0),
    validade: t.validade || null,
    prevTerminoDias: null,
    meta: { readOnly: true },
  }));
}

function mesclarTourosNoEstoque(estoque, touros) {
  const clean = (Array.isArray(estoque) ? estoque : []).map((p) => ({
    id: p.id,
    nomeComercial: p.nomeComercial,
    categoria: p.categoria,
    unidade: p.unidade || "un",

    compradoTotal: Number(p.compradoTotal ?? 0),
    quantidade: Number(p.quantidade ?? 0),
    valorTotal: Number(p.valorTotal ?? 0),
    validade: p.validade || null,
    prevTerminoDias: p.prevTerminoDias ?? null,

    meta: p.meta || {},
  }));

  return [...clean, ...(Array.isArray(touros) ? touros : [])].sort((a, b) =>
    String(a.nomeComercial || "").localeCompare(String(b.nomeComercial || ""))
  );
}
