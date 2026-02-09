import { useEffect, useMemo, useRef } from "react";
import NavegacaoPrincipal from "./NavegacaoPrincipal";
import { useLocation, useOutlet } from "react-router-dom";

/**
 * KeepAlive de rotas: mantém páginas montadas ao trocar abas do sistema.
 * - Evita “piscada”/tela branca ao navegar
 * - Preserva estado local (inputs/modais) ao trocar entre páginas
 */
function KeepAliveOutlet({ max = 10 }) {
  const location = useLocation();
  const outlet = useOutlet();

  const key = location.pathname;

  const cacheRef = useRef(new Map()); // pathname -> ReactNode
  const orderRef = useRef([]);        // LRU simples

  useEffect(() => {
    if (!outlet) return;

    const cache = cacheRef.current;
    const order = orderRef.current;

    if (!cache.has(key)) {
      cache.set(key, outlet);
      order.push(key);

      while (order.length > max) {
        const oldest = order.shift();
        if (oldest && oldest !== key) cache.delete(oldest);
      }
    } else {
      const idx = order.indexOf(key);
      if (idx >= 0) {
        order.splice(idx, 1);
        order.push(key);
      }
    }
  }, [key, outlet, max]);

  const entries = useMemo(() => Array.from(cacheRef.current.entries()), [key]);

  return (
    <>
      {entries.map(([path, element]) => (
        <div
          key={path}
          style={{ display: path === key ? "block" : "none" }}
          aria-hidden={path !== key}
        >
          {element}
        </div>
      ))}
    </>
  );
}

export default function SistemaBase({ tipoConta }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f3f4f6",
        fontFamily: "'Inter', 'Poppins', sans-serif",
      }}
    >
      <header
        style={{
          width: "100%",
          backgroundColor: "#1c3586",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          zIndex: 10,
        }}
      >
        <NavegacaoPrincipal tipoConta={tipoConta} />
      </header>

      <main
        style={{
          flex: 1,
          width: "100%",
          overflowY: "auto",
          backgroundColor: "#f9fafb",
        }}
      >
        <div
          style={{
            width: "100%",
            padding: "16px 16px 32px 16px",
            boxSizing: "border-box",
          }}
        >
          <KeepAliveOutlet max={10} />
        </div>
      </main>
    </div>
  );
}
