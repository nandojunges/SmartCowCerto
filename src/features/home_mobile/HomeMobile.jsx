import { useNavigate } from "react-router-dom";
import Page from "../../app/layout/Page";
import Card from "../../app/ui/Card";
import StatTile from "../../app/ui/StatTile";
import ActionGrid from "../../app/ui/ActionGrid";
import ListRow from "../../app/ui/ListRow";

const pendencias = [
  { title: "Confirmar IA - Vaca 1021", subtitle: "Hoje • lote A", right: "Alta" },
  { title: "DG pendente - Vaca 947", subtitle: "Amanhã", right: "Média" },
  { title: "Parto previsto - Vaca 808", subtitle: "Em 2 dias", right: "Atenção" },
];

export default function HomeMobile() {
  const navigate = useNavigate();

  return (
    <Page title="Início" description="Resumo rápido da fazenda">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
        <StatTile label="Leite hoje" value="2.840 L" hint="+3% vs ontem" />
        <StatTile label="IA pendente" value="12" hint="Lote reprodução" />
        <StatTile label="DG pendente" value="7" hint="Próximos 3 dias" />
        <StatTile label="Partos próximos" value="5" hint="Até sexta" />
      </div>

      <Card>
        <strong style={{ display: "block", marginBottom: 10 }}>Ações rápidas</strong>
        <ActionGrid
          actions={[
            { label: "+ Leite", icon: "🥛", onClick: () => navigate("/m/leite/lancar") },
            { label: "+ IA", icon: "🧬", onClick: () => navigate("/m/repro/ia") },
            { label: "+ DG", icon: "📋", onClick: () => navigate("/m/repro/dg") },
            { label: "Calendário", icon: "📅", onClick: () => navigate("/m/calendario") },
          ]}
        />
      </Card>

      <Card>
        <strong style={{ display: "block", marginBottom: 10 }}>Pendências do dia</strong>
        <div style={{ display: "grid", gap: 8 }}>
          {pendencias.map((item) => (
            <ListRow key={item.title} title={item.title} subtitle={item.subtitle} right={item.right} onClick={() => {}} />
          ))}
        </div>
      </Card>
    </Page>
  );
}
