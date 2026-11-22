import { useState } from "react";
import type { FormEvent } from "react";
import { ApiError, login, tokenStore } from "./api";

interface LoginProps {
  onSuccess: () => void;
  onSwitch: () => void;
}

export function Login({ onSuccess, onSwitch }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { accessToken } = await login(email, password);
      tokenStore.set(accessToken);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "E-mail ou senha inválidos"
          : "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Entrar</h1>

        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="switch muted small">
          Não tem conta?{" "}
          <button type="button" className="link" onClick={onSwitch}>
            Criar conta
          </button>
        </p>
      </form>
    </main>
  );
}