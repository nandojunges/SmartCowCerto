import { useState } from "react";
import Page from "../../app/layout/Page";
import Card from "../../app/ui/Card";

const animais = ["101 - Estrela", "107 - Frida", "118 - Aurora"];

export default function RegistrarIAMobile() {
  const [form, setForm] = useState({ animal: "", data: "", touro: "", inseminador: "" });
  const [erro, setErro] = useState("");

  const onChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErro("");
  };

  const onSubmit = () => {
    if (!form.animal || !form.data || !form.touro || !form.inseminador) {
      setErro("Preencha animal, data, touro e inseminador para salvar a IA.");
      return;
    }

    alert("IA registrada com sucesso (mock).");
    setForm({ animal: "", data: "", touro: "", inseminador: "" });
  };

  return (
    <Page title="Registrar IA" description="Lançamento rápido em campo">
      {erro ? (
        <Card style={{ border: "1px solid #fecaca", background: "#fef2f2" }}>
          <strong style={{ color: "#b91c1c" }}>Atenção</strong>
          <p style={{ margin: "6px 0 0", color: "#7f1d1d" }}>{erro}</p>
        </Card>
      ) : null}

      <Card>
        <div style={gridStyle}>
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
            Data (dd/mm/aaaa)
            <input value={form.data} onChange={onChange("data")} placeholder="10/02/2026" style={inputStyle} />
          </label>

          <label style={labelStyle}>
            Touro
            <input value={form.touro} onChange={onChange("touro")} placeholder="Código ou nome" style={inputStyle} />
          </label>

          <label style={labelStyle}>
            Inseminador
            <input value={form.inseminador} onChange={onChange("inseminador")} placeholder="Responsável" style={inputStyle} />
          </label>

          <button type="button" onClick={onSubmit} style={saveButtonStyle}>Salvar IA</button>
        </div>
      </Card>
    </Page>
  );
}

const gridStyle = { display: "grid", gap: 10 };
const labelStyle = { display: "grid", gap: 6, fontSize: 13, color: "#334155" };
const inputStyle = { border: "1px solid #cbd5e1", borderRadius: 10, padding: "11px", fontSize: 15, background: "#fff" };
const saveButtonStyle = { border: "1px solid #1d4ed8", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "12px", fontWeight: 700, marginTop: 4 };
