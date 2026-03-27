import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
}

export function getMonthName(month: number): string {
  const date = new Date(2024, month - 1);
  return new Intl.DateTimeFormat("es-ES", { month: "long" }).format(date);
}

export function getCurrentPeriod(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function getAccountTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    bank: "Cuenta Bancaria",
    cash: "Efectivo",
    savings: "Ahorro",
    credit_card: "Tarjeta de Crédito",
    crypto_wallet: "Wallet Cripto",
  };
  return labels[type] ?? type;
}

export function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    income: "Ingreso",
    expense: "Gasto",
    adjustment: "Ajuste",
  };
  return labels[type] ?? type;
}

export function formatAssetQuantity(quantity: number, symbol: string): string {
  const maximumFractionDigits = symbol === "USDT" ? 2 : 8;
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(quantity);
}
