import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function formatarData(data) {
  if (!data) return null;
  const parsed = new Date(data);
  if (Number.isNaN(parsed.getTime())) return data;
  return parsed.toLocaleDateString("pt-BR");
}

function statusAnimal(animal) {
  return animal?.status || animal?.situacao_produtiva || animal?.categoria || "Sem status";
}

function navegarAcao(navigate, rota, animal) {
  navigate(rota, { state: { animalId: animal?.id, animal } });
}

export default function AnimalMobileResumo({ animal, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!animal) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [animal, onClose]);

  if (!animal) return null;

  return (
    <div style={overlayStyle} onClick={onClose} role="presentation">
      <section style={sheetStyle} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} style={closeButtonStyle} aria-label="Fechar resumo">
          ×
        </button>

        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <strong style={{ display: "block", fontSize: 15, color: "#0f172a", marginBottom: 6 }}>Resumo</strong>
            <div style={{ display: "grid", gap: 6, fontSize: 13, color: "#334155" }}>
              <div>
                <strong>Animal:</strong> #{animal.numero || "-"}
                {animal.nome ? ` • ${animal.nome}` : ""}
              </div>
              <div>
                <strong>Status:</strong> {statusAnimal(animal)}
              </div>
              {animal.del ? (
                <div>
                  <strong>DEL:</strong> {animal.del}
                </div>
              ) : null}
              {animal.repro_status ? (
                <div>
                  <strong>Repro:</strong> {animal.repro_status}
                </div>
              ) : null}
              {animal.ultima_ia_data ? (
                <div>
                  <strong>Última IA:</strong> {formatarData(animal.ultima_ia_data)}
                </div>
              ) : null}
              {animal.dias_prenhez ? (
                <div>
                  <strong>Dias prenhez:</strong> {animal.dias_prenhez}
                </div>
              ) : null}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {animal.brinco ? (
                  <span>
                    <strong>Brinco:</strong> {animal.brinco}
                  </span>
                ) : null}
                {animal.raca ? (
                  <span>
                    <strong>Raça:</strong> {animal.raca}
                  </span>
                ) : null}
                {animal.lote ? (
                  <span>
                    <strong>Lote:</strong> {animal.lote}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <strong style={{ display: "block", fontSize: 15, color: "#0f172a", marginBottom: 8 }}>Ações rápidas</strong>
            <div style={actionsGridStyle}>
              <button type="button" onClick={() => navegarAcao(navigate, "/m/repro/ia", animal)} style={actionButtonStyle}>
                Registrar IA
              </button>
              <button type="button" onClick={() => navegarAcao(navigate, "/m/repro/dg", animal)} style={actionButtonStyle}>
                Registrar DG
              </button>
              <button type="button" onClick={() => navegarAcao(navigate, "/m/leite/lancar", animal)} style={actionButtonStyle}>
                Registrar leite
              </button>
              <button type="button" onClick={() => navegarAcao(navigate, "/m/mais", animal)} style={actionButtonStyle}>
                Ocorrência clínica
              </button>
              <button type="button" onClick={() => navegarAcao(navigate, "/m/mais", animal)} style={actionButtonStyle}>
                Tratamento
              </button>
              <button type="button" onClick={() => navegarAcao(navigate, "/m/mais", animal)} style={actionButtonStyle}>
                Parto / Secagem
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.6)",
  zIndex: 120,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  padding: 12,
};

const sheetStyle = {
  width: "100%",
  maxWidth: 560,
  background: "#fff",
  borderRadius: 16,
  padding: "14px 14px 16px",
  maxHeight: "88vh",
  overflowY: "auto",
  position: "relative",
};

const closeButtonStyle = {
  position: "absolute",
  top: 8,
  right: 8,
  border: "1px solid #cbd5e1",
  borderRadius: 999,
  width: 28,
  height: 28,
  background: "#fff",
  fontSize: 18,
  lineHeight: "24px",
  color: "#334155",
};

const actionsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 8,
};

const actionButtonStyle = {
  border: "1px solid #bfdbfe",
  background: "#eff6ff",
  color: "#1d4ed8",
  borderRadius: 10,
  padding: "12px 8px",
  fontWeight: 700,
  fontSize: 13,
};
