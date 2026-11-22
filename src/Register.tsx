import { useState } from "react";
import type { FormEvent } from "react";
import { ApiError, login, register, tokenStore } from "./api";

interface RegisterProps {
  onSuccess: () => void;
  onSwitch: () => void;
}

export function Register({ onSuccess, onSwitch }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // Esta checagem é só para responder rápido. Quem garante as regras é o backend.
    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      const { accessToken } = await login(email.trim(), password);
      tokenStore.set(accessToken);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Já existe uma conta com este e-mail.");
      } else if (err instanceof ApiError && err.status === 400) {
        setError("Verifique os dados informados.");
      } else {
        setError("Não foi possível criar a conta. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Criar conta</h1>

        <label>
          Nome
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            autoComplete="name"
            required
          />
        </label>

        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={255}
            autoComplete="username"
            required
          />
        </label>

        <label>
          Senha (mínimo 8 caracteres)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            required
          />
        </label>

        <label>
          Confirmar senha
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            maxLength={72}
            autoComplete="new-password"
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar conta"}
        </button>

        <p className="switch muted small">
          Já tem conta?{" "}
          <button type="button" className="link" onClick={onSwitch}>
            Entrar
          </button>
        </p>
      </form>
    </main>
  );
}