import React, { useEffect, useState } from "react";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  padding: 12,
};

const modalStyle = {
  background: "#fff",
  width: "min(540px, 92vw)",
  borderRadius: 16,
  boxShadow: "0 0 24px rgba(15,23,42,0.35)",
  overflow: "hidden",
  fontFamily: "Poppins, sans-serif",
};

const headerStyle = {
  padding: "16px 20px",
  borderBottom: "1px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  fontWeight: 700,
  fontSize: "1.05rem",
  color: "#0f172a",
};

const closeButtonStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  color: "#0f172a",
  padding: "6px 12px",
  borderRadius: "999px",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: 600,
};

const inputStyle = {
  width: "100%",
  minHeight: 40,
  borderRadius: 10,
  border: "1px solid #d1d5db",
  padding: "8px 12px",
  fontSize: 14,
  fontFamily: "inherit",
};

export default function RegistrarParto({ open, onClose, animal, onSaved }) {
  const [dataParto, setDataParto] = useState("");
  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    if (!open) return;
    setDataParto(new Date().toISOString().slice(0, 10));
    setObservacao("");
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const numero = animal?.numero ?? "";
  const brinco = animal?.brinco ?? "";
  const hasAnimalInfo = numero || brinco;

  return (
    <div style={overlayStyle} onMouseDown={onClose}>
      <div style={modalStyle} onMouseDown={(event) => event.stopPropagation()}>
        <div style={headerStyle}>
          <span>Registrar Parto</span>
          <button type="button" onClick={onClose} style={closeButtonStyle}>
            Fechar
          </button>
        </div>

        <div style={{ padding: 20, display: "grid", gap: 14 }}>
          {hasAnimalInfo && (
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
              Animal: #{numero || "—"} — Brinco {brinco || "—"}
            </div>
          )}

          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600 }}>
            Data do parto
            <input
              type="date"
              value={dataParto}
              onChange={(event) => setDataParto(event.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600 }}>
            Observação
            <textarea
              rows={3}
              value={observacao}
              onChange={(event) => setObservacao(event.target.value)}
              style={{ ...inputStyle, minHeight: 90 }}
            />
          </label>
        </div>

        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          <button type="button" onClick={onClose} style={closeButtonStyle}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onSaved?.({ dataParto, observacao });
              onClose?.();
            }}
            style={{
              ...closeButtonStyle,
              background: "#16a34a",
              borderColor: "#16a34a",
              color: "#fff",
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
