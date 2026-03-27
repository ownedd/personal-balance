import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Account, TransactionType } from "@/lib/database.types.ts";

const TX_TYPES: { value: TransactionType; label: string; color: string }[] = [
  { value: "income", label: "Ingreso", color: "var(--color-success)" },
  { value: "expense", label: "Gasto", color: "var(--color-danger)" },
  { value: "adjustment", label: "Ajuste", color: "var(--color-info)" },
];

const CATEGORIES = [
  "Salario",
  "Freelance",
  "Alimentación",
  "Transporte",
  "Vivienda",
  "Servicios",
  "Entretenimiento",
  "Salud",
  "Educación",
  "Transferencia",
  "Otro",
];

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 500,
  color: "var(--color-text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const fieldGroup: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  backgroundColor: "var(--color-background)",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  color: "var(--color-text-primary)",
  fontSize: "0.875rem",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

interface TransactionFormProps {
  accounts: Account[];
  defaultAccountId?: string;
  onSubmit: (data: {
    account_id: string;
    type: TransactionType;
    amount: number;
    description: string;
    category?: string;
    transaction_date?: string;
  }) => Promise<void>;
  onClose: () => void;
}

export function TransactionForm({
  accounts,
  defaultAccountId,
  onSubmit,
  onClose,
}: TransactionFormProps) {
  const [accountId, setAccountId] = useState(
    defaultAccountId ?? accounts[0]?.id ?? ""
  );
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit({
        account_id: accountId,
        type,
        amount: parseFloat(amount),
        description,
        category: category || undefined,
        transaction_date: date,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
    setLoading(false);
  };

  const focusInputStyle: React.CSSProperties = {
    borderColor: "color-mix(in srgb, var(--color-accent) 50%, var(--color-border))",
    boxShadow: "0 0 0 1px color-mix(in srgb, var(--color-accent) 20%, transparent)",
  };

  const blurInputStyle: React.CSSProperties = {
    borderColor: "var(--color-border)",
    boxShadow: "none",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <style>{`
        #transaction-form-root input::placeholder,
        #transaction-form-root textarea::placeholder {
          color: var(--color-text-muted);
        }
      `}</style>
      <div
        id="transaction-form-root"
        className="animate-scale-in"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "32rem",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 20,
            borderBottom: "1px solid var(--color-border)",
            position: "sticky",
            top: 0,
            backgroundColor: "var(--color-surface)",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.25rem",
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            Nuevo Movimiento
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px",
              borderRadius: "6px",
              border: "none",
              background: "transparent",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              transition: "color 0.15s, background-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-text-primary)";
              e.currentTarget.style.backgroundColor = "var(--color-surface-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-text-muted)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X style={{ width: 20, height: 20, display: "block" }} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div style={fieldGroup}>
            <label style={labelStyle}>Tipo</label>
            <div style={{ display: "flex", gap: 8 }}>
              {TX_TYPES.map((t) => {
                const active = type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "border-color 0.15s, background-color 0.15s, color 0.15s",
                      ...(active
                        ? {
                            color: t.color,
                            backgroundColor: `color-mix(in srgb, ${t.color} 22%, var(--color-surface-elevated))`,
                            border: `1px solid color-mix(in srgb, ${t.color} 35%, transparent)`,
                          }
                        : {
                            color: "var(--color-text-muted)",
                            backgroundColor: "var(--color-background)",
                            border: "1px solid var(--color-border)",
                          }),
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor =
                          "var(--color-surface-hover)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor =
                          "var(--color-background)";
                      }
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>Cuenta</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              style={{ ...inputBase }}
              onFocus={(e) => Object.assign(e.currentTarget.style, focusInputStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, blurInputStyle)}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency})
                </option>
              ))}
            </select>
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>
              {type === "adjustment" ? "Nuevo balance" : "Monto"}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
              style={{ ...inputBase }}
              onFocus={(e) => Object.assign(e.currentTarget.style, focusInputStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, blurInputStyle)}
            />
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>Descripción</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Descripción del movimiento"
              style={{ ...inputBase }}
              onFocus={(e) => Object.assign(e.currentTarget.style, focusInputStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, blurInputStyle)}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <div style={fieldGroup}>
              <label style={labelStyle}>Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ ...inputBase }}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusInputStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, blurInputStyle)}
              >
                <option value="">Sin categoría</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldGroup}>
              <label style={labelStyle}>Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ ...inputBase }}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusInputStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, blurInputStyle)}
              />
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                backgroundColor:
                  "color-mix(in srgb, var(--color-danger) 15%, var(--color-surface))",
                border:
                  "1px solid color-mix(in srgb, var(--color-danger) 20%, transparent)",
                color: "var(--color-danger)",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px 16px",
                backgroundColor: "var(--color-background)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-secondary)",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-surface-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-background)";
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              style={{
                flex: 1,
                padding: "10px 16px",
                backgroundColor: "var(--color-accent)",
                border: "none",
                color: "var(--color-background)",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: loading || !amount ? "not-allowed" : "pointer",
                transition: "background-color 0.15s, opacity 0.15s",
                opacity: loading || !amount ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading && amount) {
                  e.currentTarget.style.backgroundColor = "var(--color-accent-hover)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-accent)";
              }}
            >
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
