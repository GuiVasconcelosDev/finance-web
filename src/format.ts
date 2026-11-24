import type { AccountType } from "./types";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value: number): string {
  return currency.format(value);
}


export function formatDate(isoDate: string): string {
  const datePart = isoDate?.split("T")[0] ?? "";
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return "-";
  return `${day}/${month}/${year}`;
}

export const accountTypeLabels: Record<AccountType, string> = {
  CHECKING: "Conta corrente",
  WALLET: "Carteira",
  CREDIT_CARD: "Cartão de crédito",
  INVESTIMENT: "Investimento",
};

export function parseMoney(input: string): number | null {
  const normalized = input.trim().replace(",",".");
  if(!/^-?\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }
  return Number(normalized);
}

export function todayIso(): string {
  const now = new Date();
  const month = new String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}