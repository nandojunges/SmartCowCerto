import { useCallback, useEffect, useMemo, useState } from "react";
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

const OCORRENCIAS = [
  "Metrite","Endometrite","Retenção de placenta","Mastite clínica","Mastite subclínica",
  "Cetose","Hipocalcemia (paresia pós-parto)","Deslocamento de abomaso","Acidose/Indigestão",
  "Pneumonia","Diarreia","Pododermatite/Lamíte","Anestro","Cisto folicular","Outro",
];

export default function OcorrenciaClinica({
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
  const [dataInicio, setDataInicio] = useState(todayBR());

  // protocolos saúde
  const [protocolosSaude, setProtocolosSaude] = useState([]);
  const [protocoloSelId, setProtocoloSelId] = useState("");
  const [carregandoProt, setCarregandoProt] = useState(false);

  // itens do protocolo selecionado
  const [itensProto, setItensProto] = useState([]);
  const [carregandoItens, setCarregandoItens] = useState(false);

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

  const carregarItensDoProtocolo = useCallback(async (protId) => {
    if (!fazendaAtualId || !protId) {
      setItensProto([]);
      return;
    }
    setCarregandoItens(true);
    try {
      const { data, error } = await supabase
        .from("saude_protocolo_itens")
        .select("id,dia,ordem,produto_id,produto_nome_snapshot,via,quantidade,unidade,carencia_leite_dias,carencia_carne_dias")
        .eq("fazenda_id", fazendaAtualId)
        .eq("protocolo_id", protId)
        .order("dia", { ascending: true })
        .order("ordem", { ascending: true });

      if (!error && Array.isArray(data)) setItensProto(data);
      else setItensProto([]);
    } finally {
      setCarregandoItens(false);
    }
  }, [fazendaAtualId]);

  const carregarProtocolos = useCallback(async (selecionarRecente = false) => {
    if (!fazendaAtualId) {
      setProtocolosSaude([]);
      setProtocoloSelId("");
      setItensProto([]);
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
          carregarItensDoProtocolo(id);
        }
      } else {
        setProtocolosSaude([]);
      }
    } finally {
      setCarregandoProt(false);
    }
  }, [carregarItensDoProtocolo, fazendaAtualId]);

  useEffect(() => {
    carregarProtocolos();
  }, [carregarProtocolos]);

  const handleProtocoloChange = async (opt) => {
    const selecionado = opt?.meta || null;
    const id = selecionado?.id ? String(selecionado.id) : "";
    setProtocoloSelId(id);

    if (!id) {
      setItensProto([]);
      return;
    }

    await carregarItensDoProtocolo(id);
  };

  const agendaPreview = useMemo(() => {
    if (!protocoloSelId || !itensProto?.length) return [];
    const base = parseBR(dataInicio);
    if (!base) return [];

    const grouped = itensProto.reduce((acc, item) => {
      const dia = Number(item?.dia) || 1;
      const dataPrevista = addDays(base, Math.max(0, dia - 1));
      const chave = toISODate(dataPrevista);
      if (!acc[chave]) {
        acc[chave] = { data: chave, dataBR: toBRDate(dataPrevista), itens: [] };
      }

      acc[chave].itens.push({
        id: item.id,
        produto_nome_snapshot: item.produto_nome_snapshot || "Produto",
        quantidade: item.quantidade,
        unidade: item.unidade,
        via: item.via,
      });

      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => a.data.localeCompare(b.data));
  }, [protocoloSelId, itensProto, dataInicio]);

  const salvar = () => {
    if (!oc) return alert("Escolha a ocorrência.");
    const base = parseBR(dataInicio);
    if (!base) return alert("Informe a Data do evento / Início (dd/mm/aaaa).");

    onSubmit?.({
      kind: "CLINICA",
      data_inicio: toISODate(base),
      doenca: oc,
      obs,
      protocolo_id: protocoloSelId || null,
      criarAgenda: !!protocoloSelId,
      baixarEstoque: false,
    });
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

          <InputGroup label="Data do evento / Início" icon={Icons.calendar} help="Obrigatória. Base para cálculo da agenda do protocolo.">
            <input
              value={dataInicio}
              onChange={(e) => setDataInicio(ensureBRMask(e.target.value))}
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
              help="Selecione para gerar automaticamente a agenda de aplicações."
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

      {/* SEÇÃO 3: PRÉVIA DE AGENDA (apenas se selecionou protocolo) */}
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
                {carregandoItens ? "Carregando etapas..." : `${agendaPreview.reduce((acc, dia) => acc + dia.itens.length, 0)} item(ns) a partir de ${dataInicio}`}
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
          ) : agendaPreview.length === 0 ? (
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
              {!itensProto.length
                ? <>Esse protocolo não tem itens cadastrados em <code>saude_protocolo_itens</code>.</>
                : <>Informe uma data de início válida para visualizar a agenda prevista.</>}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {agendaPreview.map((dia) => (
                <div
                  key={dia.data}
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
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: theme.colors.slate[800] }}>
                      📅 {dia.dataBR}
                    </div>
                    <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: theme.colors.slate[700], fontSize: 13 }}>
                      {dia.itens.map((item) => {
                        const qtd = item.quantidade != null ? String(item.quantidade).replace(".", ",") : "";
                        const un = item.unidade ? ` ${item.unidade}` : "";
                        const via = item.via ? ` • ${item.via}` : "";
                        return (
                          <li key={item.id}>
                            {item.produto_nome_snapshot}{qtd ? ` • ${qtd}${un}` : ""}{via}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

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
