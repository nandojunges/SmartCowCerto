import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../../app/layout/Page";
import { useFazenda } from "../../context/FazendaContext";
import { supabase } from "../../lib/supabaseClient";
import { withFazendaId } from "../../lib/fazendaScope";
import AnimalMobileResumo from "./AnimalMobileResumo";

// TODO: Trocar para view de resumo quando disponível.

function normalizarStatus(animal) {
  return animal?.status || animal?.situacao_produtiva || animal?.categoria || "Sem status";
}

function formatarData(data) {
  if (!data) return null;

  const parsed = new Date(data);
  if (Number.isNaN(parsed.getTime())) return data;

  return parsed.toLocaleDateString("pt-BR");
}

export default function AnimaisMobile() {
  const navigate = useNavigate();
  const { fazendaAtualId } = useFazenda();
  const [busca, setBusca] = useState("");
  const [animais, setAnimais] = useState([]);
  const [animalSelecionado, setAnimalSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    const carregarAnimais = async () => {
      setCarregando(true);

      try {
        const { data: authData } = await supabase.auth.getUser();
        const userEmail = authData?.user?.email || null;

        let query = withFazendaId(
          supabase
            .from("animais")
            .select("id, numero, nome, status, situacao_produtiva, categoria, del, repro_status, ultima_ia_data, dias_prenhez, brinco, raca, lote")
            .order("numero", { ascending: true }),
          fazendaAtualId
        );

        if (!fazendaAtualId && userEmail) {
          query = query.eq("user_id", userEmail);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Erro ao carregar animais mobile:", error);
          if (!cancelado) setAnimais([]);
          return;
        }

        if (!cancelado) setAnimais(Array.isArray(data) ? data : []);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    };

    carregarAnimais();

    return () => {
      cancelado = true;
    };
  }, [fazendaAtualId]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return animais;

    return animais.filter((animal) => {
      const texto = [
        animal?.numero,
        animal?.nome,
        normalizarStatus(animal),
        animal?.repro_status,
        animal?.brinco,
        animal?.raca,
        animal?.lote,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return texto.includes(termo);
    });
  }, [animais, busca]);

  return (
    <Page title="Animais" description="Consulta rápida do rebanho">
      <input
        value={busca}
        onChange={(event) => setBusca(event.target.value)}
        placeholder="Buscar por número, nome, status ou brinco"
        style={{
          width: "100%",
          border: "1px solid #cbd5e1",
          borderRadius: 12,
          padding: "10px 12px",
          fontSize: 14,
          background: "#fff",
        }}
      />

      <div style={{ display: "grid", gap: 8 }}>
        {carregando ? (
          <div style={{ color: "#64748b", fontSize: 13 }}>Carregando animais...</div>
        ) : null}

        {!carregando && filtrados.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: 13 }}>Nenhum animal encontrado.</div>
        ) : null}

        {filtrados.map((animal) => {
          const status = normalizarStatus(animal);

          return (
            <button key={animal.id} type="button" onClick={() => setAnimalSelecionado(animal)} style={cardStyle}>
              <div style={linhaTopoStyle}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
                  <strong style={{ fontSize: 14, color: "#0f172a" }}>#{animal.numero || "-"}</strong>
                  {animal.nome ? (
                    <span style={{ fontSize: 13, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {animal.nome}
                    </span>
                  ) : null}
                </div>
                <span style={badgeStyle}>{status}</span>
              </div>

              <div style={linhaInfoStyle}>
                {animal.del ? <span>DEL: {animal.del}</span> : null}
                {animal.repro_status ? <span>Repro: {animal.repro_status}</span> : null}
                {animal.ultima_ia_data ? <span>Últ. IA: {formatarData(animal.ultima_ia_data)}</span> : null}
                {animal.dias_prenhez ? <span>Dias prenhez: {animal.dias_prenhez}</span> : null}
              </div>

              <div style={linhaInfoStyle}>
                {animal.brinco ? <span>Brinco: {animal.brinco}</span> : null}
                {animal.raca ? <span>Raça: {animal.raca}</span> : null}
                {animal.lote ? <span>Lote: {animal.lote}</span> : null}
              </div>
            </button>
          );
        })}
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

      <AnimalMobileResumo animal={animalSelecionado} onClose={() => setAnimalSelecionado(null)} />
    </Page>
  );
}

const cardStyle = {
  width: "100%",
  border: "1px solid #dbe2ea",
  borderRadius: 12,
  background: "#fff",
  padding: "9px 10px",
  display: "grid",
  gap: 5,
  textAlign: "left",
};

const linhaTopoStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
};

const linhaInfoStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "2px 9px",
  fontSize: 11,
  color: "#475569",
};

const badgeStyle = {
  borderRadius: 999,
  border: "1px solid #cbd5e1",
  padding: "2px 7px",
  fontSize: 10,
  fontWeight: 700,
  color: "#334155",
  whiteSpace: "nowrap",
};
