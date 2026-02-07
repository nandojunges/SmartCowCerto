import React, { useMemo, useState, useEffect } from "react";
import Select from "react-select";

export default function RegistrarSecagem(props) {
  // ✅ Compatível com as duas assinaturas:
  // - nova:  { animal, onClose }
  // - antiga:{ vaca, onFechar }
  const animalProp = props.animal ?? props.vaca ?? null;
  const onClose = props.onClose ?? props.onFechar ?? (() => {});

  // ✅ Blindagem: garante objeto e numero seguro
  const animalSafe = useMemo(
    () => (animalProp && typeof animalProp === "object" ? animalProp : null),
    [animalProp]
  );

  const numeroAnimal = animalSafe?.numero ?? animalSafe?.num ?? "—";

  const [dataSecagem, setDataSecagem] = useState("");
  const [planoTratamento, setPlanoTratamento] = useState(null); // ✅ NOVO
  const [responsavel, setResponsavel] = useState(null); // ✅ NOVO
  const [metodo, setMetodo] = useState(null);
  const [condicaoCorporal, setCondicaoCorporal] = useState(null);
  const [producaoAtual, setProducaoAtual] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const hoje = new Date().toLocaleDateString("pt-BR");
    setDataSecagem(hoje);

    const keyHandler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [onClose]);

  useEffect(() => {
    if (!animalSafe) {
      setErro("Nenhuma vaca selecionada para registrar secagem.");
    } else {
      setErro("");
    }
  }, [animalSafe]);

  const formatarData = (valor) => {
    const limpo = String(valor || "").replace(/\D/g, "").slice(0, 8);
    const dia = limpo.slice(0, 2);
    const mes = limpo.slice(2, 4);
    const ano = limpo.slice(4, 8);
    return [dia, mes, ano].filter(Boolean).join("/");
  };

  const salvar = () => {
    if (!animalSafe || animalSafe.numero === undefined || animalSafe.numero === null) {
      setErro("Selecione uma vaca válida antes de salvar.");
      return;
    }

    // 🔧 Se quiser tornar “plano” e “responsável” obrigatórios, descomenta aqui:
    // if (!planoTratamento || !responsavel) {
    //   setErro("Selecione o plano de tratamento e o responsável.");
    //   return;
    // }

    if (!dataSecagem || !metodo || !condicaoCorporal) {
      setErro("Preencha todos os campos obrigatórios");
      return;
    }

    const animais = JSON.parse(localStorage.getItem("animais") || "[]");

    const alvoNumero = String(animalSafe.numero);
    const index = animais.findIndex((a) => String(a?.numero) === alvoNumero);

    if (index === -1) {
      setErro("Não encontrei essa vaca no armazenamento local (localStorage).");
      return;
    }

    const dadosSecagem = {
      data: dataSecagem,
      planoTratamento: planoTratamento?.value ?? null, // ✅ NOVO
      responsavel: responsavel?.value ?? null, // ✅ NOVO
      metodo: metodo.value,
      condicaoCorporal: condicaoCorporal.value,
      producaoAtual,
      observacoes,
    };

    if (!animais[index].historico) animais[index].historico = [];
    animais[index].historico.push({
      tipo: "secagem",
      ...dadosSecagem,
    });

    animais[index].statusReprodutivo = "seca";
    animais[index].dataSecagem = dataSecagem;

    localStorage.setItem("animais", JSON.stringify(animais));
    window.dispatchEvent(new Event("animaisAtualizados"));

    onClose?.();
    props.onSaved?.(dadosSecagem);
  };

  const estilos = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    },
    modal: {
      background: "#fff",
      borderRadius: "1rem",
      width: "600px",
      maxHeight: "90vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Poppins, sans-serif",
      boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    },
    header: {
      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      color: "white",
      padding: "1.5rem",
      fontSize: "1.2rem",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    corpo: {
      padding: "2rem",
      overflowY: "auto",
    },
    campo: {
      marginBottom: "1.5rem",
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      fontWeight: "500",
      fontSize: "0.95rem",
      color: "#374151",
    },
    obrigatorio: {
      color: "#ef4444",
      marginLeft: "0.25rem",
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      fontSize: "0.95rem",
      borderRadius: "0.5rem",
      border: "2px solid #e5e7eb",
      boxSizing: "border-box",
      transition: "border-color 0.2s",
      fontFamily: "Poppins, sans-serif",
    },
    textarea: {
      width: "100%",
      padding: "0.75rem",
      fontSize: "0.95rem",
      borderRadius: "0.5rem",
      border: "2px solid #e5e7eb",
      boxSizing: "border-box",
      resize: "vertical",
      minHeight: "80px",
      fontFamily: "Poppins, sans-serif",
    },
    footer: {
      padding: "1.5rem",
      borderTop: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "flex-end",
      gap: "1rem",
    },
    erro: {
      background: "#fee2e2",
      color: "#991b1b",
      padding: "0.75rem",
      borderRadius: "0.5rem",
      marginBottom: "1rem",
      fontSize: "0.9rem",
    },
    info: {
      background: "#fef3c7",
      padding: "1rem",
      borderRadius: "0.5rem",
      fontSize: "0.85rem",
      color: "#92400e",
      marginTop: "1rem",
    },
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "0.5rem",
      border: `2px solid ${state.isFocused ? "#f59e0b" : "#e5e7eb"}`,
      boxShadow: "none",
      minHeight: "44px",
      "&:hover": { borderColor: "#f59e0b" },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  // ✅ TODO: depois trocar essas listas por SELECT do teu banco (tabela de planos e responsáveis)
  const opcoesPlanoTratamento = [
    { value: "Bovigold Secagem", label: "Bovigold (Secagem)" },
    { value: "Cefalexina", label: "Cefalexina (Intramamário)" },
    { value: "Selante Interno", label: "Selante Interno" },
    { value: "Protocolo Padrão", label: "Protocolo Padrão" },
  ];

  const opcoesResponsavel = [
    { value: "Fernando Junges", label: "Fernando Junges" },
    { value: "Funcionário 1", label: "Funcionário 1" },
    { value: "Veterinário", label: "Veterinário" },
  ];

  const opcoesMetodo = [
    { value: "Abrupta", label: "Secagem Abrupta" },
    { value: "Gradual", label: "Secagem Gradual" },
    { value: "Intermitente", label: "Secagem Intermitente" },
  ];

  const opcoesCC = [
    { value: "1", label: "1 - Muito magra" },
    { value: "2", label: "2 - Magra" },
    { value: "3", label: "3 - Ideal" },
    { value: "4", label: "4 - Gorda" },
    { value: "5", label: "5 - Muito gorda" },
  ];

  return (
    <div style={estilos.overlay} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={estilos.modal}>
        <div style={estilos.header}>🌾 Registrar Secagem - Vaca {numeroAnimal}</div>

        <div style={estilos.corpo}>
          {erro && <div style={estilos.erro}>⚠️ {erro}</div>}

          <div style={estilos.campo}>
            <label style={estilos.label}>
              Data da Secagem<span style={estilos.obrigatorio}>*</span>
            </label>
            <input
              type="text"
              value={dataSecagem}
              onChange={(e) => setDataSecagem(formatarData(e.target.value))}
              style={estilos.input}
              placeholder="dd/mm/aaaa"
              autoFocus
              disabled={!animalSafe}
            />
          </div>

          {/* ✅ NOVO: Plano de tratamento */}
          <div style={estilos.campo}>
            <label style={estilos.label}>Plano de Tratamento</label>
            <Select
              options={opcoesPlanoTratamento}
              value={planoTratamento}
              onChange={setPlanoTratamento}
              styles={selectStyles}
              placeholder="Selecione o plano..."
              isDisabled={!animalSafe}
              isClearable
            />
          </div>

          {/* ✅ NOVO: Responsável */}
          <div style={estilos.campo}>
            <label style={estilos.label}>Responsável</label>
            <Select
              options={opcoesResponsavel}
              value={responsavel}
              onChange={setResponsavel}
              styles={selectStyles}
              placeholder="Selecione o responsável..."
              isDisabled={!animalSafe}
              isClearable
            />
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>
              Método de Secagem<span style={estilos.obrigatorio}>*</span>
            </label>
            <Select
              options={opcoesMetodo}
              value={metodo}
              onChange={setMetodo}
              styles={selectStyles}
              placeholder="Selecione o método..."
              isDisabled={!animalSafe}
            />
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>
              Condição Corporal (ECC)<span style={estilos.obrigatorio}>*</span>
            </label>
            <Select
              options={opcoesCC}
              value={condicaoCorporal}
              onChange={setCondicaoCorporal}
              styles={selectStyles}
              placeholder="Avalie a condição corporal..."
              isDisabled={!animalSafe}
            />
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Produção Atual (litros/dia)</label>
            <input
              type="number"
              value={producaoAtual}
              onChange={(e) => setProducaoAtual(e.target.value)}
              style={estilos.input}
              placeholder="Ex: 15"
              step="0.1"
              disabled={!animalSafe}
            />
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              style={estilos.textarea}
              placeholder="Anotações adicionais sobre a secagem..."
              disabled={!animalSafe}
            />
          </div>

          <div style={estilos.info}>
            💡 <strong>Dica:</strong> O período seco ideal é de 60 dias. A condição corporal ideal ao
            secar é 3 a 3,5.
          </div>
        </div>

        <div style={estilos.footer}>
          <button onClick={() => onClose?.()} className="botao-cancelar">
            Cancelar
          </button>
          <button onClick={salvar} className="botao-acao" disabled={!animalSafe}>
            💾 Salvar Secagem
          </button>
        </div>
      </div>
    </div>
  );
}
