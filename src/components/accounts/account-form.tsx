import { useState, type CSSProperties, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Account, AccountType } from "@/lib/database.types.ts";

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "bank", label: "Cuenta Bancaria" },
  { value: "cash", label: "Efectivo" },
  { value: "savings", label: "Ahorro" },
  { value: "credit_card", label: "Tarjeta de Crédito" },
  { value: "crypto_wallet", label: "Wallet Cripto" },
];

const COLORS = [
  "#c9a84c",
  "#60a5fa",
  "#4ade80",
  "#f87171",
  "#a78bfa",
  "#fb923c",
  "#2dd4bf",
  "#f472b6",
];

const ICONS = [
  { value: "wallet", label: "Billetera" },
  { value: "landmark", label: "Banco" },
  { value: "piggy", label: "Alcancía" },
  { value: "credit", label: "Tarjeta" },
];

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.6)",
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};

const cardStyle: CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 14,
  width: "100%",
  maxWidth: 480,
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 20,
  borderBottom: "1px solid var(--color-border)",
};

const headingStyle: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 20,
  color: "var(--color-text-primary)",
  margin: 0,
};

const closeBtnStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  fontSize: 12,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "var(--color-text-muted)",
};

const formStyle: CSSProperties = {
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const labelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: "var(--color-text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  marginBottom: 6,
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "var(--color-background)",
  border: "1px solid var(--color-border)",
  borderRadius: 10,
  color: "var(--color-text-primary)",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
};

const gridRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

const fieldColStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const iconRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
};

const iconBtnBase: CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  fontSize: 12,
  cursor: "pointer",
  border: "1px solid var(--color-border)",
  fontFamily: "inherit",
};

const colorRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
};

const actionsRowStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  paddingTop: 8,
};

const actionBtnBase: CSSProperties = {
  flex: 1,
  padding: 12,
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

interface AccountFormProps {
  account?: Account | null;
  onSubmit: (data: {
    name: string;
    type: AccountType;
    currency: string;
    current_balance: number;
    color: string;
    icon: string;
  }) => Promise<void>;
  onClose: () => void;
}

export function AccountForm({ account, onSubmit, onClose }: AccountFormProps) {
  const [name, setName] = useState(account?.name ?? "");
  const [type, setType] = useState<AccountType>(account?.type ?? "bank");
  const [currency, setCurrency] = useState(account?.currency ?? "USD");
  const [balance, setBalance] = useState(
    account ? String(account.current_balance) : "0"
  );
  const [color, setColor] = useState(account?.color ?? COLORS[0]);
  const [icon, setIcon] = useState(account?.icon ?? "wallet");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit({
        name,
        type,
        currency: type === "crypto_wallet" ? "USD" : currency,
        current_balance: type === "crypto_wallet" ? 0 : parseFloat(balance) || 0,
        color,
        icon,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
    setLoading(false);
  };

  return (
    <div style={overlayStyle}>
      <div className="animate-scale-in" style={cardStyle}>
        <div style={headerStyle}>
          <h2 style={headingStyle}>
            {account ? "Editar Cuenta" : "Nueva Cuenta"}
          </h2>
          <button onClick={onClose} type="button" style={closeBtnStyle}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldColStyle}>
            <label style={labelStyle}>Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Mi cuenta principal"
              style={inputStyle}
            />
          </div>

          <div style={gridRowStyle}>
            <div style={fieldColStyle}>
              <label style={labelStyle}>Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                style={inputStyle}
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldColStyle}>
              <label style={labelStyle}>Moneda</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={inputStyle}
                disabled={type === "crypto_wallet"}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="MXN">MXN</option>
                <option value="ARS">ARS</option>
                <option value="COP">COP</option>
                <option value="CLP">CLP</option>
                <option value="PEN">PEN</option>
                <option value="BRL">BRL</option>
              </select>
            </div>
          </div>

          <div style={fieldColStyle}>
            <label style={labelStyle}>
              {type === "crypto_wallet" ? "Valor inicial" : "Balance inicial"}
            </label>
            <input
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              style={inputStyle}
              disabled={type === "crypto_wallet"}
            />
            {type === "crypto_wallet" && (
              <p
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                  lineHeight: 1.5,
                }}
              >
                El valor de una wallet cripto se calcula automáticamente con los
                activos y los precios de CoinGecko.
              </p>
            )}
          </div>

          <div style={fieldColStyle}>
            <label style={labelStyle}>Ícono</label>
            <div style={iconRowStyle}>
              {ICONS.map((ic) => (
                <button
                  key={ic.value}
                  type="button"
                  onClick={() => setIcon(ic.value)}
                  style={{
                    ...iconBtnBase,
                    background:
                      icon === ic.value
                        ? "rgba(201, 168, 76, 0.15)"
                        : "var(--color-background)",
                    color:
                      icon === ic.value
                        ? "var(--color-accent)"
                        : "var(--color-text-secondary)",
                    border:
                      icon === ic.value
                        ? "1px solid rgba(201, 168, 76, 0.3)"
                        : "1px solid var(--color-border)",
                  }}
                >
                  {ic.label}
                </button>
              ))}
            </div>
          </div>

          <div style={fieldColStyle}>
            <label style={labelStyle}>Color</label>
            <div style={colorRowStyle}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border:
                      color === c
                        ? "2px solid rgba(255, 255, 255, 0.4)"
                        : "2px solid transparent",
                    padding: 0,
                    cursor: "pointer",
                    backgroundColor: c,
                    transform: color === c ? "scale(1.1)" : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                background: "rgba(248, 113, 113, 0.12)",
                border: "1px solid rgba(248, 113, 113, 0.25)",
                color: "var(--color-danger)",
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <div style={actionsRowStyle}>
            <button
              type="button"
              onClick={onClose}
              style={{
                ...actionBtnBase,
                background: "var(--color-background)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-secondary)",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...actionBtnBase,
                background: "var(--color-accent)",
                color: "var(--color-background)",
                border: "none",
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? "Guardando..." : account ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
