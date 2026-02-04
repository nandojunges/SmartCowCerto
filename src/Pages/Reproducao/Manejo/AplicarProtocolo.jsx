import { useEffect, useMemo, useState } from "react";
import Select from "react-select";

/* =========================================================
   DESIGN SYSTEM (consistente com o modal que criamos)
   ========================================================= */
const theme = {
  colors: {
    slate: { 50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8", 500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a" },
    primary: { 50: "#eff6ff", 100: "#dbeafe", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8" },
    warning: { 50: "#fffbeb", 100: "#fef3c7", 500: "#f59e0b", 600: "#d97706" },
    success: { 50: "#ecfdf5", 500: "#10b981", 600: "#059669" },
    danger: { 50: "#fef2f2", 500: "#ef4444", 600: "#dc2626" },
  },
  shadows: { sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)", md: "0 4px 6px -1px rgb(0 0 0 / 0.1)", lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)" },
  radius: { sm: "6px", md: "8px", lg: "12px", xl: "16px" },
};

const Icons = {
  calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  syringe: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m10 17-5 5"/><path d="m14 14-2 2"/></svg>,
  check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  alert: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  arrowRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
};

/* =========================================================
   HELPERS (mantidos do original)
   ========================================================= */
const todayBR = () => new Date().toLocaleDateString("pt-BR");
const pad2 = (n) => String(n).padStart(2, "0");
const nowHM = () => {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

const getProtoId = (p) => p?.id ?? p?.uuid ?? p?.ID ?? p?.codigo ?? "";
const getAnimalId = (a) => a?.id ?? a?.uuid ?? a?.animal_id ?? a?.cow_id ?? a?.ID ?? a?.codigo ?? "";

function isValidBRDate(s) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(String(s || ""))) return false;
  const [dd, mm, yyyy] = String(s).split("/").map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  return d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd;
}

function brToISO(s) {
  if (!isValidBRDate(s)) return null;
  const [dd, mm, yyyy] = s.split("/").map(Number);
  return `${yyyy}-${pad2(mm)}-${pad2(dd)}`;
}

function addDaysBR(s, days) {
  if (!isValidBRDate(s)) return null;
  const [dd, mm, yyyy] = s.split("/").map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  d.setDate(d.getDate() + Number(days || 0));
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function addDaysISOFromISO(iso, days) {
  const m = /^\d{4}-\d{2}-\d{2}$/.exec(String(iso || ""));
  if (!m) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (isNaN(d)) return null;
  d.setDate(d.getDate() + Number(days || 0));
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/* =========================================================
   SUB-COMPONENTES UI
   ========================================================= */

const InputGroup = ({ label, children, error, icon: Icon }) => (
  <div style={{ marginBottom: "20px" }}>
    <label style={{
      display: "flex", alignItems: "center", gap: "6px",
      fontSize: "12px", fontWeight: 700, color: theme.colors.slate[700],
      textTransform: "uppercase", letterSpacing: "0.05em",
      marginBottom: "8px",
    }}>
      {Icon && <span style={{ color: theme.colors.slate[400] }}><Icon /></span>}
      {label}
    </label>
    {children}
    {error && (
      <div style={{
        marginTop: "6px", fontSize: "12px", color: theme.colors.danger[600],
        display: "flex", alignItems: "center", gap: "4px",
      }}>
        <Icons.alert /> {error}
      </div>
    )}
  </div>
);

const TextInput = ({ value, onChange, placeholder, type = "text", hasError }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={{
      width: "100%", padding: "10px 14px", fontSize: "14px",
      borderRadius: theme.radius.md,
      border: `1px solid ${hasError ? theme.colors.danger[300] : theme.colors.slate[200]}`,
      backgroundColor: "#fff", color: theme.colors.slate[800],
      outline: "none", transition: "all 0.2s",
      boxShadow: hasError ? `0 0 0 3px ${theme.colors.danger[50]}` : "none",
      ":focus": {
        borderColor: theme.colors.primary[500],
        boxShadow: `0 0 0 3px ${theme.colors.primary[100]}`,
      },
    }}
  />
);

const CardEtapa = ({ etapa, index, isFirst, isLast }) => (
  <div style={{
    display: "flex", gap: "16px", position: "relative",
    opacity: isFirst ? 1 : 0.9,
  }}>
    {/* Linha conectora */}
    {!isLast && (
      <div style={{
        position: "absolute", left: "20px", top: "48px", bottom: "-16px",
        width: "2px", background: `linear-gradient(to bottom, ${theme.colors.primary[200]}, ${theme.colors.slate[200]})`,
      }} />
    )}
    
    {/* Círculo/Dia */}
    <div style={{
      width: "40px", height: "40px", borderRadius: "50%",
      background: isFirst ? theme.colors.primary[600] : "#fff",
      color: isFirst ? "#fff" : theme.colors.slate[600],
      border: `2px solid ${isFirst ? theme.colors.primary[600] : theme.colors.slate[200]}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "12px", fontWeight: 800, flexShrink: 0,
      zIndex: 1, boxShadow: theme.shadows.sm,
    }}>
      D{etapa.offset}
    </div>
    
    {/* Conteúdo */}
    <div style={{
      flex: 1, padding: "12px 16px", background: "#fff",
      borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.slate[200]}`,
      boxShadow: theme.shadows.sm, marginBottom: "12px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
        <span style={{ fontWeight: 700, color: theme.colors.slate[800], fontSize: "14px" }}>
          {etapa.descricao}
        </span>
        <span style={{
          fontSize: "11px", fontWeight: 700, color: theme.colors.primary[600],
          background: theme.colors.primary[50], padding: "2px 8px",
          borderRadius: theme.radius.full,
        }}>
          {etapa.hora}
        </span>
      </div>
      
      <div style={{ fontSize: "13px", color: theme.colors.slate[500], display: "flex", alignItems: "center", gap: "6px" }}>
        <Icons.calendar />
        {etapa.dataPrevista || "Data inválida"}
        {etapa.hormonio && (
          <span style={{ marginLeft: "8px", color: theme.colors.slate[400] }}>
            • {etapa.hormonio} {etapa.dose && `(${etapa.dose})`}
          </span>
        )}
      </div>
    </div>
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
    <div style={{ position: "relative", width: "44px", height: "24px" }}>
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={onChange}
        style={{ opacity: 0, width: 0, height: 0 }}
      />
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: checked ? theme.colors.primary[600] : theme.colors.slate[200],
        borderRadius: "24px", transition: "0.3s",
        ":before": {
          content: '""', position: "absolute", height: "18px", width: "18px",
          left: checked ? "22px" : "4px", bottom: "3px",
          backgroundColor: "white", borderRadius: "50%", transition: "0.3s",
          boxShadow: theme.shadows.sm,
        }
      }} />
    </div>
    <span style={{ fontSize: "14px", fontWeight: 600, color: theme.colors.slate[700] }}>
      {label}
    </span>
  </label>
);

/* =========================================================
   COMPONENTE PRINCIPAL - VERSÃO PROFISSIONAL
   ========================================================= */

const tipoOptions = [
  { value: "IATF", label: "IATF - Inseminação em Tempo Fixo", color: theme.colors.primary[600] },
  { value: "PRESYNC", label: "Pré-sincronização", color: theme.colors.warning[600] },
];

const selectStyles = {
  control: (base, state) => ({
    ...base, minHeight: 42, borderRadius: theme.radius.md,
    borderColor: state.isFocused ? theme.colors.primary[500] : theme.colors.slate[200],
    boxShadow: state.isFocused ? `0 0 0 3px ${theme.colors.primary[100]}` : "none",
    "&:hover": { borderColor: theme.colors.primary[400] }, fontSize: 14,
  }),
  option: (base, state) => ({
    ...base, 
    backgroundColor: state.isSelected ? theme.colors.primary[50] : state.isFocused ? theme.colors.slate[50] : "white",
    color: state.isSelected ? theme.colors.primary[900] : theme.colors.slate[700],
    fontWeight: state.isSelected ? 600 : 400,
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

export default function AplicarProtocolo({ animal, protocolos = [], onSubmit }) {
  const [tipo, setTipo] = useState("IATF");
  const [protId, setProtId] = useState("");
  const [dataInicio, setDataInicio] = useState(todayBR());
  const [horaInicio, setHoraInicio] = useState(nowHM());
  const [criarAgenda, setCriarAgenda] = useState(true);
  const [erro, setErro] = useState("");
  const [touched, setTouched] = useState({});

  // Reset protocolo ao mudar tipo
  useEffect(() => {
    setProtId("");
    setErro("");
  }, [tipo]);

  const opcoes = useMemo(() => {
    const t = String(tipo || "").toUpperCase();
    return (protocolos || []).filter((p) => {
      const tp = String(p?.tipo || "").toUpperCase();
      return t === "IATF" ? tp === "IATF" : tp !== "IATF";
    });
  }, [protocolos, tipo]);

  const protSel = useMemo(() => 
    opcoes.find((p) => getProtoId(p) === protId) || null,
  [opcoes, protId]);

  // Validação em tempo real
  useEffect(() => {
    if (!touched.data) return;
    if (dataInicio && !isValidBRDate(dataInicio)) {
      setErro("Data inválida. Use formato dd/mm/aaaa");
    } else if (touched.hora && !/^\d{2}:\d{2}$/.test(horaInicio)) {
      setErro("Hora inválida. Use formato HH:mm");
    } else {
      setErro("");
    }
  }, [dataInicio, horaInicio, touched]);

  const etapasResumo = useMemo(() => {
    const ets = Array.isArray(protSel?.etapas) ? protSel.etapas : [];
    return ets.map((et, i) => {
      const offset = Number.isFinite(+et?.dia) ? +et.dia : i === 0 ? 0 : i;
      const hora = et?.hora || horaInicio;
      const descricao = et?.descricao || et?.acao || `Etapa ${i + 1}`;
      const dataPrevista = addDaysBR(dataInicio, offset);
      return { idx: i + 1, offset, hora, descricao, dataPrevista, hormonio: et?.hormonio, dose: et?.dose };
    });
  }, [protSel, horaInicio, dataInicio]);

  const protocoloOptions = useMemo(() => 
    opcoes.map((p) => ({ value: getProtoId(p), label: p.nome, data: p })),
  [opcoes]);

  const selectedTipoOption = useMemo(() => 
    tipoOptions.find((o) => o.value === tipo) || tipoOptions[0],
  [tipo]);

  const montarEtapasPayload = (dataBaseISO) => {
    const ets = Array.isArray(protSel?.etapas) ? protSel.etapas : [];
    if (!criarAgenda || ets.length === 0) return [];
    return ets.map((et, i) => {
      const offset = Number.isFinite(+et?.dia) ? +et.dia : i === 0 ? 0 : i;
      const dataISO = addDaysISOFromISO(dataBaseISO, offset) || dataBaseISO;
      return {
        data: dataISO,
        dia: offset,
        descricao: et?.descricao ?? null,
        acao: et?.acao ?? null,
        hormonio: et?.hormonio ?? null,
        dose: et?.dose ?? null,
        via: et?.via ?? null,
        obs: et?.obs ?? null,
        hora: et?.hora || horaInicio,
      };
    });
  };

  const handleSubmit = () => {
    setTouched({ data: true, hora: true, protocolo: true });
    
    if (!getAnimalId(animal)) return setErro("Animal inválido (sem identificador).");
    if (!protId) return setErro("Escolha um protocolo.");
    if (!isValidBRDate(dataInicio)) return setErro("Data de início inválida.");
    if (!/^\d{2}:\d{2}$/.test(horaInicio)) return setErro("Hora inválida.");

    const aId = String(getAnimalId(animal));
    const dataISO = brToISO(dataInicio) || dataInicio;
    const etapas = montarEtapasPayload(dataISO);

    onSubmit?.({
      kind: "PROTOCOLO",
      animal_id: aId,
      protocolo_id: protId,
      tipo,
      data: dataISO,
      etapas,
      detalhes: {},
      parent_aplicacao_id: null,
      dataInicio,
      horaInicio,
      criarAgenda,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* SEÇÃO: CONFIGURAÇÃO BÁSICA */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "20px",
        padding: "24px", background: "#fff", borderRadius: theme.radius.xl,
        border: `1px solid ${theme.colors.slate[200]}`, boxShadow: theme.shadows.sm,
      }}>
        <div style={{ gridColumn: "span 4" }}>
          <InputGroup label="Tipo de Protocolo" icon={() => <span>🏷️</span>}>
            <Select
              styles={selectStyles}
              options={tipoOptions}
              value={selectedTipoOption}
              onChange={(opt) => setTipo(opt?.value || "IATF")}
              isClearable={false}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              formatOptionLabel={(opt) => (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ 
                    width: "8px", height: "8px", borderRadius: "50%", 
                    background: opt.color 
                  }} />
                  {opt.label}
                </div>
              )}
            />
          </InputGroup>
        </div>

        <div style={{ gridColumn: "span 8" }}>
          <InputGroup 
            label="Protocolo" 
            error={touched.protocolo && !protId ? "Selecione um protocolo" : null}
            icon={() => <span>📋</span>}
          >
            <Select
              styles={selectStyles}
              options={protocoloOptions}
              value={protocoloOptions.find(o => o.value === protId) || null}
              onChange={(opt) => setProtId(opt?.value || "")}
              placeholder={opcoes.length ? "Busque e selecione o protocolo..." : "Nenhum protocolo disponível"}
              isClearable
              isSearchable
              isDisabled={!opcoes.length}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              noOptionsMessage={() => "Nenhum protocolo encontrado"}
            />
          </InputGroup>
        </div>

        <div style={{ gridColumn: "span 3" }}>
          <InputGroup 
            label="Data de Início" 
            icon={Icons.calendar}
            error={touched.data && dataInicio && !isValidBRDate(dataInicio) ? "Formato inválido" : null}
          >
            <TextInput
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              placeholder="dd/mm/aaaa"
              hasError={touched.data && !isValidBRDate(dataInicio)}
            />
          </InputGroup>
        </div>

        <div style={{ gridColumn: "span 3" }}>
          <InputGroup 
            label="Horário Padrão" 
            icon={Icons.clock}
            error={touched.hora && horaInicio && !/^\d{2}:\d{2}$/.test(horaInicio) ? "Formato HH:mm" : null}
          >
            <TextInput
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              placeholder="HH:mm"
              hasError={touched.hora && !/^\d{2}:\d{2}$/.test(horaInicio)}
            />
          </InputGroup>
        </div>

        <div style={{ gridColumn: "span 6", display: "flex", alignItems: "flex-end", paddingBottom: "20px" }}>
          <Toggle 
            checked={criarAgenda} 
            onChange={(e) => setCriarAgenda(e.target.checked)}
            label="Criar agenda automática das etapas"
          />
        </div>
      </div>

      {/* SEÇÃO: TIMELINE DE ETAPAS */}
      {protSel && criarAgenda && (
        <div style={{
          padding: "24px", background: theme.colors.slate[50], 
          borderRadius: theme.radius.xl, border: `1px solid ${theme.colors.slate[200]}`,
        }}>
          <div style={{ 
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "20px", paddingBottom: "16px", borderBottom: `1px solid ${theme.colors.slate[200]}`,
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: theme.colors.slate[800] }}>
                Cronograma Previsto
              </h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: theme.colors.slate[500] }}>
                {etapasResumo.length} etapas calculadas a partir de {dataInicio}
              </p>
            </div>
            <div style={{
              padding: "6px 12px", background: "#fff", borderRadius: theme.radius.md,
              fontSize: "12px", fontWeight: 700, color: theme.colors.primary[600],
              border: `1px solid ${theme.colors.primary[200]}`,
            }}>
              Duração: {etapasResumo[etapasResumo.length - 1]?.offset || 0} dias
            </div>
          </div>

          {etapasResumo.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "40px", color: theme.colors.slate[400],
              background: "#fff", borderRadius: theme.radius.lg, border: `1px dashed ${theme.colors.slate[300]}`,
            }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📋</div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>Nenhuma etapa cadastrada</div>
              <div style={{ fontSize: "13px", marginTop: "4px" }}>Este protocolo não possui etapas definidas.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {etapasResumo.map((etapa, idx) => (
                <CardEtapa 
                  key={idx} 
                  etapa={etapa} 
                  index={idx}
                  isFirst={idx === 0}
                  isLast={idx === etapasResumo.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ERRO GLOBAL */}
      {erro && (
        <div style={{
          padding: "16px", background: theme.colors.danger[50],
          border: `1px solid ${theme.colors.danger[200]}`, borderRadius: theme.radius.lg,
          display: "flex", alignItems: "center", gap: "12px", color: theme.colors.danger[600],
        }}>
          <Icons.alert />
          <span style={{ fontSize: "14px", fontWeight: 600 }}>{erro}</span>
        </div>
      )}

      {/* BOTÃO AÇÃO */}
      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "8px" }}>
        <button
          onClick={handleSubmit}
          disabled={!protId}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "12px 28px", fontSize: "15px", fontWeight: 700,
            color: "#fff", background: !protId ? theme.colors.slate[300] : theme.colors.primary[600],
            border: "none", borderRadius: theme.radius.lg, cursor: !protId ? "not-allowed" : "pointer",
            boxShadow: !protId ? "none" : `0 4px 12px ${theme.colors.primary[600]}40`,
            transition: "all 0.2s",
            ":hover": !protId ? {} : { background: theme.colors.primary[700], transform: "translateY(-1px)" },
          }}
        >
          <Icons.syringe />
          Aplicar Protocolo
          <Icons.arrowRight />
        </button>
      </div>
    </div>
  );
}