import { useMemo, useState, type CSSProperties } from "react";
import { Coins, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useAccounts } from "@/hooks/use-accounts.ts";
import { useTransactions } from "@/hooks/use-transactions.ts";
import { AccountCard } from "@/components/accounts/account-card.tsx";
import { AccountForm } from "@/components/accounts/account-form.tsx";
import { CryptoAssetForm } from "@/components/accounts/crypto-asset-form.tsx";
import { TransactionForm } from "@/components/transactions/transaction-form.tsx";
import { TransactionList } from "@/components/transactions/transaction-list.tsx";
import { formatAssetQuantity, formatCurrency } from "@/lib/utils.ts";
import { usePrivacy } from "@/contexts/privacy-context.tsx";
import type { Account, AccountAssetWithPrice } from "@/lib/database.types.ts";

export function AccountsPage() {
  const {
    accounts,
    assetsByAccount,
    loading,
    totalBalance,
    createAccount,
    updateAccount,
    deactivateAccount,
    upsertAccountAsset,
    deleteAccountAsset,
  } = useAccounts();
  const { transactions, createTransaction, refetch: refetchTx } = useTransactions();

  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [showTxForm, setShowTxForm] = useState(false);
  const { mask } = usePrivacy();
  const [showCryptoAssetForm, setShowCryptoAssetForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AccountAssetWithPrice | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>();
  const [viewAccount, setViewAccount] = useState<Account | null>(null);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === viewAccount?.id) ?? null,
    [accounts, viewAccount]
  );

  const transactionAccounts = useMemo(
    () => accounts.filter((account) => account.type !== "crypto_wallet"),
    [accounts]
  );

  const accountTx = useMemo(
    () =>
      selectedAccount
        ? transactions.filter((t) => t.account_id === selectedAccount.id)
        : [],
    [selectedAccount, transactions]
  );

  const selectedCryptoAssets = useMemo(
    () =>
      selectedAccount?.type === "crypto_wallet"
        ? assetsByAccount[selectedAccount.id] ?? []
        : [],
    [selectedAccount, assetsByAccount]
  );

  const handleCreateAccount = async (data: Parameters<typeof createAccount>[0]) => {
    await createAccount(data);
    setShowAccountForm(false);
  };

  const handleUpdateAccount = async (data: Parameters<typeof updateAccount>[1]) => {
    if (!editAccount) return;
    await updateAccount(editAccount.id, data);
    setEditAccount(null);
  };

  const handleDelete = async (account: Account) => {
    if (!confirm(`¿Eliminar "${account.name}"? Esta acción no se puede deshacer.`)) return;
    await deactivateAccount(account.id);
    if (viewAccount?.id === account.id) setViewAccount(null);
  };

  const handleCreateTx = async (data: Parameters<typeof createTransaction>[0]) => {
    await createTransaction(data);
    setShowTxForm(false);
    refetchTx();
  };

  const handleUpsertAsset = async (data: {
    asset_symbol: string;
    asset_name: string;
    coingecko_id: string;
    quantity: number;
    average_buy_price?: number | null;
  }) => {
    const cryptoAccountId = selectedAccountId ?? selectedAccount?.id;
    if (!cryptoAccountId) return;
    await upsertAccountAsset({
      account_id: cryptoAccountId,
      ...data,
    });
    setShowCryptoAssetForm(false);
    setEditingAsset(null);
  };

  const handleDeleteAsset = async (assetId: string) => {
    const confirmed = confirm("¿Eliminar este activo de la wallet?");
    if (!confirmed) return;
    await deleteAccountAsset(assetId);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "256px",
        }}
      >
        <Loader2
          className="animate-spin"
          style={{
            width: "24px",
            height: "24px",
            color: "var(--color-accent)",
          }}
        />
      </div>
    );
  }

  const btnSecondary: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    background: "var(--color-surface-elevated)",
    color: "var(--color-text-secondary)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s, border-color 0.2s, color 0.2s",
  };

  const btnPrimary: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    background: "var(--color-accent)",
    color: "var(--color-background)",
    border: "1px solid var(--color-accent)",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s, border-color 0.2s, color 0.2s",
  };

  const btnPrimaryInline: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    background: "var(--color-accent)",
    color: "var(--color-background)",
    border: "1px solid var(--color-accent)",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s, border-color 0.2s, color 0.2s",
  };

  const btnAccentGhost: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    background: "rgba(201, 168, 76, 0.1)",
    color: "var(--color-accent)",
    border: "1px solid rgba(201, 168, 76, 0.2)",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s, border-color 0.2s, color 0.2s",
  };

  return (
    <div style={{ maxWidth: "1152px", marginLeft: "auto", marginRight: "auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "12px",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              margin: 0,
            }}
          >
            Balance total
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              lineHeight: 1.2,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            {mask(formatCurrency(totalBalance))}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={() => {
              setSelectedAccountId(undefined);
              setShowTxForm(true);
            }}
            style={{
              ...btnSecondary,
              opacity: transactionAccounts.length === 0 ? 0.5 : 1,
              cursor: transactionAccounts.length === 0 ? "not-allowed" : "pointer",
            }}
            disabled={transactionAccounts.length === 0}
          >
            <Plus style={{ width: "16px", height: "16px", flexShrink: 0 }} />
            Movimiento
          </button>
          <button type="button" onClick={() => setShowAccountForm(true)} style={btnPrimary}>
            <Plus style={{ width: "16px", height: "16px", flexShrink: 0 }} />
            Cuenta
          </button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div
          className="glass animate-fade-in"
          style={{
            borderRadius: "12px",
            padding: "48px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: "14px",
              marginBottom: "16px",
              marginTop: 0,
            }}
          >
            No tienes cuentas registradas aún
          </p>
          <button type="button" onClick={() => setShowAccountForm(true)} style={btnPrimaryInline}>
            <Plus style={{ width: "16px", height: "16px", flexShrink: 0 }} />
            Crear primera cuenta
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {accounts.map((account, i) => (
            <AccountCard
              key={account.id}
              account={account}
              index={i}
              assetCount={assetsByAccount[account.id]?.length ?? 0}
              onEdit={setEditAccount}
              onDelete={handleDelete}
              onClick={(acc) => setViewAccount(viewAccount?.id === acc.id ? null : acc)}
            />
          ))}
        </div>
      )}

      {selectedAccount && selectedAccount.type !== "crypto_wallet" && (
        <div
          className="glass animate-fade-in"
          style={{
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "18px",
                lineHeight: 1.3,
                color: "var(--color-text-primary)",
                margin: 0,
                fontWeight: 400,
              }}
            >
              Movimientos — {selectedAccount.name}
            </h3>
            <button
              type="button"
              onClick={() => {
                setSelectedAccountId(selectedAccount.id);
                setShowTxForm(true);
              }}
              style={btnAccentGhost}
            >
              <Plus style={{ width: "14px", height: "14px", flexShrink: 0 }} />
              Agregar
            </button>
          </div>
          <TransactionList transactions={accountTx} />
        </div>
      )}

      {selectedAccount && selectedAccount.type === "crypto_wallet" && (
        <div
          className="glass animate-fade-in"
          style={{
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "18px",
                  lineHeight: 1.3,
                  color: "var(--color-text-primary)",
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                Activos — {selectedAccount.name}
              </h3>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "13px",
                  color: "var(--color-text-muted)",
                }}
              >
                Valorizados automáticamente con CoinGecko
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingAsset(null);
                setSelectedAccountId(selectedAccount.id);
                setShowCryptoAssetForm(true);
              }}
              style={btnAccentGhost}
            >
              <Plus style={{ width: "14px", height: "14px", flexShrink: 0 }} />
              Activo
            </button>
          </div>

          {selectedCryptoAssets.length === 0 ? (
            <div
              style={{
                borderRadius: "12px",
                padding: "24px",
                background: "rgba(15,17,23,0.45)",
                border: "1px solid rgba(255,255,255,0.04)",
                textAlign: "center",
              }}
            >
              <Coins
                style={{
                  width: 26,
                  height: 26,
                  color: "var(--color-accent)",
                  margin: "0 auto 10px",
                  display: "block",
                }}
              />
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--color-text-secondary)",
                  margin: 0,
                }}
              >
                Esta wallet todavía no tiene activos cargados.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {selectedCryptoAssets.map((asset) => (
                <div
                  key={asset.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 1fr 1fr auto",
                    gap: "16px",
                    alignItems: "center",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    background: "rgba(15,17,23,0.45)",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        color: "var(--color-text-primary)",
                        fontWeight: 600,
                      }}
                    >
                      {asset.asset_symbol}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "12px",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {asset.asset_name}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "var(--color-text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Cantidad
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "14px",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {formatAssetQuantity(asset.quantity, asset.asset_symbol)}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "var(--color-text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Valor
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "14px",
                        color: "var(--color-text-primary)",
                        fontWeight: 600,
                      }}
                    >
                      {mask(formatCurrency(asset.current_value_usd, "USD"))}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "12px",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {mask(formatCurrency(asset.current_price_usd, "USD"))} c/u
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAsset(asset);
                        setSelectedAccountId(selectedAccount!.id);
                        setShowCryptoAssetForm(true);
                      }}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "10px",
                        border: "1px solid rgba(201,168,76,0.2)",
                        background: "rgba(201,168,76,0.08)",
                        color: "var(--color-accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                      title="Editar activo"
                    >
                      <Pencil style={{ width: 14, height: 14 }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAsset(asset.id)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "10px",
                        border: "1px solid rgba(248,113,113,0.15)",
                        background: "rgba(248,113,113,0.08)",
                        color: "var(--color-danger)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                      title="Eliminar activo"
                    >
                      <Trash2 style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedAccount && transactions.length > 0 && (
        <div
          className="glass animate-fade-in"
          style={{
            borderRadius: "12px",
            padding: "24px",
            marginTop: "24px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              lineHeight: 1.3,
              color: "var(--color-text-primary)",
              marginBottom: "16px",
              marginTop: 0,
              fontWeight: 400,
            }}
          >
            Movimientos Recientes
          </h3>
          <TransactionList transactions={transactions.slice(0, 15)} />
        </div>
      )}

      {showAccountForm && (
        <AccountForm
          onSubmit={handleCreateAccount}
          onClose={() => setShowAccountForm(false)}
        />
      )}

      {editAccount && (
        <AccountForm
          account={editAccount}
          onSubmit={handleUpdateAccount}
          onClose={() => setEditAccount(null)}
        />
      )}

      {showTxForm && (
        <TransactionForm
          accounts={transactionAccounts}
          defaultAccountId={selectedAccountId}
          onSubmit={handleCreateTx}
          onClose={() => setShowTxForm(false)}
        />
      )}

      {showCryptoAssetForm && selectedAccount && (
        <CryptoAssetForm
          accountName={selectedAccount.name}
          asset={editingAsset}
          onSubmit={handleUpsertAsset}
          onClose={() => {
            setShowCryptoAssetForm(false);
            setEditingAsset(null);
          }}
        />
      )}
    </div>
  );
}
