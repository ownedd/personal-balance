import { useState } from "react";
import { Calendar, Lock, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useMonthlySnapshots } from "@/hooks/use-monthly-snapshots.ts";
import { useAccounts } from "@/hooks/use-accounts.ts";
import {
  formatCurrency,
  getMonthName,
  getCurrentPeriod,
} from "@/lib/utils.ts";
import { usePrivacy } from "@/contexts/privacy-context.tsx";

interface PeriodGroup {
  year: number;
  month: number;
  snapshots: Array<{
    accountName: string;
    openingBalance: number;
    closingBalance: number;
    totalIncome: number;
    totalExpenses: number;
    currency: string;
  }>;
  totalClosing: number;
}

export function HistoryPage() {
  const { snapshots, loading, closeMonth } = useMonthlySnapshots();
  const { accounts } = useAccounts();
  const { mask } = usePrivacy();
  const [closing, setClosing] = useState(false);
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);

  const { year, month } = getCurrentPeriod();

  const handleCloseMonth = async () => {
    if (
      !confirm(
        `¿Cerrar el mes de ${getMonthName(month)} ${year}? Se generará un registro del estado actual de todas las cuentas.`
      )
    )
      return;
    setClosing(true);
    try {
      await closeMonth(year, month);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "No se pudo cerrar el mes.";
      alert(message);
    } finally {
      setClosing(false);
    }
  };

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const periods: PeriodGroup[] = [];
  const periodMap = new Map<string, PeriodGroup>();

  for (const snap of snapshots) {
    const key = `${snap.year}-${snap.month}`;
    if (!periodMap.has(key)) {
      periodMap.set(key, {
        year: snap.year,
        month: snap.month,
        snapshots: [],
        totalClosing: 0,
      });
    }
    const group = periodMap.get(key)!;
    const acc = accountMap.get(snap.account_id);
    group.snapshots.push({
      accountName: acc?.name ?? "Cuenta eliminada",
      openingBalance: Number(snap.opening_balance),
      closingBalance: Number(snap.closing_balance),
      totalIncome: Number(snap.total_income),
      totalExpenses: Number(snap.total_expenses),
      currency: acc?.currency ?? "USD",
    });
    group.totalClosing += Number(snap.closing_balance);
  }

  periodMap.forEach((v) => periods.push(v));
  periods.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 256,
        }}
      >
        <Loader2
          className="animate-spin"
          style={{
            width: 24,
            height: 24,
            color: "var(--color-accent)",
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--color-text-muted)",
            }}
          >
            Período actual
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              textTransform: "capitalize",
              color: "var(--color-text-primary)",
            }}
          >
            {getMonthName(month)} {year}
          </p>
        </div>
        <button
          onClick={handleCloseMonth}
          disabled={closing}
          style={{
            padding: "10px 18px",
            background: "var(--color-accent)",
            color: "var(--color-background)",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: closing ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            opacity: closing ? 0.5 : 1,
          }}
        >
          {closing ? (
            <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />
          ) : (
            <Lock style={{ width: 16, height: 16 }} />
          )}
          Cerrar Mes
        </button>
      </div>

      {periods.length === 0 ? (
        <div
          className="glass animate-fade-in"
          style={{ padding: 48, textAlign: "center", borderRadius: 14 }}
        >
          <Calendar
            style={{
              width: 40,
              height: 40,
              color: "var(--color-text-muted)",
              margin: "0 auto 16px",
              display: "block",
            }}
          />
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            Sin registros históricos
          </p>
          <p style={{ color: "var(--color-text-muted)", fontSize: 11 }}>
            Cierra tu primer mes para empezar a ver el historial
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {periods.map((period, i) => {
            const key = `${period.year}-${period.month}`;
            const isExpanded = expandedPeriod === key;

            return (
              <div
                key={key}
                className={`glass animate-fade-in stagger-${Math.min(i + 1, 6)}`}
                style={{ borderRadius: 14, overflow: "hidden" }}
              >
                <button
                  onClick={() => setExpandedPeriod(isExpanded ? null : key)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 20,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: "rgba(201,168,76,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Calendar
                        style={{ width: 20, height: 20, color: "var(--color-accent)" }}
                      />
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "var(--color-text-primary)",
                          textTransform: "capitalize",
                        }}
                      >
                        {getMonthName(period.month)} {period.year}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                        {period.snapshots.length} cuenta
                        {period.snapshots.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 14,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {mask(formatCurrency(period.totalClosing))}
                    </span>
                    {isExpanded ? (
                      <ChevronUp
                        style={{ width: 16, height: 16, color: "var(--color-text-muted)" }}
                      />
                    ) : (
                      <ChevronDown
                        style={{ width: 16, height: 16, color: "var(--color-text-muted)" }}
                      />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div
                    className="animate-fade-in"
                    style={{
                      padding: "0 20px 20px",
                      borderTop: "1px solid var(--color-border-subtle)",
                    }}
                  >
                    <div
                      style={{
                        marginTop: 16,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      {period.snapshots.map((snap, j) => {
                        const change =
                          snap.closingBalance - snap.openingBalance;

                        return (
                          <div
                            key={j}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "10px 12px",
                              borderRadius: 10,
                              background: "rgba(15,17,23,0.5)",
                            }}
                          >
                            <div>
                              <p
                                style={{
                                  fontSize: 13,
                                  color: "var(--color-text-primary)",
                                  fontWeight: 500,
                                }}
                              >
                                {snap.accountName}
                              </p>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                  marginTop: 4,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: "var(--color-text-muted)",
                                  }}
                                >
                                  Apertura:{" "}
                                  {mask(formatCurrency(
                                    snap.openingBalance,
                                    snap.currency
                                  ))}
                                </span>
                                <span
                                  style={{ fontSize: 11, color: "var(--color-success)" }}
                                >
                                  +{mask(formatCurrency(snap.totalIncome, snap.currency))}
                                </span>
                                <span
                                  style={{ fontSize: 11, color: "var(--color-danger)" }}
                                >
                                  -{mask(formatCurrency(snap.totalExpenses, snap.currency))}
                                </span>
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <p
                                style={{
                                  fontSize: 14,
                                  fontWeight: 500,
                                  color: "var(--color-text-primary)",
                                  fontVariantNumeric: "tabular-nums",
                                }}
                              >
                                {mask(formatCurrency(
                                  snap.closingBalance,
                                  snap.currency
                                ))}
                              </p>
                              <p
                                style={{
                                  fontSize: 11,
                                  fontVariantNumeric: "tabular-nums",
                                  color:
                                    change >= 0
                                      ? "var(--color-success)"
                                      : "var(--color-danger)",
                                }}
                              >
                                {change >= 0 ? "+" : ""}
                                {mask(formatCurrency(change, snap.currency))}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
