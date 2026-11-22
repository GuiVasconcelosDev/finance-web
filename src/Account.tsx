import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { accountsApi } from "./api";
import { errorMessage } from "./errors";
import { accountTypeLabels, formatCurrency, parseMoney } from "./format";
import type { Account, AccountType } from "./types";

export function Accounts() {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("CHECKING");
  const [initialBalance, setInitialBalance] = useState("0");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    accountsApi
      .list()
      .then((data) => {
        if (!cancelled) setAccounts(data);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "Não foi possível carregar as contas."));
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const balance = parseMoney(initialBalance);
    if (balance === null) {
      setError("Informe um saldo inicial válido, como 1500,50.");
      return;
    }

    setSaving(true);
    try {
      await accountsApi.create({ name: name.trim(), type, initialBalance: balance });
      setName("");
      setType("CHECKING");
      setInitialBalance("0");
      reload();
    } catch (err) {
      setError(errorMessage(err, "Não foi possível criar a conta."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(account: Account) {
    if (!window.confirm(`Apagar a conta "${account.name}"?`)) return;
    setError(null);
    try {
      await accountsApi.remove(account.id);
      reload();
    } catch (err) {
      setError(errorMessage(err, "Não foi possível apagar a conta."));
    }
  }

  return (
    <main className="page">
      <header className="header">
        <div>
          <h1>Contas</h1>
          <p className="muted">Onde o seu dinheiro está guardado.</p>
        </div>
      </header>

      <section className="panel">
        <h2>Nova conta</h2>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Nome
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
          </label>

          <label>
            Tipo
            <select value={type} onChange={(e) => setType(e.target.value as AccountType)}>
              {Object.entries(accountTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <label>
            Saldo inicial
            <input
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              inputMode="decimal"
              required
            />
          </label>

          <button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Adicionar"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="panel">
        <h2>Suas contas</h2>
        {accounts === null ? (
          <p className="muted">Carregando...</p>
        ) : accounts.length === 0 ? (
          <p className="muted">Nenhuma conta ainda.</p>
        ) : (
          <ul className="list">
            {accounts.map((a) => (
              <li key={a.id} className="row">
                <span>
                  {a.name}
                  <span className="muted small"> · {accountTypeLabels[a.type]}</span>
                </span>
                <span className="actions">
                  <span>
                    {formatCurrency(a.initialBalance)}
                    <span className="muted small"> saldo inicial</span>
                  </span>
                  <button className="ghost small-btn" onClick={() => handleDelete(a)}>
                    Apagar
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}