// TODO: integrar fluxo com Supabase/offline queue quando endpoints mobile estiverem definidos.
import { useMemo, useState } from "react";
import Page from "../../app/layout/Page";
import Card from "../../app/ui/Card";

const animais = ["101 - Estrela", "102 - Lua", "103 - Mimosa", "104 - Pintada", "105 - Nuvem"];

export default function LancarLeiteMobile() {
  const [busca, setBusca] = useState("");
  const [animalSelecionado, setAnimalSelecionado] = useState("");
  const [litros, setLitros] = useState("");

  const opcoes = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return animais;
    return animais.filter((item) => item.toLowerCase().includes(termo));
  }, [busca]);

  const salvar = () => {
    if (!animalSelecionado || !litros) {
      alert("Selecione o animal e informe os litros.");
      return;
    }

    alert(`Lançamento salvo para ${animalSelecionado} (${litros} L).`);
    setLitros("");
    setBusca("");
    setAnimalSelecionado("");
  };

  return (
    <Page title="Lançar leite" description="Registro rápido por animal">
      <Card>
        <div style={{ display: "grid", gap: 8 }}>
          <label style={labelStyle}>
            Buscar animal
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Digite número ou nome"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Selecionar
            <select value={animalSelecionado} onChange={(event) => setAnimalSelecionado(event.target.value)} style={inputStyle}>
              <option value="">Escolha um animal</option>
              {opcoes.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
            Litros
            <input
              value={litros}
              onChange={(event) => setLitros(event.target.value)}
              placeholder="Ex.: 18.5"
              inputMode="decimal"
              type="number"
              step="0.1"
              min="0"
              style={inputStyle}
            />
          </label>

          <button type="button" onClick={salvar} style={saveButtonStyle}>
            Salvar e próximo
          </button>
        </div>
      </Card>
    </Page>
  );
}

const labelStyle = {
  display: "grid",
  gap: 6,
  fontSize: 13,
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "12px",
  fontSize: 16,
  background: "#fff",
};

const saveButtonStyle = {
  marginTop: 6,
  width: "100%",
  border: "1px solid #15803d",
  background: "#16a34a",
  color: "#fff",
  borderRadius: 12,
  padding: "14px",
  fontSize: 16,
  fontWeight: 700,
};
