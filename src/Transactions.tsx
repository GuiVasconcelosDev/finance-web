import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { accountsApi, categoriesApi, transactionsApi } from "./api";
import { errorMessage } from "./errors";
import { formatCurrency, formatDate, parseMoney, todayIso } from "./format";
import type { Account, Category, Transaction, TransactionType } from "./types";

interface Data {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
}

export function Transactions() {
  const [data, setData] = useState<Data | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(todayIso);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([transactionsApi.list(), accountsApi.list(), categoriesApi.list()])
      .then(([transactions, accounts, categories]) => {
        if (!cancelled) setData({ transactions, accounts, categories });
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "Não foi possível carregar os dados."));
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  // Valores derivados: calculados a cada renderização, sem precisar de estado próprio.
  const accounts = data?.accounts ?? [];
  const allCategories = data?.categories ?? [];
  const categoriesOfType = allCategories.filter((c) => c.type === type);
  const selectedAccountId = accountId || accounts[0]?.id || "";
  const accountNames = new Map<string, string>(accounts.map((a): [string, string] => [a.id, a.name]));
  const categoryNames = new Map<string, string>(allCategories.map((c): [string, string] => [c.id, c.name]));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const value = parseMoney(amount);
    if (value === null || value <= 0) {
      setError("Informe um valor maior que zero, como 19,90.");
      return;
    }

    setSaving(true);
    try {
      await transactionsApi.create({
        accountId: selectedAccountId,
        categoryId: categoryId || null,
        type,
        amount: value,
        description: description.trim(),
        transactionDate: date,
      });
      setAmount("");
      setDescription("");
      reload();
    } catch (err) {
      setError(errorMessage(err, "Não foi possível salvar a transação."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(transaction: Transaction) {
    if (!window.confirm("Apagar esta transação?")) return;
    setError(null);
    try {
      await transactionsApi.remove(transaction.id);
      reload();
    } catch (err) {
      setError(errorMessage(err, "Não foi possível apagar a transação."));
    }
  }

  if (data === null) {
    return (
      <main className="page">
        {error ? <p className="error">{error}</p> : <p className="muted">Carregando...</p>}
      </main>
    );
  }

  return (
    <main className="page">
      <header className="header">
        <div>
          <h1>Transações</h1>
          <p className="muted">Lançamentos do mês atual.</p>
        </div>
      </header>

      <section className="panel">
        <h2>Nova transação</h2>

        {accounts.length === 0 ? (
          <p className="muted">Cadastre uma conta na aba Contas antes de lançar transações.</p>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Tipo
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value as TransactionType);
                  setCategoryId(""); // a lista de categorias muda com o tipo
                }}
              >
                <option value="EXPENSE">Saída</option>
                <option value="INCOME">Entrada</option>
              </select>
            </label>

            <label>
              Valor
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="0,00"
                required
              />
            </label>

            <label>
              Conta
              <select value={selectedAccountId} onChange={(e) => setAccountId(e.target.value)}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </label>

            <label>
              Categoria
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Sem categoria</option>
                {categoriesOfType.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>

            <label>
              Data
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>

            <label>
              Descrição
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={255}
              />
            </label>

            <button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Lançar"}
            </button>
          </form>
        )}
        {error && <p className="error">{error}</p>}
      </section>

      <section className="panel">
        <h2>Lançamentos</h2>
        {data.transactions.length === 0 ? (
          <p className="muted">Nenhuma transação neste mês.</p>
        ) : (
          <ul className="list">
            {data.transactions.map((t) => {
              const categoryName = t.categoryId ? categoryNames.get(t.categoryId) : undefined;
              return (
                <li key={t.id} className="row">
                  <span>
                    {t.description ?? categoryName ?? "Sem descrição"}
                    <span className="muted small">
                      {" "}· {accountNames.get(t.accountId) ?? "Conta"} · {formatDate(t.transactionDate)}
                      {t.description && categoryName ? ` · ${categoryName}` : ""}
                    </span>
                  </span>
                  <span className="actions">
                    <span className={t.type === "INCOME" ? "positive" : "negative"}>
                      {t.type === "INCOME" ? "+" : "-"} {formatCurrency(t.amount)}
                    </span>
                    <button className="ghost small-btn" onClick={() => handleDelete(t)}>
                      Apagar
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}