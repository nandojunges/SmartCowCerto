// src/Pages/Ajustes/VisaoGeral/PerfilUsuario.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera, MapPin, User, Phone, FileText,
  MapPinned, CheckCircle, Loader2
} from "lucide-react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../../../lib/supabaseClient";
import { toast } from "react-toastify";
import { useFazenda } from "../../../context/FazendaContext";

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const DEFAULT_CENTER = [-14.235, -51.9253];
const DEFAULT_ZOOM = 4;
const FOCUSED_ZOOM = 13;

const guessLocationName = (result) => (
  result?.name
  || result?.address?.farm
  || result?.address?.hamlet
  || result?.address?.village
  || result?.address?.town
  || result?.address?.city
  || "Local selecionado"
);

const hasMissingLocationColumns = (message = "") => (
  message.includes("latitude")
  || message.includes("longitude")
  || message.includes("local_nome")
  || message.includes("local_endereco")
  || message.includes("local_atualizado_em")
);

function RecenterMap({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: onMapClick,
  });

  return null;
}

export default function PerfilUsuario({ userData, onUpdate }) {
  const { fazendaAtualId } = useFazenda();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: userData.nome || "",
    telefone: userData.telefone || "",
    cidade: userData.cidade || "",
    estado: userData.estado || "",
    bio: userData.bio || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(userData.avatar);

  const [fazLat, setFazLat] = useState(null);
  const [fazLng, setFazLng] = useState(null);
  const [localNome, setLocalNome] = useState("");
  const [localEndereco, setLocalEndereco] = useState("");
  const [busca, setBusca] = useState("");
  const [sugestoes, setSugestoes] = useState([]);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

  const fileInputRef = useRef(null);

  const fallbackCenter = useMemo(() => {
    const byState = {
      RS: [-30.0346, -51.2177],
      SC: [-27.5954, -48.548],
      PR: [-25.4284, -49.2733],
      SP: [-23.5505, -46.6333],
      RJ: [-22.9068, -43.1729],
      MG: [-19.9167, -43.9345],
      GO: [-16.6869, -49.2648],
      MT: [-15.601, -56.0974],
      MS: [-20.4697, -54.6201],
      BA: [-12.9714, -38.5014],
      PE: [-8.0476, -34.877],
      CE: [-3.7319, -38.5267],
      PA: [-1.4558, -48.4902],
    };

    return byState[formData.estado] || DEFAULT_CENTER;
  }, [formData.estado]);

  useEffect(() => {
    const carregarLocalizacaoFazenda = async () => {
      if (!fazendaAtualId) {
        setFazLat(null);
        setFazLng(null);
        setLocalNome("");
        setLocalEndereco("");
        setMapCenter(fallbackCenter);
        setMapZoom(DEFAULT_ZOOM);
        return;
      }

      const { data, error } = await supabase
        .from("fazendas")
        .select("latitude, longitude, local_nome, local_endereco")
        .eq("id", fazendaAtualId)
        .maybeSingle();

      if (error) {
        if (hasMissingLocationColumns(error.message || "")) {
          toast.error("Faltam colunas de localização em public.fazendas. Rode a migração antes de continuar.");
          return;
        }
        toast.error("Não foi possível carregar a localização da fazenda.");
        return;
      }

      const latitude = data?.latitude != null ? Number(data.latitude) : null;
      const longitude = data?.longitude != null ? Number(data.longitude) : null;

      setFazLat(Number.isFinite(latitude) ? latitude : null);
      setFazLng(Number.isFinite(longitude) ? longitude : null);
      setLocalNome(data?.local_nome || "");
      setLocalEndereco(data?.local_endereco || "");

      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        setMapCenter([latitude, longitude]);
        setMapZoom(FOCUSED_ZOOM);
      } else {
        setMapCenter(fallbackCenter);
        setMapZoom(DEFAULT_ZOOM);
      }
    };

    carregarLocalizacaoFazenda();
  }, [fazendaAtualId, fallbackCenter]);

  useEffect(() => {
    if (!busca.trim()) {
      setSugestoes([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoadingGeo(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(busca.trim())}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Falha ao pesquisar localização");
        }

        const results = await response.json();
        setSugestoes(
          (Array.isArray(results) ? results : []).map((result) => ({
            display_name: result.display_name,
            lat: Number(result.lat),
            lon: Number(result.lon),
            nameGuess: guessLocationName(result),
          })).filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lon))
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setSugestoes([]);
        }
      } finally {
        setLoadingGeo(false);
      }
    }, 500);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [busca]);

  const handleMapClick = async (e) => {
    const clickedLat = e.latlng.lat;
    const clickedLng = e.latlng.lng;

    setFazLat(clickedLat);
    setFazLng(clickedLng);
    setMapCenter([clickedLat, clickedLng]);
    setMapZoom(FOCUSED_ZOOM);

    try {
      setLoadingGeo(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${clickedLat}&lon=${clickedLng}`
      );

      if (!response.ok) {
        throw new Error("Falha no reverse geocode");
      }

      const result = await response.json();
      setLocalEndereco(result?.display_name || localEndereco);
      setLocalNome(guessLocationName(result));
    } catch {
      // Mantém os dados atuais quando reverse geocode falha
    } finally {
      setLoadingGeo(false);
    }
  };

  const handleSelectSuggestion = (item) => {
    setFazLat(item.lat);
    setFazLng(item.lon);
    setLocalNome(item.nameGuess);
    setLocalEndereco(item.display_name);
    setMapCenter([item.lat, item.lon]);
    setMapZoom(FOCUSED_ZOOM);
    setBusca(item.display_name);
    setSugestoes([]);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem deve ter menos de 5MB");
        return;
      }
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      setAvatarFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userData.id)
        .maybeSingle();

      let avatarUrl = currentProfile?.avatar_url || null;

      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `avatars/${userData.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("profiles")
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        avatarUrl = fileName;
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userData.id,
          full_name: formData.nome,
          telefone: formData.telefone,
          cidade: formData.cidade,
          estado: formData.estado,
          bio: formData.bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      if (fazendaAtualId && fazLat != null && fazLng != null) {
        const { error: fazendaError } = await supabase
          .from("fazendas")
          .update({
            latitude: fazLat,
            longitude: fazLng,
            local_nome: localNome.trim() || null,
            local_endereco: localEndereco.trim() || null,
            local_atualizado_em: new Date().toISOString(),
          })
          .eq("id", fazendaAtualId);

        if (fazendaError) {
          if (hasMissingLocationColumns(fazendaError.message || "")) {
            toast.error("Faltam colunas de localização em public.fazendas. Rode a migração antes de salvar.");
            return;
          }
          throw fazendaError;
        }
      }

      let signedAvatar = avatarUrl || null;
      if (avatarUrl?.startsWith("avatars/")) {
        const { data } = await supabase.storage
          .from("profiles")
          .createSignedUrl(avatarUrl, 3600);

        signedAvatar = data?.signedUrl || null;
      }

      onUpdate({
        nome: formData.nome,
        telefone: formData.telefone,
        cidade: formData.cidade,
        estado: formData.estado,
        bio: formData.bio,
        avatar: signedAvatar,
      });

      setAvatarPreview(signedAvatar);
      toast.success("Perfil atualizado com sucesso!");
      setAvatarFile(null);
    } catch (error) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
        Informações do Produtor
      </h3>

      <form onSubmit={handleSubmit}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 32,
          marginBottom: 32,
          padding: 24,
          background: "#f8fafc",
          borderRadius: 16,
        }}>
          <div style={{ position: "relative" }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                overflow: "hidden",
                cursor: "pointer",
                border: "4px solid #e2e8f0",
                position: "relative",
                background: "#ffffff",
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Perfil"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#e2e8f0",
                  color: "#64748b",
                  fontSize: 48,
                  fontWeight: 700,
                }}>
                  {formData.nome?.charAt(0).toUpperCase() || "?"}
                </div>
              )}

              <div style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.2s",
                ":hover": { opacity: 1 },
              }}>
                <Camera size={32} color="#fff" />
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <h4 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              Foto de Perfil
            </h4>
            <p style={{ margin: "0 0 16px", fontSize: 14, color: "#64748b", lineHeight: 1.5 }}>
              Escolha uma foto para personalizar sua conta. Recomendamos uma imagem de rosto em um círculo, como em redes sociais.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "8px 16px",
                  background: "#0f172a",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Escolher foto
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarPreview(null);
                    setAvatarFile(null);
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "#fff",
                    color: "#64748b",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Remover
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#374151" }}>
              <User size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
              Nome Completo
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                fontSize: 15,
                outline: "none",
                ":focus": { borderColor: "#3b82f6" }
              }}
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#374151" }}>
              <Phone size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
              WhatsApp / Telefone
            </label>
            <input
              type="tel"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                fontSize: 15,
              }}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#374151" }}>
              <MapPinned size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
              Cidade
            </label>
            <input
              type="text"
              value={formData.cidade}
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                fontSize: 15,
              }}
              placeholder="Ex: Ribeirão Preto"
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#374151" }}>
              <MapPin size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
              Estado
            </label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                fontSize: 15,
                background: "#fff",
              }}
            >
              <option value="">Selecione...</option>
              {ESTADOS_BR.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#374151" }}>
            <FileText size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
            Bio / Sobre mim
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={3}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              fontSize: 14,
              resize: "vertical",
              minHeight: 90,
            }}
            placeholder="Fale um pouco sobre você e sua produção..."
          />
          <span style={{ color: "#64748b", fontSize: 12 }}>
            {formData.bio.length}/500 caracteres
          </span>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#374151" }}>
            <MapPin size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
            Localização da Fazenda
          </label>

          {!fazendaAtualId ? (
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
              Selecione uma fazenda para definir a localização.
            </p>
          ) : (
            <>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: "#64748b" }}>
                Clique no mapa para marcar ou pesquise um local.
              </p>

              <div style={{ position: "relative", marginBottom: 12 }}>
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Pesquisar local..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    fontSize: 14,
                  }}
                />

                {sugestoes.length > 0 && (
                  <div style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                    zIndex: 10,
                    overflow: "hidden",
                  }}>
                    {sugestoes.slice(0, 5).map((item) => (
                      <button
                        key={`${item.lat}-${item.lon}-${item.display_name}`}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          border: "none",
                          background: "#fff",
                          padding: "10px 12px",
                          fontSize: 13,
                          cursor: "pointer",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        {item.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                height: 250,
                background: "#f1f5f9",
                marginBottom: 8,
              }}>
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <RecenterMap center={mapCenter} zoom={mapZoom} />
                  <MapClickHandler onMapClick={handleMapClick} />
                  {fazLat != null && fazLng != null && <Marker position={[fazLat, fazLng]} />}
                </MapContainer>
              </div>

              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                {loadingGeo
                  ? "Buscando informações do local..."
                  : localNome || localEndereco
                    ? `${localNome || "Local selecionado"} ${localEndereco ? `• ${localEndereco}` : ""}`
                    : "Nenhum ponto selecionado ainda."}
              </p>
            </>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 32px",
              background: loading ? "#cbd5e1" : "#0f172a",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <CheckCircle size={18} /> Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
