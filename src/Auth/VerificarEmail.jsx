// src/Auth/VerificarEmail.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";
import { useFazenda } from "../context/FazendaContext";

export default function VerificarEmail() {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [cadastro, setCadastro] = useState(null); // dados salvos no localStorage
  const [enviando, setEnviando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  // cooldown pra evitar 429 e evitar spam de OTP (e lembrar que só o último código vale)
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimerRef = useRef(null);

  const navigate = useNavigate();
  const { clearFazendaAtualId } = useFazenda();

  const startCooldown = (seconds = 60) => {
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    setCooldown(seconds);
    cooldownTimerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(cooldownTimerRef.current);
          cooldownTimerRef.current = null;
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    const salvo = localStorage.getItem("pendingCadastro");

    if (!salvo) {
      navigate("/cadastro", { replace: true });
      return;
    }

    try {
      const obj = JSON.parse(salvo);
      if (!obj?.email) {
        navigate("/cadastro", { replace: true });
        return;
      }

      // normaliza email
      const emailNorm = String(obj.email || "").trim().toLowerCase();

      setCadastro({ ...obj, email: emailNorm });
      setEmail(emailNorm);
    } catch (e) {
      console.error("Erro ao ler pendingCadastro:", e);
      navigate("/cadastro", { replace: true });
    }

    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, [navigate]);

  const handleResend = async () => {
    if (!cadastro) {
      setErro("Dados do cadastro não encontrados. Refaça o cadastro.");
      toast.error("Dados do cadastro não encontrados.");
      navigate("/cadastro", { replace: true });
      return;
    }

    if (cooldown > 0 || enviando) return;

    setErro("");
    setEnviando(true);

    try {
      const tipoConta = cadastro?.tipo_conta || cadastro?.tipoConta || "PRODUTOR";
      const emailNorm = String(cadastro.email || "").trim().toLowerCase();
      const telDigitos = String(cadastro.telefone || "").replace(/\D/g, "");
      const cpfDigitos = String(cadastro.cpf || "").replace(/\D/g, "");
      const fazendaTrim = String(cadastro.fazenda || "").trim();

      const metadata = {
        full_name: String(cadastro.nome || "").trim(),
        phone: telDigitos,
        cpf: cpfDigitos,
        tipo_conta: tipoConta,
        ...(tipoConta === "PRODUTOR" ? { fazenda: fazendaTrim } : {}),
      };

      const { error } = await supabase.auth.signInWithOtp({
        email: emailNorm,
        options: {
          shouldCreateUser: true,
          data: metadata,
        },
      });

      if (error) {
        console.error("Erro ao reenviar OTP:", error);
        const msg =
          error.status === 429
            ? "Muitas tentativas. Aguarde um pouco e tente novamente."
            : error.message || "Erro ao reenviar código.";
        setErro(msg);
        toast.error(msg);
        setEnviando(false);
        return;
      }

      toast.success("Novo código enviado! Use sempre o ÚLTIMO código recebido.");
      // inicia um cooldown local (além do rate limit do Supabase)
      startCooldown(60);
    } catch (err) {
      console.error(err);
      setErro("Erro inesperado ao reenviar código.");
      toast.error("Erro inesperado ao reenviar código.");
    } finally {
      setEnviando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (confirmando) return;

    if (!codigo.trim()) {
      setErro("Digite o código enviado para o seu e-mail.");
      return;
    }

    if (!cadastro) {
      setErro("Dados do cadastro não encontrados. Refaça o cadastro.");
      navigate("/cadastro", { replace: true });
      return;
    }

    setErro("");
    setConfirmando(true);

    try {
      const tipoConta = cadastro?.tipo_conta || cadastro?.tipoConta || "PRODUTOR";

      const emailNorm = String(cadastro.email || "").trim().toLowerCase();
      const token = String(codigo || "").trim();

      // 1) Verifica o código recebido por e-mail (OTP)
      const { data, error } = await supabase.auth.verifyOtp({
        email: emailNorm,
        token,
        type: "email",
      });

      console.log("verifyOtp:", data, error);

      if (error) {
        const msg =
          error.status === 429
            ? "Muitas tentativas. Aguarde um pouco e tente novamente."
            : error.message || "Código inválido ou expirado.";
        setErro(msg);
        toast.error(msg);
        setConfirmando(false);
        return;
      }

      // 2) Já autenticado → define a senha e metadata
      const telDigitos = String(cadastro.telefone || "").replace(/\D/g, "");
      const cpfDigitos = String(cadastro.cpf || "").replace(/\D/g, "");
      const fazendaTrim = String(cadastro.fazenda || "").trim();

      const metadata = {
        full_name: String(cadastro.nome || "").trim(),
        phone: telDigitos,
        cpf: cpfDigitos,
        tipo_conta: tipoConta,
        ...(tipoConta === "PRODUTOR" ? { fazenda: fazendaTrim } : {}),
      };

      const { error: updateError } = await supabase.auth.updateUser({
        password: cadastro.senha,
        data: metadata,
      });

      if (updateError) {
        console.error("Erro em updateUser:", updateError);
        toast.error(
          updateError.message ||
            "E-mail confirmado, mas houve erro ao salvar seus dados."
        );
        // mesmo com erro de updateUser o login está ativo, então segue pro app
      } else {
        toast.success("Cadastro concluído com sucesso!");
      }

      const userId = data?.user?.id ?? data?.session?.user?.id;

      let tipoContaFinal = tipoConta;

      if (userId) {
        const profilePayload = {
          id: userId,
          full_name: String(cadastro.nome || "").trim(),
          email: emailNorm,
          phone: telDigitos,
          cpf: cpfDigitos,
          tipo_conta: tipoConta,
          fazenda: tipoConta === "PRODUTOR" ? fazendaTrim : null,
        };

        const { data: perfilAtualizado, error: profileError } = await supabase
          .from("profiles")
          .upsert(profilePayload, { onConflict: "id" })
          .select("tipo_conta")
          .maybeSingle();

        if (profileError) {
          console.error("Erro ao salvar profile:", profileError);
          toast.error(
            profileError.message ||
              "Cadastro concluído, mas houve erro ao salvar o perfil."
          );
        } else if (perfilAtualizado?.tipo_conta) {
          tipoContaFinal = perfilAtualizado.tipo_conta;
        }
      } else {
        console.warn("verifyOtp sem userId para criar profile.");
      }

      // limpar storage e seguir para o sistema
      localStorage.removeItem("pendingCadastro");

      if (String(tipoContaFinal ?? "").trim().toUpperCase() === "ASSISTENTE_TECNICO") {
        clearFazendaAtualId();
        navigate("/tecnico", { replace: true });
        return;
      }

      navigate("/inicio", { replace: true });
    } catch (err) {
      console.error(err);
      setErro("Erro inesperado ao verificar código.");
      toast.error("Erro inesperado ao verificar código.");
    } finally {
      setConfirmando(false);
    }
  };

  const containerStyle = {
    minHeight: "100vh",
    width: "100%",
    backgroundImage: "url('/icones/telafundo.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const panelStyle = {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: "24px 28px",
    borderRadius: 24,
    boxShadow: "0 10px 28px rgba(0,0,0,.18)",
    width: "min(92vw, 420px)",
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: "1rem",
    textAlign: "center",
    letterSpacing: "4px",
  };

  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#6b7280",
            margin: 0,
          }}
        >
          Confirmação de e-mail
        </p>
        <h2
          style={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: 20,
            margin: "6px 0 14px",
          }}
        >
          Digite o código
        </h2>

        <p
          style={{
            fontSize: 13,
            color: "#4b5563",
            textAlign: "center",
            marginBottom: 14,
          }}
        >
          Enviamos um código de 6 dígitos para:
          <br />
          <strong>{email}</strong>
        </p>

        <p
          style={{
            fontSize: 12,
            color: "#6b7280",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Dica: se você pediu mais de um código, use sempre o <strong>último</strong>.
        </p>

        {erro && (
          <div
            style={{
              marginBottom: 10,
              color: "#dc2626",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            {erro}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <input
            type="text"
            inputMode="numeric"
            placeholder="••••••"
            maxLength={6}
            value={codigo}
            onChange={(e) =>
              setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={confirmando}
            style={{
              backgroundColor: confirmando ? "#93c5fd" : "#1565c0",
              color: "#fff",
              borderRadius: 30,
              padding: "10px 18px",
              fontWeight: 700,
              border: "none",
              width: 220,
              margin: "10px auto 0",
              cursor: confirmando ? "not-allowed" : "pointer",
              opacity: confirmando ? 0.9 : 1,
            }}
          >
            {confirmando ? "Confirmando..." : "Confirmar"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={enviando || cooldown > 0}
            style={{
              backgroundColor: "transparent",
              border: "1px solid #cbd5e1",
              color: "#0f172a",
              borderRadius: 30,
              padding: "10px 18px",
              fontWeight: 700,
              width: 220,
              margin: "0 auto",
              cursor: enviando || cooldown > 0 ? "not-allowed" : "pointer",
              opacity: enviando || cooldown > 0 ? 0.65 : 1,
            }}
          >
            {enviando
              ? "Enviando..."
              : cooldown > 0
              ? `Reenviar em ${cooldown}s`
              : "Reenviar código"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/cadastro")}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 12,
              color: "#2563eb",
              textDecoration: "underline",
              marginTop: 4,
              cursor: "pointer",
            }}
          >
            Voltar para o cadastro
          </button>
        </form>
      </div>
    </div>
  );
}
