// src/pages/Saude/Saude.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Select from "react-select";
import { supabase } from "../../lib/supabaseClient";

import "../../styles/tabelamoderna.css";
import "../../styles/botoes.css";

import ResumoSaudeCards from "./ResumoSaudeCards";
import ModalTratamentoPadrao from "./ModalTratamentoPadrao";
import AbaProtocolosSaude from "./AbaProtocolosSaude";
import AbaAgendaSaude from "./AbaAgendaSaude";

/* ===================== CONFIG ===================== */
const STICKY_OFFSET = 48;
const AUTO_RELOAD_DEBOUNCE_MS = 350;

const rsStyles = {
  container: (b) => ({ ...b, width: "100%" }),
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    height: 44,
    borderRadius: 10,
    borderColor: state.isFocused ? "#2563eb" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : "none",
    fontSize: 14,
    backgroundColor: "#f9fafb",
    ":hover": { borderColor: "#2563eb" },
  }),
  valueContainer: (b) => ({ ...b, padding: "0 12px" }),
  indicatorsContainer: (b) => ({ ...b, height: 44 }),
  menuPortal: (b) => ({ ...b, zIndex: 99999 }),
};

const STATUS_OPCOES = [
  { value: "todos", label: "Todos" },
  { value: "ativo", label: "Em tratamento" },
  { value: "concluido", label: "Concluídos" },
  { value: "atrasado", label: "Atrasados" },
];

const ESPECIES_DOENCAS_BASE = [
  "Mastite",
  "Metrite",
  "Retenção de placenta",
  "Cetose",
  "Hipocalcemia",
  "Pneumonia",
  "Diarreia",
  "Podal/Claudicação",
  "Ferida/Trauma",
  "Outro",
].map((d) => ({ value: d, label: d }));

/* ===================== helpers ===================== */
function pad2(n) {
  return String(n).padStart(2, "0");
}
function toISODateInput(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function isoToBR(iso) {
  if (!iso) return "";
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return "";
  return `${pad2(dt.getDate())}/${pad2(dt.getMonth() + 1)}/${dt.getFullYear()}`;
}
function startOfDayISO(dateInputYYYYMMDD) {
  const d = new Date(`${dateInputYYYYMMDD}T00:00:00`);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function endOfDayISO(dateInputYYYYMMDD) {
  const d = new Date(`${dateInputYYYYMMDD}T00:00:00`);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export default function Saude() {
  const hoje = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [carregando, setCarregando] = useState(true);

  // sub-abas
  const [abaAtiva, setAbaAtiva] = useState("geral"); // geral | agenda | protocolos

  // filtros
  const [dtIni, setDtIni] = useState(
    toISODateInput(new Date(hoje.getFullYear(), hoje.getMonth(), 1))
  );
  const [dtFim, setDtFim] = useState(toISODateInput(hoje));
  const [statusSel, setStatusSel] = useState(STATUS_OPCOES[1]); // ativo
  const [doencaSel, setDoencaSel] = useState({
    value: "todas",
    label: "Todas as doenças",
  });

  // dados
  const [animais, setAnimais] = useState([]);
  const [tratamentos, setTratamentos] = useState([]);
  const [aplicacoes, setAplicacoes] = useState([]);
  const [protocolos, setProtocolos] = useState([]);

  // modal protocolo
  const [openProtocolo, setOpenProtocolo] = useState(false);

  // hover coluna
  const [hoverCol, setHoverCol] = useState(null);

  // evita condição de corrida
  const reqSeq = useRef(0);

  const doencasOpcoes = useMemo(() => {
    const dinamicas = Array.from(
      new Set(tratamentos.map((t) => (t.doenca || "").trim()).filter(Boolean))
    ).map((d) => ({ value: d, label: d }));

    const mix = [...dinamicas, ...ESPECIES_DOENCAS_BASE];

    const uniq = [];
    const seen = new Set();
    for (const it of mix) {
      const key = (it.value || "").toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      uniq.push(it);
    }
    return [{ value: "todas", label: "Todas as doenças" }, ...uniq];
  }, [tratamentos]);

  const carregarTudo = useCallback(async () => {
    const mySeq = ++reqSeq.current;
    setCarregando(true);

    const iniISO = startOfDayISO(dtIni);
    const fimISO = endOfDayISO(dtFim);

    // 1) animais
    let animaisData = [];
    try {
      const { data, error } = await supabase
        .from("animais")
        .select("id, numero, brinco, raca_id, categoria, situacao_produtiva, ativo")
        .order("numero", { ascending: true });

      if (!error && Array.isArray(data)) animaisData = data;
    } catch {}

    // 2) tratamentos
    let tratData = [];
    try {
      const { data, error } = await supabase
        .from("saude_tratamentos")
        .select(
          "id, animal_id, doenca, protocolo_id, status, data_inicio, data_fim, responsavel_id, observacao, created_at"
        )
        .gte("data_inicio", iniISO)
        .lte("data_inicio", fimISO)
        .order("data_inicio", { ascending: false });

      if (!error && Array.isArray(data)) tratData = data;
    } catch {}

    // 3) aplicações
    let aplData = [];
    try {
      const { data, error } = await supabase
        .from("saude_aplicacoes")
        .select("id, tratamento_id, animal_id, data_prevista, data_real, produto, dose, via, status")
        .gte("data_prevista", iniISO)
        .lte("data_prevista", fimISO)
        .order("data_prevista", { ascending: true });

      if (!error && Array.isArray(data)) aplData = data;
    } catch {}

    // 4) protocolos
    let protData = [];
    try {
      const { data, error } = await supabase
        .from("saude_protocolos")
        .select(
          "id, nome, doenca, duracao_dias, ultimo_dia, carencia_leite_dias_max, carencia_carne_dias_max, itens, created_at"
        )
        .order("nome", { ascending: true });

      if (!error && Array.isArray(data)) protData = data;
    } catch {}

    if (mySeq !== reqSeq.current) return;

    setAnimais(animaisData);
    setTratamentos(tratData);
    setAplicacoes(aplData);
    setProtocolos(protData);

    setCarregando(false);
  }, [dtIni, dtFim]);

  useEffect(() => {
    carregarTudo();
  }, [carregarTudo]);

  useEffect(() => {
    const t = setTimeout(() => {
      carregarTudo();
    }, AUTO_RELOAD_DEBOUNCE_MS);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dtIni, dtFim, statusSel?.value, doencaSel?.value]);

  /* ===================== visões derivadas ===================== */
  const animaisMap = useMemo(() => {
    const m = new Map();
    for (const a of animais) m.set(a.id, a);
    return m;
  }, [animais]);

  const aplicacoesPorTrat = useMemo(() => {
    const m = new Map();
    for (const ap of aplicacoes) {
      const key = ap.tratamento_id;
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(ap);
    }
    for (const [k, arr] of m.entries()) {
      arr.sort((x, y) => new Date(x.data_prevista) - new Date(y.data_prevista));
      m.set(k, arr);
    }
    return m;
  }, [aplicacoes]);

  const protocolosMap = useMemo(() => {
    const m = new Map();
    for (const p of protocolos) m.set(p.id, p);
    return m;
  }, [protocolos]);

  const agora = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const tratamentosFiltrados = useMemo(() => {
    let arr = [...tratamentos];

    if (statusSel?.value && statusSel.value !== "todos") {
      if (statusSel.value === "atrasado") {
        arr = arr.filter((t) => {
          const aps = aplicacoesPorTrat.get(t.id) || [];
          return aps.some((ap) => {
            const prev = new Date(ap.data_prevista).getTime();
            const done = ap.data_real || ap.status === "realizado";
            return prev < agora && !done;
          });
        });
      } else {
        arr = arr.filter(
          (t) => (t.status || "").toLowerCase() === statusSel.value
        );
      }
    }

    if (doencaSel?.value && doencaSel.value !== "todas") {
      const alvo = (doencaSel.value || "").toLowerCase();
      arr = arr.filter((t) => (t.doenca || "").toLowerCase() === alvo);
    }

    return arr;
  }, [tratamentos, statusSel, doencaSel, aplicacoesPorTrat, agora]);

  const linhasTabela = useMemo(() => {
    return tratamentosFiltrados.map((t) => {
      const a = animaisMap.get(t.animal_id);
      const prot = t.protocolo_id ? protocolosMap.get(t.protocolo_id) : null;

      const aps = aplicacoesPorTrat.get(t.id) || [];
      const proxima =
        aps.find((ap) => !(ap.data_real || ap.status === "realizado")) || null;

      const atrasado = aps.some((ap) => {
        const prev = new Date(ap.data_prevista).getTime();
        const done = ap.data_real || ap.status === "realizado";
        return prev < agora && !done;
      });

      return {
        ...t,
        animalNumero: a?.numero ?? "-",
        animalBrinco: a?.brinco ?? "-",
        protocoloNome: prot?.nome ?? (t.protocolo_id ? "Protocolo" : "-"),
        proximaData: proxima?.data_prevista || null,
        proximoProduto: proxima?.produto || "-",
        proximaVia: proxima?.via || "-",
        isAtrasado: atrasado,
        fimCarenciaISO: null,
      };
    });
  }, [tratamentosFiltrados, animaisMap, protocolosMap, aplicacoesPorTrat, agora]);

  const agendaProximas = useMemo(() => {
    const hojeISO = startOfDayISO(toISODateInput(new Date()));
    const future = aplicacoes
      .filter((ap) => {
        const done = ap.data_real || ap.status === "realizado";
        return !done && new Date(ap.data_prevista).toISOString() >= hojeISO;
      })
      .sort((a, b) => new Date(a.data_prevista) - new Date(b.data_prevista))
      .slice(0, 20)
      .map((ap) => {
        const a = animaisMap.get(ap.animal_id);
        return {
          ...ap,
          animalNumero: a?.numero ?? "-",
          animalBrinco: a?.brinco ?? "-",
        };
      });

    const groups = new Map();
    for (const item of future) {
      const key = isoToBR(item.data_prevista);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }
    return Array.from(groups.entries()).map(([dia, items]) => ({ dia, items }));
  }, [aplicacoes, animaisMap]);

  /* ===================== ações ===================== */
  const marcarAplicacaoComoRealizada = useCallback(
    async (ap) => {
      try {
        const now = new Date().toISOString();
        await supabase
          .from("saude_aplicacoes")
          .update({ data_real: now, status: "realizado" })
          .eq("id", ap.id);
        carregarTudo();
      } catch {}
    },
    [carregarTudo]
  );

  const encerrarTratamento = useCallback(
    async (tratamentoId) => {
      try {
        await supabase
          .from("saude_tratamentos")
          .update({ status: "concluido", data_fim: new Date().toISOString() })
          .eq("id", tratamentoId);

        carregarTudo();
      } catch {}
    },
    [carregarTudo]
  );

  /* ===================== UI helpers ===================== */
  const thStyle = useMemo(
    () => ({
      position: "sticky",
      top: STICKY_OFFSET,
      zIndex: 3,
    }),
    []
  );

  const inputDateStyle = {
    width: "100%",
    height: 44,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    padding: "0 12px",
    background: "#f9fafb",
    fontSize: 14,
    boxSizing: "border-box",
  };

  const TabBtn = ({ id, label }) => {
    const ativo = abaAtiva === id;
    return (
      <button
        className={ativo ? "botao-acao" : "botao-cancelar"}
        onClick={() => setAbaAtiva(id)}
        style={{ height: 38, padding: "0 12px", borderRadius: 12 }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ padding: "12px 18px 24px" }}>
      {/* Cabeçalho */}
      <div style={{ marginTop: 4 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 260 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                margin: 0,
                color: "#0f172a",
              }}
            >
              Saúde
            </div>
            <div style={{ marginTop: 4, color: "#64748b", fontSize: 13 }}>
              Acompanhe tratamentos em andamento, agenda de aplicações e padrões
              de protocolos para reutilização.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <TabBtn id="geral" label="Geral" />
            <TabBtn id="agenda" label="Agenda" />
            <TabBtn id="protocolos" label="Protocolos" />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ marginTop: 12 }}>
        <ResumoSaudeCards
          carregando={carregando}
          tratamentos={tratamentosFiltrados}
          aplicacoes={aplicacoes}
          linhasTabela={linhasTabela}
        />
      </div>

      {/* Filtros */}
      {abaAtiva !== "protocolos" ? (
        <div
          style={{
            marginTop: 12,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
              alignItems: "end",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "#334155", marginBottom: 6, fontWeight: 700 }}>
                Início
              </div>
              <input
                type="date"
                value={dtIni}
                onChange={(e) => setDtIni(e.target.value)}
                style={inputDateStyle}
              />
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#334155", marginBottom: 6, fontWeight: 700 }}>
                Fim
              </div>
              <input
                type="date"
                value={dtFim}
                onChange={(e) => setDtFim(e.target.value)}
                style={inputDateStyle}
              />
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#334155", marginBottom: 6, fontWeight: 700 }}>
                Status
              </div>
              <Select
                value={statusSel}
                onChange={setStatusSel}
                options={STATUS_OPCOES}
                styles={rsStyles}
                menuPortalTarget={document.body}
              />
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#334155", marginBottom: 6, fontWeight: 700 }}>
                Doença
              </div>
              <Select
                value={doencaSel}
                onChange={setDoencaSel}
                options={doencasOpcoes}
                styles={rsStyles}
                menuPortalTarget={document.body}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                className="botao-editar"
                onClick={() => {
                  setDtIni(toISODateInput(new Date(hoje.getFullYear(), hoje.getMonth(), 1)));
                  setDtFim(toISODateInput(hoje));
                  setStatusSel(STATUS_OPCOES[1]);
                  setDoencaSel({ value: "todas", label: "Todas as doenças" });
                }}
                style={{ height: 44 }}
              >
                Limpar filtros
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Conteúdo por aba */}
      <div style={{ marginTop: 12 }}>
        {abaAtiva === "geral" ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 12,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 900, color: "#0f172a" }}>Animais em tratamento</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {carregando ? "Carregando..." : `${linhasTabela.length} registro(s) no período`}
              </div>
            </div>

            <div style={{ marginTop: 8, overflowX: "auto" }}>
              <table className="tabela-padrao">
                <thead>
                  <tr>
                    <th
                      style={thStyle}
                      className={hoverCol === "animal" ? "coluna-hover" : ""}
                      onMouseEnter={() => setHoverCol("animal")}
                      onMouseLeave={() => setHoverCol(null)}
                    >
                      Animal
                    </th>
                    <th
                      style={thStyle}
                      className={hoverCol === "doenca" ? "coluna-hover" : ""}
                      onMouseEnter={() => setHoverCol("doenca")}
                      onMouseLeave={() => setHoverCol(null)}
                    >
                      Doença
                    </th>
                    <th
                      style={thStyle}
                      className={hoverCol === "inicio" ? "coluna-hover" : ""}
                      onMouseEnter={() => setHoverCol("inicio")}
                      onMouseLeave={() => setHoverCol(null)}
                    >
                      Início
                    </th>
                    <th
                      style={thStyle}
                      className={hoverCol === "proxima" ? "coluna-hover" : ""}
                      onMouseEnter={() => setHoverCol("proxima")}
                      onMouseLeave={() => setHoverCol(null)}
                    >
                      Próx. aplicação
                    </th>
                    <th
                      style={thStyle}
                      className={hoverCol === "protocolo" ? "coluna-hover" : ""}
                      onMouseEnter={() => setHoverCol("protocolo")}
                      onMouseLeave={() => setHoverCol(null)}
                    >
                      Protocolo
                    </th>
                    <th style={thStyle} className="coluna-acoes">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {!carregando && linhasTabela.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 14, color: "#64748b" }}>
                        Nenhum tratamento encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : null}

                  {linhasTabela.map((t) => (
                    <tr key={t.id} style={t.isAtrasado ? { borderLeft: "4px solid #ef4444" } : undefined}>
                      <td className={hoverCol === "animal" ? "coluna-hover" : ""}>
                        <div style={{ fontWeight: 900 }}>
                          #{t.animalNumero}{" "}
                          <span style={{ fontWeight: 700, color: "#64748b" }}>
                            {t.animalBrinco && t.animalBrinco !== "-" ? `• ${t.animalBrinco}` : ""}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          Status:{" "}
                          <span style={{ fontWeight: 800, color: t.isAtrasado ? "#ef4444" : "#334155" }}>
                            {t.isAtrasado ? "Atrasado" : t.status || "-"}
                          </span>
                        </div>
                      </td>

                      <td className={hoverCol === "doenca" ? "coluna-hover" : ""}>
                        <div style={{ fontWeight: 800 }}>{t.doenca || "-"}</div>
                        {t.observacao ? (
                          <div style={{ fontSize: 12, color: "#64748b", maxWidth: 240 }} title={t.observacao}>
                            {t.observacao}
                          </div>
                        ) : null}
                      </td>

                      <td className={hoverCol === "inicio" ? "coluna-hover" : ""}>
                        {isoToBR(t.data_inicio)}
                      </td>

                      <td className={hoverCol === "proxima" ? "coluna-hover" : ""}>
                        {t.proximaData ? (
                          <>
                            <div style={{ fontWeight: 900 }}>{isoToBR(t.proximaData)}</div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>
                              {t.proximoProduto} {t.proximaVia !== "-" ? `• ${t.proximaVia}` : ""}
                            </div>
                          </>
                        ) : (
                          <span style={{ color: "#64748b" }}>Sem pendências</span>
                        )}
                      </td>

                      <td className={hoverCol === "protocolo" ? "coluna-hover" : ""}>
                        <div style={{ fontWeight: 900 }}>{t.protocoloNome}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {t.data_fim ? `Fim: ${isoToBR(t.data_fim)}` : "Em curso"}
                        </div>
                      </td>

                      <td className="coluna-acoes">
                        <div className="botoes-tabela">
                          {t.proximaData ? (
                            <button
                              className="botao-editar"
                              onClick={() => {
                                const aps = aplicacoesPorTrat.get(t.id) || [];
                                const prox = aps.find((ap) => !(ap.data_real || ap.status === "realizado"));
                                if (prox) marcarAplicacaoComoRealizada(prox);
                              }}
                              title="Marcar próxima aplicação como realizada"
                            >
                              Aplicado
                            </button>
                          ) : null}

                          {(t.status || "").toLowerCase() !== "concluido" ? (
                            <button
                              className="botao-cancelar pequeno"
                              onClick={() => encerrarTratamento(t.id)}
                              title="Encerrar tratamento"
                            >
                              Encerrar
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 900 }}>OK</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                Dica: o status <b>“Atrasado”</b> é calculado por aplicação prevista anterior a hoje e ainda não marcada como realizada.
              </div>
            </div>
          </div>
        ) : null}

        {abaAtiva === "agenda" ? (
          <AbaAgendaSaude
            carregando={carregando}
            agendaProximas={agendaProximas}
            marcarAplicacaoComoRealizada={marcarAplicacaoComoRealizada}
          />
        ) : null}

        {abaAtiva === "protocolos" ? (
          <AbaProtocolosSaude
            carregando={carregando}
            protocolos={protocolos}
            onNovo={() => setOpenProtocolo(true)}
            onAtualizar={carregarTudo}
          />
        ) : null}
      </div>

      {/* MODAL: CADASTRAR PROTOCOLO PADRÃO */}
      <ModalTratamentoPadrao
        open={openProtocolo}
        onClose={() => setOpenProtocolo(false)}
        onSaved={() => {
          setOpenProtocolo(false);
          carregarTudo();
          setAbaAtiva("protocolos");
        }}
        sugestoesDoencas={doencasOpcoes}
      />
    </div>
  );
}
