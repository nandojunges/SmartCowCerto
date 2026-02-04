import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { withFazendaId } from "../../lib/fazendaScope";
import { useFazenda } from "../../context/FazendaContext";
import { enqueue, kvGet, kvSet } from "../../offline/localDB";
import ModalRegistrarSecagem from "./ModalRegistrarSecagem";

export const iconeSecagem = "/icones/secagem.png";
export const rotuloSecagem = "Secagem";

let MEMO_SECAGEM = { data: null, lastAt: 0 };

const KEY = "cfg_manejo_repro";
const DEFAULT_CFG = {
  dias_antes_parto_para_secagem: 60,
  dias_antecedencia_preparar_secagem: 7,
  dias_antes_parto_para_preparto: 30,
};

const cfgKey = (userId, fazendaId) => `${KEY}:${userId || "anon"}:${fazendaId || "none"}`;

async function loadConfigManejo(userId, fazendaId) {
  if (!userId || !fazendaId) return { ...DEFAULT_CFG };
  try {
    const { data, error, status } = await supabase
      .from("config_manejo_repro")
      .select("*")
      .eq("user_id", userId)
      .eq("fazenda_id", fazendaId)
      .single();

    if (error) {
      if (status === 406 || error.code === "PGRST116") {
        const defaults = { ...DEFAULT_CFG, fazenda_id: fazendaId };
        await supabase.from("config_manejo_repro").upsert(defaults, { onConflict: "user_id,fazenda_id" });
        await kvSet(cfgKey(userId, fazendaId), defaults);
        return defaults;
      }
      throw error;
    }

    if (data) {
      await kvSet(cfgKey(userId, fazendaId), data);
      return { ...DEFAULT_CFG, ...data };
    }
  } catch (error) {
    const cached = await kvGet(cfgKey(userId, fazendaId));
    return { ...DEFAULT_CFG, ...(cached || {}), fazenda_id: fazendaId };
  }
  return { ...DEFAULT_CFG, fazenda_id: fazendaId };
}

async function saveCfg(userId, fazendaId, patch) {
  if (!userId || !fazendaId) return null;
  const cached = (await kvGet(cfgKey(userId, fazendaId))) || {};
  const merged = { ...cached, ...patch, fazenda_id: fazendaId };
  await kvSet(cfgKey(userId, fazendaId), merged);
  try {
    const { error } = await supabase.from("config_manejo_repro").upsert(merged, { onConflict: "user_id,fazenda_id" });
    if (error) throw error;
  } catch (error) {
    await enqueue("cfg_manejo_upsert", merged);
  }
  return merged;
}

/* ========= helpers de data ========= */
function parseDateFlexible(s) {
  if (!s) return null;
  if (typeof s !== "string") s = String(s);
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const y = +m[1], mo = +m[2], d = +m[3];
    const dt = new Date(y, mo - 1, d);
    return Number.isFinite(+dt) ? dt : null;
  }
  m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const d = +m[1], mo = +m[2], y = +m[3];
    const dt = new Date(y, mo - 1, d);
    return Number.isFinite(+dt) ? dt : null;
  }
  const dt = new Date(s);
  return Number.isFinite(+dt) ? dt : null;
}

function addDays(dt, n) {
  const d = new Date(dt.getTime());
  d.setDate(d.getDate() + n);
  return d;
}

function formatBR(dt) {
  return dt ? dt.toLocaleDateString("pt-BR") : "—";
}

function diffDias(target, base = new Date()) {
  if (!target) return null;
  const diff = Math.round((target.getTime() - base.getTime()) / 86400000);
  return Number.isFinite(diff) ? diff : null;
}

function previsaoParto(animal) {
  if (!animal) return null;
  const direta = parseDateFlexible(animal.previsao_parto) || parseDateFlexible(animal.previsaoParto);
  if (direta) return direta;
  const ia = parseDateFlexible(animal.ultima_ia) || parseDateFlexible(animal.ultimaIa) || parseDateFlexible(animal.ultimaIA);
  return ia ? addDays(ia, 283) : null;
}

function resolveSituacaoProdutiva(animal) {
  if (!animal) return "—";
  if (animal?.sexo === "macho") return "não lactante";
  const delValor = Number(animal?.del);
  if (Number.isFinite(delValor)) return "lactante";
  return "seca";
}

function mapearReproPorAnimal(lista = []) {
  const map = {};
  lista.forEach((item) => {
    const id = item?.animal_id ?? item?.id;
    if (!id) return;
    map[id] = item;
  });
  return map;
}

const BLOQUEAR_OVERRIDE = new Set([
  "id", "user_id", "fazenda_id", "numero", "brinco", "nascimento", "sexo", "origem", "raca_id", "lote_id", "ativo", "created_at", "updated_at"
]);

function mesclarReproEmAnimais(animais = [], repro = []) {
  const mapRepro = mapearReproPorAnimal(repro);
  return animais.map((animal) => {
    const reproRow = mapRepro[animal?.id];
    if (!reproRow) return animal;
    const { id, animal_id, ...rest } = reproRow || {};
    const merged = { ...animal };
    Object.entries(rest).forEach(([chave, valor]) => {
      if (BLOQUEAR_OVERRIDE.has(chave)) return;
      if (valor === null || valor === undefined) return;
      if (typeof valor === "string" && valor.trim() === "") return;
      merged[chave] = valor;
    });
    return merged;
  });
}

export default function Secagem({ isOnline = navigator.onLine }) {
  const { fazendaAtualId } = useFazenda();
  const CACHE_KEY = "cache:animais:list";
  const CACHE_FALLBACK_KEY = "cache:animais:plantel:v1";

  const memoData = MEMO_SECAGEM.data || {};
  const [animais, setAnimais] = useState(() => memoData.animais ?? []);
  const [lotes, setLotes] = useState(() => memoData.lotes ?? []);
  const [carregando, setCarregando] = useState(() => !memoData.animais);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");
  const [offlineAviso, setOfflineAviso] = useState("");
  const [cfg, setCfg] = useState(null);
  const [loadingCfg, setLoadingCfg] = useState(true);
  const [userId, setUserId] = useState(null);
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [hoveredColKey, setHoveredColKey] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [animalSelecionado, setAnimalSelecionado] = useState(null);
  const [acaoMensagem, setAcaoMensagem] = useState("");

  const LOTE_TABLE = "lotes";

  useEffect(() => {
    const memo = MEMO_SECAGEM.data;
    if (memo?.animais === animais && memo?.lotes === lotes) return;
    MEMO_SECAGEM.data = { ...(memo || {}), animais, lotes };
    MEMO_SECAGEM.lastAt = Date.now();
  }, [animais, lotes]);

  const lotesById = useMemo(() => {
    const map = {};
    (lotes || []).forEach((lote) => {
      if (lote?.id == null) return;
      map[lote.id] = lote.nome ?? lote.descricao ?? lote.titulo ?? lote.label ?? String(lote.id);
    });
    return map;
  }, [lotes]);

  const carregarAnimais = useCallback(async () => {
    const [animaisRes, reproRes] = await Promise.all([
      withFazendaId(supabase.from("animais").select("*"), fazendaAtualId)
        .eq("ativo", true)
        .order("numero", { ascending: true }),
      supabase.from("v_repro_tabela").select("*").eq("fazenda_id", fazendaAtualId).order("numero", { ascending: true }),
    ]);

    if (animaisRes.error) throw animaisRes.error;
    if (reproRes.error) throw reproRes.error;
    const lista = Array.isArray(animaisRes.data) ? animaisRes.data : [];
    const reproLista = Array.isArray(reproRes.data) ? reproRes.data : [];
    const combinados = mesclarReproEmAnimais(lista, reproLista);
    setAnimais(combinados);
    return combinados;
  }, [fazendaAtualId]);

  const carregarLotes = useCallback(async () => {
    const { data, error } = await withFazendaId(supabase.from(LOTE_TABLE).select("*"), fazendaAtualId).order("id", { ascending: true });
    if (error) {
      console.error("Erro ao carregar lotes:", error);
      return [];
    }
    const lista = Array.isArray(data) ? data : [];
    setLotes(lista);
    return lista;
  }, [LOTE_TABLE, fazendaAtualId]);

  const carregarDoCache = useCallback(async () => {
    const cachePrimario = await kvGet(CACHE_KEY);
    const cacheFallback = cachePrimario ? null : await kvGet(CACHE_FALLBACK_KEY);
    const cache = cachePrimario ?? cacheFallback;
    if (!cache) return false;
    const lista = Array.isArray(cache) ? cache : Array.isArray(cache.animais) ? cache.animais : [];
    if (Array.isArray(lista)) {
      setAnimais(lista.filter((animal) => animal?.ativo !== false));
    }
    return lista.length > 0;
  }, [CACHE_FALLBACK_KEY, CACHE_KEY]);

  useEffect(() => {
    let ativo = true;
    async function carregarDados() {
      const memoFresh = MEMO_SECAGEM.data && Date.now() - MEMO_SECAGEM.lastAt < 30000;
      const hasData = (Array.isArray(animais) && animais.length > 0) || (Array.isArray(lotes) && lotes.length > 0);

      if (memoFresh && hasData) {
        setCarregando(false);
        setAtualizando(false);
        return;
      }

      if (hasData) setAtualizando(true);
      else setCarregando(true);
      
      setErro("");
      setOfflineAviso("");

      try {
        if (!isOnline) {
          const cacheOk = await carregarDoCache();
          if (!cacheOk) setOfflineAviso("Offline: sem dados salvos no computador");
          return;
        }

        if (!fazendaAtualId) throw new Error("Selecione uma fazenda para continuar.");
        if (!ativo) return;

        const [animaisData] = await Promise.all([carregarAnimais(), carregarLotes()]);
        await kvSet(CACHE_KEY, { animais: animaisData, updatedAt: new Date().toISOString() });
      } catch (e) {
        console.error("Erro ao carregar secagem:", e);
        if (!ativo) return;
        const cacheOk = await carregarDoCache();
        if (!cacheOk) setErro("Não foi possível carregar os animais. Sem dados offline ainda.");
      } finally {
        if (ativo) {
          setCarregando(false);
          setAtualizando(false);
        }
      }
    }
    carregarDados();
    return () => { ativo = false; };
  }, [carregarAnimais, carregarDoCache, carregarLotes, fazendaAtualId, isOnline]);

  useEffect(() => {
    let ativo = true;
    async function carregarConfig() {
      setLoadingCfg(true);
      const { data, error } = await supabase.auth.getUser();
      const uid = !error && data?.user?.id ? data.user.id : null;
      if (!ativo) return;
      setUserId(uid);
      if (!fazendaAtualId) setErro("Selecione uma fazenda para ajustar os parâmetros de secagem.");
      const cfgCarregada = await loadConfigManejo(uid, fazendaAtualId);
      if (!ativo) return;
      setCfg(cfgCarregada);
      setLoadingCfg(false);
    }
    carregarConfig();
    return () => { ativo = false; };
  }, [fazendaAtualId]);

  const diasAntes = cfg?.dias_antes_parto_para_secagem;
  const diasAviso = cfg?.dias_antecedencia_preparar_secagem;

  const linhasOrdenadas = useMemo(() => {
    if (loadingCfg || diasAntes == null) return [];
    const hoje = new Date();
    const janelaMax = addDays(hoje, 120);
    const base = Array.isArray(animais) ? animais : [];

    const filtrados = base
      .filter((animal) => {
        const delValor = Number(animal?.del);
        if (!Number.isFinite(delValor)) return false;
        const previsao = previsaoParto(animal);
        if (!previsao) return false;
        const dataSecagemIdeal = addDays(previsao, -Number(diasAntes));
        return dataSecagemIdeal <= janelaMax;
      })
      .map((animal) => {
        const previsao = previsaoParto(animal);
        const dataSecagemIdeal = previsao ? addDays(previsao, -Number(diasAntes)) : null;
        const diasParaParto = diffDias(previsao, hoje);
        const diasParaSecagem = diffDias(dataSecagemIdeal, hoje);
        return { animal, previsao, dataSecagemIdeal, diasParaParto, diasParaSecagem };
      });

    return filtrados.sort((a, b) => {
      const diffA = Math.abs(a.diasParaSecagem ?? 0);
      const diffB = Math.abs(b.diasParaSecagem ?? 0);
      return diffA - diffB;
    });
  }, [animais, diasAntes, loadingCfg]);

  const resumo = useMemo(() => {
    const total = linhasOrdenadas.length;
    const mediaParto = total > 0 ? linhasOrdenadas.reduce((acc, item) => acc + (item.diasParaParto ?? 0), 0) / total : null;
    const mediaSecagem = total > 0 ? linhasOrdenadas.reduce((acc, item) => acc + (item.diasParaSecagem ?? 0), 0) / total : null;
    return { total, mediaParto, mediaSecagem };
  }, [linhasOrdenadas]);

  const hasAnimais = linhasOrdenadas.length > 0;

  const abrirModal = (animal) => {
    setAnimalSelecionado(animal);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setAnimalSelecionado(null);
  };

  const registrarSecagem = async (payload) => {
    if (!animalSelecionado) return;
    setAcaoMensagem("");
    try {
      if (!fazendaAtualId) throw new Error("Selecione uma fazenda para registrar a secagem.");

      const evento = {
        animal_id: animalSelecionado.id,
        tipo: "SECAGEM",
        data_evento: payload.dataSecagem,
        observacoes: payload.observacoes || null,
        fazenda_id: fazendaAtualId,
      };

      const loteDestinoId = cfg?.lote_destino_secagem_id ?? null;

      if (!navigator.onLine) {
        await enqueue("repro_eventos.insert", evento);
        if (loteDestinoId) {
          const dataMudanca = new Date().toISOString().split("T")[0];
          await enqueue("animais_lote_historico.insert", {
            animal_id: animalSelecionado.id,
            lote_id: loteDestinoId,
            data_mudanca: dataMudanca,
            origem: "secagem",
            fazenda_id: fazendaAtualId,
          });
          await enqueue("animais.upsert", { id: animalSelecionado.id, lote_id: loteDestinoId, fazenda_id: fazendaAtualId });
        }
        setAcaoMensagem("✅ Secagem registrada offline. Será sincronizada ao reconectar.");
        fecharModal();
        return;
      }

      const { error } = await supabase.from("repro_eventos").insert(evento);
      if (error) throw error;

      if (loteDestinoId) {
        const dataMudanca = new Date().toISOString().split("T")[0];
        const { error: historicoError } = await supabase.from("animais_lote_historico").insert({
          animal_id: animalSelecionado.id,
          lote_id: loteDestinoId,
          data_mudanca: dataMudanca,
          origem: "secagem",
          fazenda_id: fazendaAtualId,
        });
        if (historicoError) throw historicoError;

        const { error: updateError } = await withFazendaId(
          supabase.from("animais").update({ lote_id: loteDestinoId }),
          fazendaAtualId
        ).eq("id", animalSelecionado.id);
        if (updateError) throw updateError;
      }

      setAcaoMensagem("✅ Secagem registrada com sucesso.");
      fecharModal();
    } catch (e) {
      console.error("Erro ao registrar secagem:", e);
      setAcaoMensagem("❌ Não foi possível registrar a secagem.");
    }
  };

  // Estilos modernos
  const styles = {
    page: { width: "100%", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
    
    card: { 
      backgroundColor: "#ffffff", 
      borderRadius: "16px", 
      border: "1px solid #e2e8f0", 
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)", 
      overflow: "hidden" 
    },
    
    header: { 
      padding: "24px 24px 0", 
      borderBottom: "1px solid #f1f5f9",
      marginBottom: "20px"
    },
    
    title: { 
      fontSize: "20px", 
      fontWeight: 700, 
      color: "#0f172a", 
      margin: "0 0 4px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    
    subtitle: { 
      fontSize: "14px", 
      color: "#64748b", 
      margin: "0 0 20px" 
    },

    configBar: {
      display: "flex",
      flexWrap: "wrap",
      gap: "20px",
      padding: "16px 24px",
      backgroundColor: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      alignItems: "flex-end"
    },

    configGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "6px"
    },

    configLabel: {
      fontSize: "12px",
      fontWeight: 600,
      color: "#475569",
      textTransform: "uppercase",
      letterSpacing: "0.05em"
    },

    configInput: {
      width: "80px",
      padding: "8px 12px",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 600,
      color: "#0f172a",
      textAlign: "center",
      backgroundColor: "#fff",
      outline: "none",
      transition: "all 0.2s",
      "&:focus": {
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
      }
    },

    hint: { 
      padding: "0 24px 16px", 
      fontSize: "13px", 
      color: "#64748b", 
      fontStyle: "italic" 
    },

    alert: { 
      padding: "12px 16px", 
      borderRadius: "8px", 
      margin: "0 24px 16px", 
      fontSize: "14px", 
      fontWeight: 500 
    },
    
    alertDanger: { 
      backgroundColor: "#fee2e2", 
      color: "#991b1b", 
      border: "1px solid #fecaca" 
    },
    
    alertWarn: { 
      backgroundColor: "#fef3c7", 
      color: "#92400e", 
      border: "1px solid #fde68a" 
    },

    alertSuccess: {
      backgroundColor: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0"
    },

    tableContainer: { 
      overflowX: "auto",
      padding: "0 24px 24px"
    },
    
    table: { 
      width: "100%", 
      borderCollapse: "separate", 
      borderSpacing: 0, 
      fontSize: "14px" 
    },
    
    th: { 
      padding: "14px 16px", 
      textAlign: "left", 
      fontSize: "11px", 
      fontWeight: 700, 
      color: "#475569", 
      textTransform: "uppercase", 
      letterSpacing: "0.05em", 
      borderBottom: "2px solid #e2e8f0", 
      backgroundColor: "#f8fafc", 
      whiteSpace: "nowrap",
      userSelect: "none"
    },
    
    td: { 
      padding: "14px 16px", 
      borderBottom: "1px solid #f1f5f9", 
      color: "#334155", 
      verticalAlign: "middle",
      transition: "background-color 0.15s ease"
    },

    tr: {
      transition: "background-color 0.15s ease",
      cursor: "default"
    },

    animalCell: { 
      display: "flex", 
      alignItems: "center", 
      gap: "12px" 
    },
    
    animalNum: { 
      width: "40px", 
      height: "40px", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      backgroundColor: "#fef3c7", // Amarelo suave para secagem
      color: "#92400e", 
      borderRadius: "10px", 
      fontWeight: 700, 
      fontSize: "14px", 
      flexShrink: 0 
    },
    
    animalInfo: { 
      display: "flex", 
      flexDirection: "column", 
      gap: "2px" 
    },
    
    animalTitle: { 
      fontWeight: 600, 
      color: "#0f172a", 
      fontSize: "14px" 
    },
    
    animalSub: { 
      fontSize: "13px", 
      color: "#64748b", 
      display: "flex", 
      alignItems: "center", 
      gap: "6px" 
    },
    
    dot: { 
      color: "#cbd5e1" 
    },

    pill: { 
      display: "inline-flex", 
      alignItems: "center", 
      padding: "4px 10px", 
      borderRadius: "9999px", 
      fontSize: "12px", 
      fontWeight: 600, 
      lineHeight: 1 
    },
    
    pillOk: { 
      backgroundColor: "#dcfce7", 
      color: "#166534" 
    },
    
    pillMute: { 
      backgroundColor: "#f1f5f9", 
      color: "#64748b" 
    },
    
    pillInfo: { 
      backgroundColor: "#dbeafe", 
      color: "#1e40af" 
    },

    pillWarn: {
      backgroundColor: "#fef3c7",
      color: "#92400e"
    },

    pillDanger: {
      backgroundColor: "#fee2e2",
      color: "#991b1b"
    },

    num: { 
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", 
      fontWeight: 600 
    },

    actionBtn: { 
      padding: "6px 12px", 
      backgroundColor: "#14b8a6", // Teal para manter identidade
      color: "#fff",
      border: "none",
      borderRadius: "6px", 
      fontSize: "13px", 
      fontWeight: 600, 
      cursor: "pointer", 
      transition: "all 0.2s",
      "&:hover": {
        backgroundColor: "#0d9488",
        transform: "translateY(-1px)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }
    },

    summaryRow: { 
      backgroundColor: "#f8fafc", 
      borderTop: "2px solid #e2e8f0" 
    },
    
    summaryContent: { 
      display: "flex", 
      gap: "32px", 
      padding: "16px", 
      fontSize: "13px", 
      color: "#475569", 
      fontWeight: 500 
    },
    
    summaryHighlight: { 
      color: "#0f172a", 
      fontWeight: 700 
    },

    loading: { 
      padding: "48px", 
      textAlign: "center", 
      color: "#64748b", 
      fontSize: "14px" 
    },

    emptyState: {
      padding: "48px",
      textAlign: "center",
      color: "#64748b",
      fontSize: "14px",
      fontWeight: 500
    }
  };

  const getStatusStyle = (diasParaSecagem, diasParaParto) => {
    if (diasParaSecagem != null && diasParaSecagem < 0) return styles.pillDanger; // Atrasada
    if (diasParaParto != null && diasParaParto <= diasAntes) return styles.pillOk; // Na hora
    if (diasParaParto != null && diasParaParto <= diasAntes + diasAviso && diasParaParto > diasAntes) return styles.pillWarn; // Preparar
    return styles.pillInfo; // Planejada
  };

  const getStatusLabel = (diasParaSecagem, diasParaParto) => {
    if (diasParaSecagem != null && diasParaSecagem < 0) return "Atrasada";
    if (diasParaParto != null && diasParaParto <= diasAntes) return "Na hora";
    if (diasParaParto != null && diasParaParto <= diasAntes + diasAviso && diasParaParto > diasAntes) return "Preparar";
    return "Planejada";
  };

  return (
    <section style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            <span>🥛</span>
            Gestão de Secagem
          </h2>
          <p style={styles.subtitle}>Controle de secagem e transição de lotes</p>
        </div>

        {/* Alertas */}
        {erro && <div style={{...styles.alert, ...styles.alertDanger}}>{erro}</div>}
        {offlineAviso && <div style={{...styles.alert, ...styles.alertWarn}}>{offlineAviso}</div>}
        {acaoMensagem && (
          <div style={{
            ...styles.alert, 
            ...(acaoMensagem.includes("✅") ? styles.alertSuccess : styles.alertDanger),
            marginBottom: "16px"
          }}>
            {acaoMensagem}
          </div>
        )}

        {/* Configurações */}
        {!loadingCfg && cfg && (
          <div style={styles.configBar}>
            <div style={styles.configGroup}>
              <label style={styles.configLabel}>Dias antes do parto</label>
              <input
                type="number"
                min={1}
                value={diasAntes}
                onChange={(e) => {
                  const val = Number(e.target.value || 0);
                  setCfg(prev => prev ? { ...prev, dias_antes_parto_para_secagem: val } : prev);
                  saveCfg(userId, fazendaAtualId, { dias_antes_parto_para_secagem: val });
                }}
                style={styles.configInput}
              />
            </div>
            
            <div style={styles.configGroup}>
              <label style={styles.configLabel}>Aviso prévio (dias)</label>
              <input
                type="number"
                min={0}
                value={diasAviso}
                onChange={(e) => {
                  const val = Number(e.target.value || 0);
                  setCfg(prev => prev ? { ...prev, dias_antecedencia_preparar_secagem: val } : prev);
                  saveCfg(userId, fazendaAtualId, { dias_antecedencia_preparar_secagem: val });
                }}
                style={styles.configInput}
              />
            </div>

            <div style={{marginLeft: "auto", fontSize: "13px", color: "#64748b"}}>
              Total na janela: <strong style={{color: "#0f172a"}}>{resumo.total}</strong> animais
            </div>
          </div>
        )}

        {atualizando && hasAnimais && (
          <div style={{padding: "16px 24px 0", fontSize: "13px", color: "#64748b"}}>
            Atualizando lista...
          </div>
        )}

        {/* Tabela */}
        <div style={styles.tableContainer}>
          <table 
            style={styles.table}
            onMouseLeave={() => { setHoveredRowId(null); setHoveredColKey(null); }}
          >
            <colgroup>
              <col style={{ width: "22%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "14%" }} />
            </colgroup>
            
            <thead>
              <tr>
                {[
                  { key: "animal", label: "Animal", width: "22%" },
                  { key: "lote", label: "Lote Atual", width: "14%" },
                  { key: "sitprod", label: "Sit. Produtiva", width: "12%", center: true },
                  { key: "previsao", label: "Previsão Parto", width: "14%", center: true },
                  { key: "dias", label: "Dias p/ Parto", width: "10%", center: true },
                  { key: "secagem", label: "Secagem Ideal", width: "14%", center: true },
                  { key: "status", label: "Status", width: "14%", center: true },
                ].map(col => (
                  <th 
                    key={col.key}
                    style={{
                      ...styles.th, 
                      textAlign: col.center ? "center" : "left",
                      width: col.width
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {linhasOrdenadas.length === 0 && !carregando && (
                <tr>
                  <td colSpan={7} style={styles.emptyState}>
                    Nenhum animal na janela de secagem.
                  </td>
                </tr>
              )}

              {linhasOrdenadas.map((item, idx) => {
                const { animal, previsao, dataSecagemIdeal, diasParaParto, diasParaSecagem } = item;
                const rowId = animal.id ?? animal.numero ?? animal.brinco ?? idx;
                const isHover = hoveredRowId === rowId;
                const sitProd = resolveSituacaoProdutiva(animal);
                const statusStyle = getStatusStyle(diasParaSecagem, diasParaParto);
                const statusLabel = getStatusLabel(diasParaSecagem, diasParaParto);

                return (
                  <tr 
                    key={rowId} 
                    style={{
                      ...styles.tr,
                      backgroundColor: isHover ? "#f8fafc" : "transparent"
                    }}
                  >
                    <td 
                      style={styles.td}
                      onMouseEnter={() => { setHoveredRowId(rowId); setHoveredColKey("animal"); }}
                    >
                      <div style={styles.animalCell}>
                        <div style={styles.animalNum}>{animal.numero ?? "—"}</div>
                        <div style={styles.animalInfo}>
                          <div style={styles.animalTitle}>
                            {animal?.raca_nome || "Vaca"} <span style={styles.dot}>•</span>{" "}
                            {animal?.sexo === "macho" ? "Macho" : animal?.sexo === "femea" ? "Fêmea" : "—"}
                          </div>
                          <div style={styles.animalSub}>
                            <span>Brinco {animal.brinco || "—"}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td 
                      style={styles.td}
                      onMouseEnter={() => { setHoveredRowId(rowId); setHoveredColKey("lote"); }}
                    >
                      {lotesById[animal?.lote_id] || <span style={{color: "#94a3b8", fontStyle: "italic"}}>Sem lote</span>}
                    </td>

                    <td 
                      style={{...styles.td, textAlign: "center"}}
                      onMouseEnter={() => { setHoveredRowId(rowId); setHoveredColKey("sitprod"); }}
                    >
                      <span style={{
                        ...styles.pill,
                        ...(sitProd === "lactante" ? styles.pillOk : sitProd === "seca" ? styles.pillWarn : styles.pillMute)
                      }}>
                        {sitProd === "lactante" ? "LACTANTE" : sitProd.toUpperCase()}
                      </span>
                    </td>

                    <td 
                      style={{...styles.td, textAlign: "center", fontWeight: 500}}
                      onMouseEnter={() => { setHoveredRowId(rowId); setHoveredColKey("previsao"); }}
                    >
                      {formatBR(previsao)}
                    </td>

                    <td 
                      style={{...styles.td, textAlign: "center", ...styles.num}}
                      onMouseEnter={() => { setHoveredRowId(rowId); setHoveredColKey("dias"); }}
                    >
                      {diasParaParto ?? "—"}
                    </td>

                    <td 
                      style={{...styles.td, textAlign: "center", fontWeight: 500}}
                      onMouseEnter={() => { setHoveredRowId(rowId); setHoveredColKey("secagem"); }}
                    >
                      {formatBR(dataSecagemIdeal)}
                    </td>

                    <td 
                      style={{...styles.td, textAlign: "center"}}
                      onMouseEnter={() => { setHoveredRowId(rowId); setHoveredColKey("status"); }}
                    >
                      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "8px"}}>
                        <span style={{...styles.pill, ...statusStyle}}>
                          {statusLabel}
                        </span>
                        <button 
                          style={styles.actionBtn}
                          onClick={() => abrirModal(animal)}
                        >
                          Registrar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {hasAnimais && (
              <tfoot>
                <tr style={styles.summaryRow}>
                  <td colSpan={7}>
                    <div style={styles.summaryContent}>
                      <span>Total exibidos: <span style={styles.summaryHighlight}>{resumo.total}</span></span>
                      <span>Média dias para parto: <span style={styles.summaryHighlight}>{Number.isFinite(resumo.mediaParto) ? Math.round(resumo.mediaParto) : "—"}</span></span>
                      <span>Média dias para secagem: <span style={styles.summaryHighlight}>{Number.isFinite(resumo.mediaSecagem) ? Math.round(resumo.mediaSecagem) : "—"}</span></span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {carregando && !hasAnimais && <div style={styles.loading}>Carregando...</div>}
      </div>

      {modalAberto && animalSelecionado && (
        <ModalRegistrarSecagem
          animal={animalSelecionado}
          onClose={fecharModal}
          onSave={registrarSecagem}
        />
      )}
    </section>
  );
}