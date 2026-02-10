import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../../app/layout/Page";
import ListRow from "../../app/ui/ListRow";

const mockAnimais = [
  { id: "101", numero: "101", nome: "Estrela", status: "Lactação" },
  { id: "102", numero: "102", nome: "Lua", status: "Pré-parto" },
  { id: "103", numero: "103", nome: "Mimosa", status: "Seca" },
  { id: "104", numero: "104", nome: "Pintada", status: "Lactação" },
  { id: "105", numero: "105", nome: "Nuvem", status: "Novilha" },
  { id: "106", numero: "106", nome: "Safira", status: "Lactação" },
  { id: "107", numero: "107", nome: "Frida", status: "Inseminar" },
  { id: "108", numero: "108", nome: "Lira", status: "Seca" },
  { id: "109", numero: "109", nome: "Aurora", status: "Lactação" },
  { id: "110", numero: "110", nome: "Violeta", status: "Prenhe" },
];

export default function AnimaisMobile() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return mockAnimais;
    return mockAnimais.filter((animal) => `${animal.numero} ${animal.nome} ${animal.status}`.toLowerCase().includes(termo));
  }, [busca]);

  return (
    <Page title="Animais" description="Consulta rápida do rebanho">
      <input
        value={busca}
        onChange={(event) => setBusca(event.target.value)}
        placeholder="Buscar por número, nome ou status"
        style={{
          width: "100%",
          border: "1px solid #cbd5e1",
          borderRadius: 12,
          padding: "12px 14px",
          fontSize: 16,
          background: "#fff",
        }}
      />

      <div style={{ display: "grid", gap: 8 }}>
        {filtrados.map((animal) => (
          <ListRow
            key={animal.id}
            title={`${animal.numero} • ${animal.nome}`}
            subtitle={animal.status}
            right="Ver"
            onClick={() => navigate(`/m/animais/${animal.id}`)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => navigate("/m/animais/novo")}
        style={{
          position: "fixed",
          right: 18,
          bottom: 92,
          borderRadius: 999,
          border: "1px solid #1d4ed8",
          background: "#2563eb",
          color: "#fff",
          padding: "12px 16px",
          fontWeight: 700,
          boxShadow: "0 8px 18px rgba(37, 99, 235, 0.28)",
        }}
      >
        + Animal
      </button>
    </Page>
  );
}
