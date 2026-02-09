// src/pages/Saude/ResumoSaudeCards.jsx
import React, { useMemo } from "react";

function safeLower(s) {
  return String(s ?? "").trim().toLowerCase();
}

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function safeTime(v) {
  if (!v) return null;
  const dt = new Date(v);
  const t = dt.getTime();
  return Number.isFinite(t) ? t : null;
}

/* =========================================================
   CARD COMPACTO (modo operacional)
========================================================= */
function CompactCard({ titulo, valor, subtitulo, tone = "info", carregando }) {
  const tones = {
    info: "#2563eb",
    ok: "#16a34a",
    warn: "#f59e0b",
    bad: "#ef4444",
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderLeft: `6px solid ${tones[tone] || tones.info}`,
        borderRadius: 12,
        padding: "10px 12px",
        minHeight: 78,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>{titulo}</div>

      <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", lineHeight: 1.1, marginTop: 2 }}>
        {carregando ? "—" : valor}
      </div>

      <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
        {carregando ? "Carregando..." : subtitulo}
      </div>
    </div>
  );
}

export default function ResumoSaudeCards({ carregando, tratamentos, aplicacoes, linhasTabela }) {
  const hoje0 = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const kpis = useMemo(() => {
    const tratArr = safeArray(tratamentos);
    const aplArr = safeArray(aplicacoes);
    const linhasArr = safeArray(linhasTabela);

    const totalTrat = tratArr.length;

    const emTrat = tratArr.filter((t) => safeLower(t?.status) === "ativo").length;
    const concl = tratArr.filter((t) => safeLower(t?.status) === "concluido").length;

    // incidência: doença mais frequente (ignorando vazios)
    const freq = new Map();
    for (const t of tratArr) {
      const k = String(t?.doenca ?? "").trim() || "Não informado";
      freq.set(k, (freq.get(k) || 0) + 1);
    }

    let topDoenca = "-";
    let topDoencaN = 0;
    for (const [k, v] of freq.entries()) {
      if (v > topDoencaN) {
        topDoencaN = v;
        topDoenca = k;
      }
    }

    // aplicações atrasadas (pelo que foi carregado em memória)
    const atrasadas = aplArr.filter((ap) => {
      const prev = safeTime(ap?.data_prevista);
      if (prev === null) return false;
      const done = Boolean(ap?.data_real) || safeLower(ap?.status) === "realizado";
      return prev < hoje0 && !done;
    }).length;

    // “animais em alerta” (atraso detectado na tabela)
    const alertas = linhasArr.filter((l) => Boolean(l?.isAtrasado)).length;

    const taxaConclusao = totalTrat ? Math.round((concl / totalTrat) * 100) : 0;

    return {
      totalTrat,
      emTrat,
      concl,
      topDoenca,
      topDoencaN,
      atrasadas,
      alertas,
      taxaConclusao,
    };
  }, [tratamentos, aplicacoes, linhasTabela, hoje0]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 10,
      }}
    >
      <CompactCard
        titulo="Tratamentos"
        valor={kpis.totalTrat}
        subtitulo={`Ativos: ${kpis.emTrat} • Concluídos: ${kpis.concl} • Conclusão: ${kpis.taxaConclusao}%`}
        tone="info"
        carregando={carregando}
      />

      <CompactCard
        titulo="Maior incidência"
        valor={kpis.topDoenca}
        subtitulo={kpis.topDoencaN ? `${kpis.topDoencaN} caso(s) no período` : "Sem registros suficientes"}
        tone={kpis.topDoencaN ? "ok" : "info"}
        carregando={carregando}
      />

      <CompactCard
        titulo="Aplicações atrasadas"
        valor={kpis.atrasadas}
        subtitulo={kpis.atrasadas ? "Revisar e registrar aplicações pendentes." : "Nenhuma pendência detectada."}
        tone={kpis.atrasadas ? "bad" : "ok"}
        carregando={carregando}
      />

      <CompactCard
        titulo="Animais em alerta"
        valor={kpis.alertas}
        subtitulo={kpis.alertas ? "Tratamentos com pendência antes de hoje." : "Sem alertas (pelo que foi carregado)."}
        tone={kpis.alertas ? "warn" : "ok"}
        carregando={carregando}
      />
    </div>
  );
}
