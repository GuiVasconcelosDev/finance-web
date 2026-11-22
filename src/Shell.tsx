import { useState } from "react";
import { Accounts } from "./Account";
import { Categories } from "./Categories";
import { Dashboard } from "./Dashboard";
import { Transactions } from "./Transactions";

type View = "overview" | "transactions" | "accounts" | "categories";

const tabs: { id: View; label: string }[] = [
  { id: "overview", label: "Visão geral" },
  { id: "transactions", label: "Transações" },
  { id: "accounts", label: "Contas" },
  { id: "categories", label: "Categorias" },
];

interface ShellProps {
  onLogout: () => void;
}

export function Shell({ onLogout }: ShellProps) {
  const [view, setView] = useState<View>("overview");

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <div className="tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={tab.id === view ? "tab active" : "tab"}
                onClick={() => setView(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button className="ghost" onClick={onLogout}>Sair</button>
        </div>
      </nav>

      {view === "overview" && <Dashboard onLogout={onLogout} />}
      {view === "transactions" && <Transactions />}
      {view === "accounts" && <Accounts />}
      {view === "categories" && <Categories />}
    </>
  );
}