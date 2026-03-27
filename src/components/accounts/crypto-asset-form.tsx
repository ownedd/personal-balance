import { useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { SUPPORTED_CRYPTO_ASSETS } from "@/lib/crypto.ts";
import type { AccountAssetWithPrice } from "@/lib/database.types.ts";

interface CryptoAssetFormProps {
  accountName: string;
  asset?: AccountAssetWithPrice | null;
  onSubmit: (data: {
    asset_symbol: string;
    asset_name: string;
    coingecko_id: string;
    quantity: number;
    average_buy_price?: number | null;
  }) => Promise<void>;
  onClose: () => void;
}

export function CryptoAssetForm({
  accountName,
  asset,
  onSubmit,
  onClose,
}: CryptoAssetFormProps) {
  const isEditing = !!asset;
  const [selectedSymbol, setSelectedSymbol] = useState(asset?.asset_symbol ?? "BTC");
  const [quantity, setQuantity] = useState(asset ? String(asset.quantity) : "");
  const [averageBuyPrice, setAverageBuyPrice] = useState(
    asset?.average_buy_price != null ? String(asset.average_buy_price) : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedAsset = useMemo(
    () =>
      SUPPORTED_CRYPTO_ASSETS.find((asset) => asset.symbol === selectedSymbol) ??
      SUPPORTED_CRYPTO_ASSETS[0],
    [selectedSymbol]
  );

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    background: "var(--color-background)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    color: "var(--color-text-primary)",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 500,
    color: "var(--color-text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    marginBottom: "6px",
    display: "block",
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit({
        asset_symbol: selectedAsset.symbol,
        asset_name: selectedAsset.name,
        coingecko_id: selectedAsset.coingeckoId,
        quantity: Number(quantity),
        average_buy_price: averageBuyPrice ? Number(averageBuyPrice) : null,
      });
    } catch (submissionError: unknown) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudo guardar el activo."
      );
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.6)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        className="animate-scale-in"
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "14px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                color: "var(--color-text-primary)",
              }}
            >
              {isEditing ? "Editar Activo" : "Agregar Activo"}
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "13px",
                color: "var(--color-text-muted)",
              }}
            >
              Wallet: {accountName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px",
              borderRadius: "8px",
              border: "none",
              background: "transparent",
              color: "var(--color-text-muted)",
              cursor: "pointer",
            }}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div>
            <label style={labelStyle}>Activo</label>
            <select
              value={selectedSymbol}
              onChange={(event) => setSelectedSymbol(event.target.value)}
              disabled={isEditing}
              style={{
                ...inputStyle,
                ...(isEditing ? { opacity: 0.6, cursor: "not-allowed" } : {}),
              }}
            >
              {SUPPORTED_CRYPTO_ASSETS.map((asset) => (
                <option key={asset.symbol} value={asset.symbol}>
                  {asset.symbol} - {asset.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Cantidad</label>
              <input
                type="number"
                step="0.00000001"
                min="0"
                required
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="0.00"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Precio Promedio USD</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={averageBuyPrice}
                onChange={(event) => setAverageBuyPrice(event.target.value)}
                placeholder="Opcional"
                style={inputStyle}
              />
            </div>
          </div>

          <div
            style={{
              padding: "12px 14px",
              background: "rgba(201, 168, 76, 0.08)",
              border: "1px solid rgba(201, 168, 76, 0.15)",
              borderRadius: "10px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "var(--color-text-secondary)",
                lineHeight: 1.5,
              }}
            >
              El valor en USD se calculará automáticamente con precios de
              CoinGecko.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.15)",
                color: "var(--color-danger)",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", paddingTop: "4px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid var(--color-border)",
                background: "var(--color-background)",
                color: "var(--color-text-secondary)",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !quantity}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                background: "var(--color-accent)",
                color: "var(--color-background)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Guardando..." : isEditing ? "Actualizar activo" : "Guardar activo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
