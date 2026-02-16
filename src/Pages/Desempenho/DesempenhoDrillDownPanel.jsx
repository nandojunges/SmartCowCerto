import { useEffect } from "react";

export default function DesempenhoDrillDownPanel({
  open,
  title,
  subtitle,
  onClose,
  children,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        zIndex: 999,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          width: "min(560px, 100%)",
          height: "100%",
          background: "#FFFFFF",
          boxShadow: "-8px 0 24px rgba(15, 23, 42, 0.2)",
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
          padding: "24px",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, color: "#111827" }}>{title}</h2>
            {subtitle ? (
              <p style={{ margin: "6px 0 0", color: "#6B7280", fontSize: 14 }}>{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid #D1D5DB",
              background: "#FFFFFF",
              borderRadius: 8,
              height: 36,
              minWidth: 36,
              cursor: "pointer",
              color: "#374151",
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            marginTop: 20,
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            padding: 16,
            background: "#F9FAFB",
            color: "#4B5563",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {children}
        </div>
      </aside>
    </div>
  );
}
