import { useState } from "react";
import Page from "../../app/layout/Page";
import Card from "../../app/ui/Card";

const animais = ["101 - Estrela", "102 - Lua", "140 - Violeta"];

export default function RegistrarDGMobile() {
  const [form, setForm] = useState({ animal: "", data: "", resultado: "positivo", observacao: "" });

  const onChange = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const onSubmit = () => {
    if (!form.animal || !form.data) {
      alert("Informe animal e data para registrar o DG.");
      return;
    }

    alert(`DG ${form.resultado} salvo para ${form.animal} (mock).`);
    setForm({ animal: "", data: "", resultado: "positivo", observacao: "" });
  };

  return (
    <Page title="Registrar DG" description="Diagnóstico de gestação">
      <Card>
        <div style={{ display: "grid", gap: 10 }}>
          <label style={labelStyle}>
            Animal
            <select value={form.animal} onChange={onChange("animal")} style={inputStyle}>
              <option value="">Selecione</option>
              {animais.map((animal) => (
                <option key={animal} value={animal}>{animal}</option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
            Data
            <input value={form.data} onChange={onChange("data")} placeholder="10/02/2026" style={inputStyle} />
          </label>

          <label style={labelStyle}>
            Resultado
            <select value={form.resultado} onChange={onChange("resultado")} style={inputStyle}>
              <option value="positivo">Positivo</option>
              <option value="negativo">Negativo</option>
            </select>
          </label>

          <label style={labelStyle}>
            Observação
            <textarea value={form.observacao} onChange={onChange("observacao")} rows={3} placeholder="Opcional" style={{ ...inputStyle, resize: "vertical" }} />
          </label>

          <button type="button" onClick={onSubmit} style={saveButtonStyle}>Salvar DG</button>
        </div>
      </Card>
    </Page>
  );
}

const labelStyle = { display: "grid", gap: 6, fontSize: 13, color: "#334155" };
const inputStyle = { border: "1px solid #cbd5e1", borderRadius: 10, padding: "11px", fontSize: 15, background: "#fff" };
const saveButtonStyle = { border: "1px solid #15803d", background: "#16a34a", color: "#fff", borderRadius: 10, padding: "12px", fontWeight: 700, marginTop: 4 };
