import { useEffect, useState } from "react";
import { ApiError, dashboardApi } from "./api";
import { formatCurrency, formatDate } from "./format";
import type { Balances, CategoryTotal, Summary, Transaction } from "./types";

interface DashboardData {
  summary: Summary;
  balances: Balances;
  categories: CategoryTotal[];
  transactions: Transaction[];
}

interface DashboardProps {
  onLogout: () => void;
}

interface CardProps {
  label: string;
  value: number;
  tone?: "positive" | "negative";
}

function Card({ label, value, tone }: CardProps) {
  return (
    <div className="card">
      <span className="muted small">{label}</span>
      <strong className={tone ?? ""}>{formatCurrency(value)}</strong>
    </div>
  );
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [summary, balances, categories, transactions] = await Promise.all([
          dashboardApi.summary(),
          dashboardApi.balances(),
          dashboardApi.byCategory(),
          dashboardApi.transactions(),
        ]);
        if (!cancelled) {
          setData({ summary, balances, categories, transactions });
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          onLogout(); // token expirado ou inválido
          return;
        }
        setError("Não foi possível carregar o dashboard.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [onLogout]);

  if (error) {
    return (
      <main className="page">
        <p className="error">{error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="page">
        <p className="muted">Carregando...</p>
      </main>
    );
  }

  const { summary, balances, categories, transactions } = data;

  return (
    <main className="page">
      <header className="header">
        <div>
          <h1>Visão geral</h1>
          <p className="muted">
            {formatDate(summary.from)} a {formatDate(summary.to)}
          </p>
        </div>
        <button className="ghost" onClick={onLogout}>Sair</button>
      </header>

      <section className="cards">
        <Card label="Saldo total" value={balances.total} />
        <Card label="Entradas" value={summary.totalIncome} tone="positive" />
        <Card label="Saídas" value={summary.totalExpense} tone="negative" />
        <Card label="Resultado do período" value={summary.net} />
      </section>

      <div className="grid">
        <section className="panel">
          <h2>Gastos por categoria</h2>
          {categories.length === 0 ? (
            <p className="muted">Sem gastos no período.</p>
          ) : (
            <ul className="bars">
              {categories.map((c) => (
                <li key={c.categoryId ?? "sem-categoria"}>
                  <div className="row">
                    <span>{c.category}</span>
                    <span>{formatCurrency(c.total)}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${c.percentage}%` }} />
                  </div>
                  <span className="muted small">{c.percentage.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <h2>Contas</h2>
          <ul className="list">
            {balances.accounts.map((a) => (
              <li key={a.accountId} className="row">
                <span>{a.name}</span>
                <span>{formatCurrency(a.balance)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel">
        <h2>Últimas transações</h2>
        {transactions.length === 0 ? (
          <p className="muted">Nenhuma transação no período.</p>
        ) : (
          <ul className="list">
            {transactions.slice(0, 8).map((t) => (
              <li key={t.id} className="row">
                <span>
                  {t.description ?? "Sem descrição"}
                  <span className="muted small"> · {formatDate(t.transactionDate)}</span>
                </span>
                <span className={t.type === "INCOME" ? "positive" : "negative"}>
                  {t.type === "INCOME" ? "+" : "-"} {formatCurrency(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}