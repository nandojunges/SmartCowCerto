import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const animaisMock = [
  { id: 1, numero: "101", nome: "Aurora", status: "Lactação" },
  { id: 2, numero: "118", nome: "Brisa", status: "Prenhe" },
  { id: 3, numero: "127", nome: "Cacau", status: "Vazia" },
  { id: 4, numero: "134", nome: "Dália", status: "Lactação" },
  { id: 5, numero: "146", nome: "Estrela", status: "Seca" },
  { id: 6, numero: "155", nome: "Fiona", status: "Pré-parto" },
  { id: 7, numero: "163", nome: "Gaia", status: "Lactação" },
  { id: 8, numero: "174", nome: "Hera", status: "Vazia" },
];

const quickActions = ["Leite", "IA", "DG", "Parto", "Saúde"];

const actionRoutes = {
  Leite: "/m/leite/lancar",
  IA: "/m/repro/ia",
  DG: "/m/repro/dg",
  "Parto/Secagem": "/m/mais",
  Saúde: "/m/mais",
};

export default function OperacoesMobile() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedAnimal, setSelectedAnimal] = useState(animaisMock[0]);
  const [showActionModal, setShowActionModal] = useState(false);

  const filteredAnimals = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return animaisMock;
    }

    return animaisMock.filter((animal) => {
      const numero = animal.numero.toLowerCase();
      const nome = animal.nome.toLowerCase();
      return numero.includes(term) || nome.includes(term);
    });
  }, [query]);

  const openAction = (action) => {
    const route = actionRoutes[action] || "/m/mais";
    setShowActionModal(false);
    navigate(route);
  };

  return (
    <section style={{ display: "grid", gap: 14 }}>
      <h1 style={{ fontSize: 24, margin: 0 }}>Operações</h1>

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Número, brinco ou nome"
        style={{
          width: "100%",
          minHeight: 50,
          border: "1px solid #cbd5e1",
          borderRadius: 12,
          padding: "0 14px",
          fontSize: 16,
          background: "#fff",
        }}
      />

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, boxShadow: "0 2px 8px rgba(15, 23, 42, 0.05)", padding: 10 }}>
        <div style={{ display: "grid", gap: 8 }}>
          {filteredAnimals.map((animal) => {
            const isSelected = selectedAnimal?.id === animal.id;
            return (
              <button
                key={animal.id}
                type="button"
                onClick={() => setSelectedAnimal(animal)}
                style={{
                  textAlign: "left",
                  border: isSelected ? "1px solid #93c5fd" : "1px solid #e2e8f0",
                  background: isSelected ? "#eff6ff" : "#fff",
                  borderRadius: 10,
                  padding: "10px 12px",
                }}
              >
                <strong style={{ display: "block", fontSize: 15 }}>{animal.numero} · {animal.nome}</strong>
                <span style={{ color: "#64748b", fontSize: 13 }}>{animal.status}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedAnimal ? (
        <article
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
            padding: 14,
            display: "grid",
            gap: 12,
          }}
        >
          <div>
            <strong style={{ display: "block", fontSize: 18 }}>
              #{selectedAnimal.numero} · {selectedAnimal.nome}
            </strong>
            <span style={{ color: "#64748b" }}>{selectedAnimal.status}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
            {quickActions.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => openAction(action)}
                style={{
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  borderRadius: 10,
                  minHeight: 40,
                  fontWeight: 600,
                  color: "#0f172a",
                }}
              >
                {action}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowActionModal(true)}
            style={{
              border: "1px solid #2563eb",
              background: "#2563eb",
              color: "#fff",
              borderRadius: 12,
              minHeight: 46,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            Ação
          </button>
        </article>
      ) : null}

      {showActionModal ? (
        <div
          role="presentation"
          onClick={() => setShowActionModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(15, 23, 42, 0.5)",
            padding: 14,
            display: "grid",
            alignItems: "end",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 14,
              boxShadow: "0 -8px 24px rgba(15,23,42,.16)",
              display: "grid",
              gap: 10,
            }}
          >
            <strong style={{ fontSize: 18 }}>Selecionar ação</strong>
            <button type="button" onClick={() => openAction("Leite")} style={modalActionBtnStyle}>Leite</button>
            <button type="button" onClick={() => openAction("IA")} style={modalActionBtnStyle}>IA</button>
            <button type="button" onClick={() => openAction("DG")} style={modalActionBtnStyle}>DG</button>
            <button type="button" onClick={() => openAction("Parto/Secagem")} style={modalActionBtnStyle}>Parto/Secagem</button>
            <button type="button" onClick={() => openAction("Saúde")} style={modalActionBtnStyle}>Saúde</button>
            <button type="button" onClick={() => setShowActionModal(false)} style={modalCancelBtnStyle}>Fechar</button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

const modalActionBtnStyle = {
  border: "1px solid #dbe1ea",
  background: "#fff",
  borderRadius: 10,
  minHeight: 44,
  fontSize: 15,
  fontWeight: 600,
  color: "#0f172a",
};

const modalCancelBtnStyle = {
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  borderRadius: 10,
  minHeight: 42,
  fontSize: 14,
  fontWeight: 600,
  color: "#334155",
};
