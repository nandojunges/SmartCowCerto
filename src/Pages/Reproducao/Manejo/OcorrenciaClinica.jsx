import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import { supabase } from "../../../lib/supabaseClient";
import { useFazenda } from "../../../context/FazendaContext";
import ModalTratamentoPadrao from "../../Saude/ModalTratamentoPadrao";

/* =========================================================
   DESIGN SYSTEM
   ========================================================= */
const theme = {
  colors: {
    slate: { 50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8", 500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b" },
    primary: { 50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8" },
    danger: { 50: "#fef2f2", 100: "#fee2e2", 200: "#fecaca", 600: "#dc2626", 700: "#b91c1c" },
    success: { 50: "#f0fdf4", 100: "#dcfce7", 600: "#16a34a" },
    warning: { 50: "#fffbeb", 100: "#fef3c7", 600: "#d97706" },
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  },
  radius: { sm: "6px", md: "8px", lg: "12px", xl: "16px", full: "999px" },
};

const Icons = {
  alert: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
};

/* =========================================================
   HELPERS
   ========================================================= */
const pad = (n) => String(n).padStart(2, "0");
const todayBR = () => new Date().toLocaleDateString("pt-BR");
const parseBR = (str) => {
  if (!str) return null;
  const [d, m, y] = String(str).split("/").map(Number);
  if (!d || !m || !y) return null;
  const dt = new Date(y, m - 1, d);
  return Number.isFinite(dt.getTime()) ? dt : null;
};
const toBRDate = (dt) => `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
const toISODate = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
const addDays = (dt, days) => {
  const d = new Date(dt.getTime());
  d.setDate(d.getDate() + days);
  return d;
};
const ensureBRMask = (v) => {
  const digits = String(v || "").replace(/\D/g, "").slice(0, 8);
  const d = digits.slice(0, 2);
  const m = digits.slice(2, 4);
  const y = digits.slice(4, 8);
  if (digits.length <= 2) return d;
  if (digits.length <= 4) return `${d}/${m}`;
  return `${d}/${m}/${y}`;
};

/* =========================================================
   UI
   ========================================================= */
const InputGroup = ({ label, children, icon: Icon, help }) => (
  <div style={{ marginBottom: "4px" }}>
    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 800, color: theme.colors.slate[500] }}>
      {Icon && <span style={{ color: theme.colors.slate[400] }}><Icon /></span>}
      {label}
    </label>
    {children}
    {help && <div style={{ marginTop: "4px", fontSize: "11px", color: theme.colors.slate[500] }}>{help}</div>}
  </div>
);

const Toggle = ({ checked, onChange, label, disabled }) => (
  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}>
    <div style={{ position: "relative", width: "40px", height: "22px" }}>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} style={{ opacity: 0, width: 0, height: 0 }} />
      <div style={{ position: "absolute", inset: 0, backgroundColor: checked ? theme.colors.primary[600] : theme.colors.slate[200], borderRadius: "22px", transition: "0.3s" }}>
        <div style={{ position: "absolute", height: "18px", width: "18px", left: checked ? "20px" : "2px", bottom: "2px", backgroundColor: "white", borderRadius: "50%", transition: "0.3s", boxShadow: theme.shadows.sm }} />
      </div>
    </div>
    <span style={{ fontSize: "13px", fontWeight: 700, color: theme.colors.slate[700] }}>{label}</span>
  </label>
);

const OCORRENCIAS = [
  "Metrite","Endometrite","Retenção de placenta","Mastite clínica","Mastite subclínica",
  "Cetose","Hipocalcemia (paresia pós-parto)","Deslocamento de abomaso","Acidose/Indigestão",
  "Pneumonia","Diarreia","Pododermatite/Lamíte","Anestro","Cisto folicular","Outro",
];

export default function OcorrenciaClinica({
  animal,
  onSubmit,
  showNovoProt: showNovoProtProp,
  onShowNovoProtChange,
}) {
  const { fazendaAtualId } = useFazenda();

  // controle do modal de criar protocolo (controlado ou local)
  const [localShowNovoProt, setLocalShowNovoProt] = useState(false);
  const isShowNovoProtControlled = typeof showNovoProtProp === "boolean";
  const showNovoProt = isShowNovoProtControlled ? showNovoProtProp : localShowNovoProt;
  const setShowNovoProt = (value) => {
    if (!isShowNovoProtControlled) setLocalShowNovoProt(value);
    onShowNovoProtChange?.(value);
  };

  // ocorrência
  const [oc, setOc] = useState("Metrite");
  const [obs, setObs] = useState("");

  // data de início (base do protocolo)
  const [dataInicioBR, setDataInicioBR] = useState(todayBR());

  // protocolos saúde
  const [protocolosSaude, setProtocolosSaude] = useState([]);
  const [protocoloSelId, setProtocoloSelId] = useState("");
  const [carregandoProt, setCarregandoProt] = useState(false);

  // itens do protocolo selecionado
  const [itensProtocolo, setItensProtocolo] = useState([]);
  const [carregandoItens, setCarregandoItens] = useState(false);

  // flags: só fazem sentido com protocolo selecionado
  const [agendar, setAgendar] = useState(true);
  const [baixarEstoque, setBaixarEstoque] = useState(true);

  const fetchedOnce = useRef(false);

  const protocoloOptions = useMemo(() => {
    return (protocolosSaude || []).map((p) => ({
      value: p.id,
      label: `${p.nome || "Protocolo"}${p.doenca ? ` (${p.doenca})` : ""}`,
      meta: p,
    }));
  }, [protocolosSaude]);

  const protocoloSelecionado = useMemo(
    () => (protocolosSaude || []).find((p) => String(p.id) === String(protocoloSelId)) || null,
    [protocolosSaude, protocoloSelId]
  );

  const carregarProtocolos = useCallback(async (selecionarRecente = false) => {
    if (!fazendaAtualId) {
      setProtocolosSaude([]);
      setProtocoloSelId("");
      setItensProtocolo([]);
      return;
    }
    setCarregandoProt(true);
    try {
      const { data, error } = await supabase
        .from("saude_protocolos")
        .select("*")
        .eq("fazenda_id", fazendaAtualId)
        .eq("ativo", true)
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        setProtocolosSaude(data);
        if (selecionarRecente && data.length > 0) {
          const id = String(data[0].id);
          setProtocoloSelId(id);
        }
      } else {
        setProtocolosSaude([]);
      }
    } finally {
      setCarregandoProt(false);
    }
  }, [fazendaAtualId]);

  const carregarItensDoProtocolo = useCallback(async (protId) => {
    if (!fazendaAtualId || !protId) {
      setItensProtocolo([]);
      return;
    }
    setCarregandoItens(true);
    try {
      const { data, error } = await supabase
        .from("saude_protocolo_itens")
        .select("*")
        .eq("fazenda_id", fazendaAtualId)
        .eq("protocolo_id", protId)
        .order("dia", { ascending: true })
        .order("ordem", { ascending: true });

      if (!error && Array.isArray(data)) setItensProtocolo(data);
      else setItensProtocolo([]);
    } finally {
      setCarregandoItens(false);
    }
  }, [fazendaAtualId]);

  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    carregarProtocolos();
  }, [carregarProtocolos]);

  // quando muda protocolo, busca itens
  useEffect(() => {
    if (!protocoloSelId) {
      setItensProtocolo([]);
      return;
    }
    carregarItensDoProtocolo(protocoloSelId);
  }, [protocoloSelId, carregarItensDoProtocolo]);

  const handleProtocoloChange = (opt) => {
    const selecionado = opt?.meta || null;
    const id = selecionado?.id ? String(selecionado.id) : "";
    setProtocoloSelId(id);
    // se limpou seleção, desliga efeitos
    if (!id) {
      setItensProtocolo([]);
    }
  };

  // monta o “cronograma previsto” a partir da dataInicioBR + itens (dia)
  const cronograma = useMemo(() => {
    if (!protocoloSelId || !itensProtocolo?.length) return [];
    const base = parseBR(dataInicioBR) || new Date();

    return itensProtocolo.map((it, idx) => {
      const diaRaw = Number(it.dia);
      // regra prática: no seu exemplo, dia=1 deve virar D0 (mesmo dia da data início)
      const offset = Number.isFinite(diaRaw) ? Math.max(0, diaRaw - 1) : 0;

      const dataPrev = addDays(base, offset);
      const dataPrevBR = toBRDate(dataPrev);

      const produto = it.produto_nome_snapshot || "Produto";
      const qtd = (it.quantidade != null ? String(it.quantidade) : "").replace(".", ",");
      const un = it.unidade || "";
      const via = it.via ? ` • ${it.via}` : "";

      return {
        idx,
        protocolo_item_id: it.id,
        produto_id: it.produto_id || null,
        produto_nome_snapshot: it.produto_nome_snapshot || null,
        via: it.via || null,
        quantidade: it.quantidade != null ? Number(it.quantidade) : null,
        unidade: it.unidade || null,
        data_prevista_date: toISODate(dataPrev),
        data_prevista_br: dataPrevBR,
        label: `${produto}${qtd ? ` • ${qtd} ${un}` : ""}${via}`,
        diaOffset: offset,
      };
    });
  }, [protocoloSelId, itensProtocolo, dataInicioBR]);

  // se não tem protocolo, força regras: não agenda e não baixa
  useEffect(() => {
    if (!protocoloSelId) {
      setAgendar(false);
      setBaixarEstoque(false);
    } else {
      // quando seleciona um protocolo, liga por padrão (você pode mudar isso aqui se quiser)
      setAgendar(true);
      setBaixarEstoque(true);
    }
  }, [protocoloSelId]);

  const salvar = () => {
    if (!oc) return alert("Escolha a ocorrência.");
    const base = parseBR(dataInicioBR);
    if (!base) return alert("Informe a Data de início (dd/mm/aaaa).");

    // payload “limpo” pro pai gravar nas tabelas novas
    const payload = {
      kind: "CLINICA",
      animal_id: animal?.id,
      doenca: oc,
      observacao: obs || null,
      data_inicio: toISODate(base), // -> saude_tratamentos.data_inicio
      protocolo_id: protocoloSelId || null, // -> saude_tratamentos.protocolo_id
      criarAgenda: !!(protocoloSelId && agendar),
      baixarEstoque: !!(protocoloSelId && baixarEstoque),
      // -> saude_aplicacoes (somente se tiver protocolo)
      aplicacoes: protocoloSelId
        ? cronograma.map((c) => ({
            data_prevista: c.data_prevista_date,
            protocolo_item_id: c.protocolo_item_id,
            produto_id: c.produto_id,
            produto_nome_snapshot: c.produto_nome_snapshot,
            via: c.via,
            quantidade: c.quantidade,
            unidade: c.unidade,
            status: "pendente",
          }))
        : [],
    };

    onSubmit?.(payload);
  };

  return (
    <form
      id="form-CLINICA"
      onSubmit={(e) => {
        e.preventDefault();
        salvar();
      }}
      style={{ display: "flex", flexDirection: "column", gap: "24px" }}
    >
      {/* SEÇÃO 1: DADOS DA OCORRÊNCIA */}
      <div
        style={{
          padding: "24px",
          background: "#fff",
          borderRadius: theme.radius.xl,
          border: `1px solid ${theme.colors.slate[200]}`,
          boxShadow: theme.shadows.sm,
        }}
      >
        <h3
          style={{
            margin: "0 0 16px 0",
            fontSize: "12px",
            fontWeight: 900,
            color: theme.colors.slate[600],
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Icons.alert /> Dados da Ocorrência
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "20px" }}>
          <InputGroup label="Tipo de Ocorrência" icon={() => <span>🏥</span>}>
            <Select
              styles={{
                control: (b, s) => ({
                  ...b,
                  minHeight: 44,
                  borderRadius: theme.radius.md,
                  borderColor: s.isFocused ? theme.colors.primary[500] : theme.colors.slate[200],
                  boxShadow: s.isFocused ? `0 0 0 3px ${theme.colors.primary[100]}` : "none",
                }),
                menuPortal: (b) => ({ ...b, zIndex: 9999 }),
              }}
              options={OCORRENCIAS.map((o) => ({ value: o, label: o }))}
              value={{ value: oc, label: oc }}
              onChange={(opt) => setOc(opt?.value || "Metrite")}
              menuPortalTarget={document.body}
            />
          </InputGroup>

          <InputGroup label="Data de início" icon={Icons.calendar} help="Base do protocolo (D0). Sem protocolo, é a data do registro.">
            <input
              value={dataInicioBR}
              onChange={(e) => setDataInicioBR(ensureBRMask(e.target.value))}
              placeholder="dd/mm/aaaa"
              inputMode="numeric"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: theme.radius.md,
                border: `1px solid ${theme.colors.slate[200]}`,
                fontSize: "14px",
                fontFamily: "monospace",
              }}
            />
          </InputGroup>

          <InputGroup label="Observações Gerais" icon={() => <span>📝</span>} help="Sintomas, histórico, condições do animal">
            <input
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Descreva os sintomas observados, histórico clínico recente..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: theme.radius.md,
                border: `1px solid ${theme.colors.slate[200]}`,
                fontSize: "14px",
              }}
            />
          </InputGroup>
        </div>
      </div>

      {/* SEÇÃO 2: PROTOCOLO TERAPÊUTICO */}
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "end" }}>
          <div>
            <InputGroup
              label="Protocolo terapêutico (opcional)"
              icon={() => <span>📋</span>}
              help="Selecione para gerar automaticamente o cronograma (sem seleção, não agenda e não baixa estoque)."
            >
              <Select
                styles={{
                  control: (b, s) => ({
                    ...b,
                    minHeight: 44,
                    borderRadius: theme.radius.md,
                    borderColor: s.isFocused ? theme.colors.primary[500] : theme.colors.slate[200],
                    boxShadow: s.isFocused ? `0 0 0 3px ${theme.colors.primary[100]}` : "none",
                  }),
                  menuPortal: (b) => ({ ...b, zIndex: 9999 }),
                }}
                options={protocoloOptions}
                value={
                  protocoloSelecionado
                    ? {
                        value: protocoloSelecionado.id,
                        label: `${protocoloSelecionado.nome || "Protocolo"}${protocoloSelecionado.doenca ? ` (${protocoloSelecionado.doenca})` : ""}`,
                        meta: protocoloSelecionado,
                      }
                    : null
                }
                onChange={handleProtocoloChange}
                placeholder={carregandoProt ? "Carregando protocolos..." : "Selecione um protocolo"}
                isClearable
                isLoading={carregandoProt}
                noOptionsMessage={() => (carregandoProt ? "Carregando..." : "Nenhum protocolo cadastrado")}
                menuPortalTarget={document.body}
              />
            </InputGroup>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => setShowNovoProt(true)}
              style={{
                padding: "10px 14px",
                fontSize: "12px",
                fontWeight: 800,
                color: theme.colors.primary[700],
                background: theme.colors.primary[50],
                border: `1px solid ${theme.colors.primary[200]}`,
                borderRadius: theme.radius.md,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              + Criar protocolo
            </button>
          </div>
        </div>
      </div>

      {/* SEÇÃO 3: CRONOGRAMA (apenas se selecionou protocolo) */}
      {protocoloSelId ? (
        <div
          style={{
            padding: "24px",
            background: "#fff",
            borderRadius: theme.radius.xl,
            border: `1px solid ${theme.colors.slate[200]}`,
            boxShadow: theme.shadows.sm,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: theme.colors.slate[800] }}>Cronograma Previsto</div>
              <div style={{ fontSize: 12, color: theme.colors.slate[500], marginTop: 4 }}>
                {carregandoItens ? "Carregando etapas..." : `${cronograma.length} etapa(s) a partir de ${dataInicioBR}`}
              </div>
            </div>

            <div
              style={{
                padding: "6px 12px",
                borderRadius: theme.radius.full,
                background: theme.colors.primary[50],
                border: `1px solid ${theme.colors.primary[200]}`,
                color: theme.colors.primary[700],
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              Protocolo: {protocoloSelecionado?.nome || "—"}
            </div>
          </div>

          {carregandoItens ? (
            <div style={{ padding: 16, color: theme.colors.slate[500] }}>Carregando itens do protocolo…</div>
          ) : cronograma.length === 0 ? (
            <div
              style={{
                padding: 16,
                borderRadius: theme.radius.lg,
                background: theme.colors.warning[50],
                border: `1px solid ${theme.colors.warning[100]}`,
                color: theme.colors.warning[600],
                fontWeight: 800,
              }}
            >
              Esse protocolo não tem itens cadastrados em <code>saude_protocolo_itens</code>.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cronograma.map((c) => (
                <div
                  key={c.protocolo_item_id}
                  style={{
                    borderRadius: theme.radius.lg,
                    border: `1px solid ${theme.colors.slate[200]}`,
                    background: theme.colors.slate[50],
                    padding: "14px 16px",
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: theme.colors.primary[600],
                      color: "white",
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {c.idx + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: theme.colors.slate[800] }}>
                      Etapa {c.idx + 1} <span style={{ fontWeight: 700, color: theme.colors.slate[500] }}>(D+{c.diaOffset})</span>
                    </div>
                    <div style={{ marginTop: 4, fontSize: 13, color: theme.colors.slate[700] }}>{c.label}</div>
                    <div style={{ marginTop: 6, fontSize: 12, color: theme.colors.slate[500] }}>
                      📅 {c.data_prevista_br}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FLAGS */}
          <div
            style={{
              marginTop: 16,
              padding: "16px",
              borderRadius: theme.radius.xl,
              background: theme.colors.slate[50],
              border: `1px solid ${theme.colors.slate[200]}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", gap: "24px" }}>
              <Toggle checked={agendar} onChange={(e) => setAgendar(e.target.checked)} label="Criar tarefas no calendário" />
              <Toggle checked={baixarEstoque} onChange={(e) => setBaixarEstoque(e.target.checked)} label="Baixar do estoque automaticamente" />
            </div>
          </div>
        </div>
      ) : (
        // sem protocolo: mantém visual “ok”, mas deixa claro o comportamento
        <div
          style={{
            padding: "20px 24px",
            background: theme.colors.slate[50],
            borderRadius: theme.radius.xl,
            border: `1px solid ${theme.colors.slate[200]}`,
            color: theme.colors.slate[600],
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Sem protocolo selecionado: <span style={{ color: theme.colors.slate[800] }}>não</span> será criado cronograma, <span style={{ color: theme.colors.slate[800] }}>não</span> agenda e <span style={{ color: theme.colors.slate[800] }}>não</span> baixa estoque. A ocorrência será registrada mesmo assim.
        </div>
      )}

      {/* MODAL CRIAR PROTOCOLO (Saúde) */}
      <ModalTratamentoPadrao
        open={showNovoProt}
        onClose={() => setShowNovoProt(false)}
        onSaved={() => {
          setShowNovoProt(false);
          // recarrega e seleciona o mais recente
          carregarProtocolos(true);
        }}
        initialDoenca={oc}
        sugestoesDoencas={OCORRENCIAS.map((o) => ({ value: o, label: o }))}
      />
    </form>
  );
}
