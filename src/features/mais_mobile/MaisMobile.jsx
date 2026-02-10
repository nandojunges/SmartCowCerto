import { useNavigate } from "react-router-dom";
import Page from "../../app/layout/Page";
import Card from "../../app/ui/Card";

export default function MaisMobile() {
  const navigate = useNavigate();

  const goOrSoon = (path) => {
    if (["/ajustes", "/consumo", "/financeiro"].includes(path)) {
      navigate(path);
      return;
    }
    alert("Em breve");
  };

  return (
    <Page title="Mais" description="Atalhos e configurações">
      <Card>
        <div style={{ display: "grid", gap: 8 }}>
          <button type="button" onClick={() => goOrSoon("/ajustes")} style={itemStyle}>Ajustes</button>
          <button type="button" onClick={() => goOrSoon("/consumo")} style={itemStyle}>Estoque</button>
          <button type="button" onClick={() => goOrSoon("/financeiro")} style={itemStyle}>Financeiro</button>
          <button type="button" onClick={() => navigate("/")} style={itemStyle}>Modo completo</button>
        </div>
      </Card>
    </Page>
  );
}

const itemStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  background: "#fff",
  padding: "12px",
  textAlign: "left",
  fontWeight: 600,
};
