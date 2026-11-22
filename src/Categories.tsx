import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { categoriesApi } from "./api";
import { errorMessage } from "./errors";
import type { Category, TransactionType } from "./types";

const typeLabels: Record<TransactionType, string> = {
  EXPENSE: "Saída",
  INCOME: "Entrada",
};

export function Categories() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    categoriesApi
      .list()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "Não foi possível carregar as categorias."));
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await categoriesApi.create({ name: name.trim(), type });
      setName("");
      reload();
    } catch (err) {
      setError(errorMessage(err, "Não foi possível criar a categoria."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    if (!window.confirm(`Apagar a categoria "${category.name}"?`)) return;
    setError(null);
    try {
      await categoriesApi.remove(category.id);
      reload();
    } catch (err) {
      setError(errorMessage(err, "Não foi possível apagar a categoria."));
    }
  }

  function renderList(listType: TransactionType) {
    const items = (categories ?? []).filter((c) => c.type === listType);
    return (
      <section className="panel">
        <h2>{listType === "EXPENSE" ? "Categorias de saída" : "Categorias de entrada"}</h2>
        {categories === null ? (
          <p className="muted">Carregando...</p>
        ) : items.length === 0 ? (
          <p className="muted">Nenhuma categoria.</p>
        ) : (
          <ul className="list">
            {items.map((c) => (
              <li key={c.id} className="row">
                <span>{c.name}</span>
                <button className="ghost small-btn" onClick={() => handleDelete(c)}>
                  Apagar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  return (
    <main className="page">
      <header className="header">
        <div>
          <h1>Categorias</h1>
          <p className="muted">Para saber em que o dinheiro entra e sai.</p>
        </div>
      </header>

      <section className="panel">
        <h2>Nova categoria</h2>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Nome
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
          </label>

          <label>
            Tipo
            <select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
              <option value="EXPENSE">{typeLabels.EXPENSE}</option>
              <option value="INCOME">{typeLabels.INCOME}</option>
            </select>
          </label>

          <button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Adicionar"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      <div className="columns">
        {renderList("EXPENSE")}
        {renderList("INCOME")}
      </div>
    </main>
  );
}