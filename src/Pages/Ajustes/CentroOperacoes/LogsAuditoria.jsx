// src/Pages/Ajustes/CentroOperacoes/LogsAuditoria.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { supabase } from "../../../lib/supabaseClient";
import { useFazenda } from "../../../context/FazendaContext";

const BASE_LIMIT = 50;

const styles = {
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "#0f172a",
  },
  sectionSubtitle: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: 14,
  },
  tableSection: {
    marginTop: 0,
    padding: 0,
    overflow: "visible",
    borderRadius: 0,
    border: "none",
    boxShadow: "none",
    backgroundColor: "transparent",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
  },
  tableContainer: { overflowX: "auto" },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    fontSize: "14px",
    tableLayout: "fixed",
    minWidth: 1100,
  },
  th: {
    padding: "12px 12px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: 700,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "2px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    whiteSpace: "nowrap",
    userSelect: "none",
  },
  td: {
    padding: "12px 12px",
    borderBottom: "1px solid #f1f5f9",
    color: "#334155",
    fontSize: "14px",
    verticalAlign: "middle",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  tr: { transition: "background-color 0.15s ease", cursor: "default" },
  trHover: { backgroundColor: "#f8fafc" },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: 600,
    lineHeight: 1,
  },
  pillMute: { backgroundColor: "#f1f5f9", color: "#64748b" },
  userStack: { display: "flex", flexDirection: "column", gap: 2 },
  userName: { fontWeight: 600, color: "#0f172a" },
  userEmail: { fontSize: 12, color: "#64748b" },
  actionRow: { display: "flex", gap: 8, justifyContent: "flex-end" },
  actionBtn: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    fontSize: "12px",
    fontWeight: 700,
    color: "#1e293b",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  actionBtnPrimary: {
    background: "#eff6ff",
    borderColor: "#bfdbfe",
    color: "#1d4ed8",
  },
  actionBtnWarn: {
    background: "#fff7ed",
    borderColor: "#fed7aa",
    color: "#c2410c",
  },
  actionBtnDisabled: {
    background: "#f1f5f9",
    borderColor: "#e2e8f0",
    color: "#94a3b8",
    cursor: "not-allowed",
  },
  empty: { padding: "24px", textAlign: "center", color: "#64748b" },
  footer: { marginTop: 16, textAlign: "center", color: "#94a3b8", fontSize: 13 },
  footerButton: {
    background: "none",
    border: "none",
    color: "#3b82f6",
    cursor: "pointer",
    fontWeight: 600,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: 20,
  },
  modal: {
    background: "#ffffff",
    borderRadius: 16,
    width: "min(720px, 100%)",
    maxHeight: "85vh",
    overflow: "auto",
    boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.35)",
    border: "1px solid #e2e8f0",
  },
  modalHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" },
  modalBody: { padding: "16px 20px" },
  modalFooter: {
    padding: "12px 20px 20px",
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  },
  jsonBlock: {
    background: "#0f172a",
    color: "#e2e8f0",
    padding: 16,
    borderRadius: 12,
    fontSize: 12.5,
    whiteSpace: "pre-wrap",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  textarea: {
    width: "100%",
    minHeight: 90,
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    padding: 12,
    fontSize: 13,
    fontFamily: "inherit",
    color: "#0f172a",
  },
};

const resolveModuloPath = (modulo) => {
  const mod = String(modulo || "").toLowerCase();
  if (mod.includes("repro")) return "/reproducao";
  if (mod.includes("leite")) return "/leite";
  if (mod.includes("saude")) return "/saude";
  if (mod.includes("finance")) return "/financeiro";
  if (mod.includes("consumo") || mod.includes("estoque")) return "/consumo";
  if (mod.includes("animal")) return "/animais";
  return null;
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const buildResumo = (log) => {
  const resumo = String(log?.resumo || "").trim();
  if (resumo) return resumo;
  const acao = log?.acao ? String(log.acao) : "Ação";
  const modulo = log?.modulo ? ` – ${log.modulo}` : "";
  const animal = log?.animal_numero ? ` – animal ${log.animal_numero}` : "";
  return `${acao}${modulo}${animal}`;
};

export default function LogsAuditoria({ showHeader = true }) {
  const { fazendaAtualId } = useFazenda();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [limite, setLimite] = useState(BASE_LIMIT);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [modalLog, setModalLog] = useState(null);
  const [cancelLog, setCancelLog] = useState(null);
  const [cancelMotivo, setCancelMotivo] = useState("");
  const [cancelamentos, setCancelamentos] = useState({});

  useEffect(() => {
    const carregar = async () => {
      if (!fazendaAtualId) return;
      setCarregando(true);
      setErro("");
      const { data, error } = await supabase
        .from("audit_log")
        .select(
          [
            "id",
            "created_at",
            "modulo",
            "entidade",
            "acao",
            "registro_id",
            "animal_id",
            "animal_numero",
            "resumo",
            "actor_nome",
            "actor_email",
            "cancelavel",
            "cancelado_em",
            "diff",
            "meta",
          ].join(",")
        )
        .eq("fazenda_id", fazendaAtualId)
        .order("created_at", { ascending: false })
        .limit(limite);

      if (error) {
        console.error(error);
        setErro("Erro ao carregar logs de atividade.");
        setLogs([]);
      } else {
        setLogs(Array.isArray(data) ? data : []);
      }
      setCarregando(false);
    };

    carregar();
  }, [fazendaAtualId, limite]);

  useEffect(() => {
    if (!modalLog) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setModalLog(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalLog]);

  const resumoMap = useMemo(() => {
    const map = new Map();
    logs.forEach((log) => {
      map.set(log.id, buildResumo(log));
    });
    return map;
  }, [logs]);

  const handleEditar = (log) => {
    if (!log?.animal_numero) {
      toast.info("Abrir edição em breve");
      return;
    }
    const moduloPath = resolveModuloPath(log?.modulo) ?? "/animais";
    if (!moduloPath) {
      toast.info("Abrir edição em breve");
      return;
    }
    navigate(`${moduloPath}?animal=${encodeURIComponent(log.animal_numero)}`);
  };

  const handleCancelar = () => {
    if (!cancelLog) return;
    setCancelamentos((prev) => ({ ...prev, [cancelLog.id]: cancelMotivo }));
    toast.info("Cancelamento será implementado via RPC");
    setCancelLog(null);
    setCancelMotivo("");
  };

  const viewPayload = modalLog
    ? {
        ids: {
          id: modalLog.id,
          registro_id: modalLog.registro_id,
          animal_id: modalLog.animal_id,
          animal_numero: modalLog.animal_numero,
        },
        diff: modalLog.diff ?? null,
        meta: modalLog.meta ?? null,
      }
    : null;

  return (
    <div>
      {showHeader && (
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Logs de Atividade</h3>
          <p style={styles.sectionSubtitle}>
            Histórico completo de ações realizadas no sistema
          </p>
        </div>
      )}

      <section className="plantel-tabela-wrapper" style={styles.tableSection}>
        <div style={styles.card}>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {[
                    { key: "data", label: "Data/Hora", width: "140px" },
                    { key: "acao", label: "Ação" },
                    { key: "animal", label: "Animal", width: "120px" },
                    { key: "modulo", label: "Módulo", width: "140px" },
                    { key: "usuario", label: "Usuário", width: "200px" },
                    { key: "acoes", label: "Ações", width: "200px", align: "right" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      style={{
                        ...styles.th,
                        width: col.width,
                        textAlign: col.align || "left",
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {carregando && (
                  <tr>
                    <td style={{ ...styles.td, textAlign: "center" }} colSpan={6}>
                      Carregando logs...
                    </td>
                  </tr>
                )}
                {!carregando && erro && (
                  <tr>
                    <td style={{ ...styles.td, textAlign: "center" }} colSpan={6}>
                      {erro}
                    </td>
                  </tr>
                )}
                {!carregando && !erro && logs.length === 0 && (
                  <tr>
                    <td style={{ ...styles.td, textAlign: "center" }} colSpan={6}>
                      Nenhum log encontrado.
                    </td>
                  </tr>
                )}
                {!carregando && !erro &&
                  logs.map((log) => {
                    const resumo = resumoMap.get(log.id);
                    const isHovered = hoveredRowId === log.id;
                    const cancelado = Boolean(log.cancelado_em);
                    const cancelavel = Boolean(log.cancelavel) && !cancelado;
                    return (
                      <tr
                        key={log.id}
                        style={{ ...styles.tr, ...(isHovered ? styles.trHover : {}) }}
                        onMouseEnter={() => setHoveredRowId(log.id)}
                        onMouseLeave={() => setHoveredRowId(null)}
                      >
                        <td style={styles.td}>{formatDateTime(log.created_at)}</td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span>{resumo}</span>
                            {cancelado && (
                              <span style={{ ...styles.pill, ...styles.pillMute }}>
                                Cancelado
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ ...styles.td, fontFamily: "ui-monospace, monospace" }}>
                          {log.animal_numero ?? "—"}
                        </td>
                        <td style={styles.td}>{log.modulo ?? "—"}</td>
                        <td style={styles.td}>
                          <div style={styles.userStack}>
                            <span style={styles.userName}>{log.actor_nome ?? "—"}</span>
                            {log.actor_email && (
                              <span style={styles.userEmail}>{log.actor_email}</span>
                            )}
                          </div>
                        </td>
                        <td style={{ ...styles.td, textAlign: "right" }}>
                          <div style={styles.actionRow}>
                            <button
                              type="button"
                              style={{ ...styles.actionBtn, ...styles.actionBtnPrimary }}
                              onClick={() => setModalLog(log)}
                            >
                              Ver
                            </button>
                            <button
                              type="button"
                              style={styles.actionBtn}
                              onClick={() => handleEditar(log)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              style={{
                                ...styles.actionBtn,
                                ...styles.actionBtnWarn,
                                ...(cancelavel ? {} : styles.actionBtnDisabled),
                              }}
                              onClick={() => {
                                if (!cancelavel) return;
                                setCancelLog(log);
                                setCancelMotivo(cancelamentos[log.id] || "");
                              }}
                              disabled={!cancelavel}
                            >
                              Cancelar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div style={styles.footer}>
        Mostrando últimos {Math.min(limite, logs.length || 0)} registros •{" "}
        <button
          style={styles.footerButton}
          type="button"
          onClick={() => setLimite((prev) => prev * 2)}
        >
          Carregar mais
        </button>
      </div>

      {modalLog && (
        <div style={styles.modalOverlay} onClick={() => setModalLog(null)}>
          <div style={styles.modal} onClick={(event) => event.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h4 style={styles.modalTitle}>Detalhes do log</h4>
              <button
                type="button"
                style={styles.actionBtn}
                onClick={() => setModalLog(null)}
              >
                Fechar
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.jsonBlock}>
                {JSON.stringify(viewPayload, null, 2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {cancelLog && (
        <div style={styles.modalOverlay} onClick={() => setCancelLog(null)}>
          <div style={styles.modal} onClick={(event) => event.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h4 style={styles.modalTitle}>Motivo do cancelamento</h4>
              <button
                type="button"
                style={styles.actionBtn}
                onClick={() => setCancelLog(null)}
              >
                Fechar
              </button>
            </div>
            <div style={styles.modalBody}>
              <textarea
                style={styles.textarea}
                value={cancelMotivo}
                onChange={(event) => setCancelMotivo(event.target.value)}
                placeholder="Descreva o motivo do cancelamento..."
              />
            </div>
            <div style={styles.modalFooter}>
              <button type="button" style={styles.actionBtn} onClick={() => setCancelLog(null)}>
                Voltar
              </button>
              <button
                type="button"
                style={{ ...styles.actionBtn, ...styles.actionBtnWarn }}
                onClick={handleCancelar}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
