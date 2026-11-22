import { useCallback, useEffect, useState } from "react";
import { setUnauthorizedHandler, tokenStore } from "./api";
import { Login } from "./Login";
import { Register } from "./Register";
import { Shell } from "./Shell";

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => tokenStore.get() !== null);
  const [mode, setMode] = useState<"login" | "register">("login");

  const handleLogout = useCallback(() => {
    tokenStore.clear();
    setAuthenticated(false);
    setMode("login");
  }, []);


  useEffect(() => {
    setUnauthorizedHandler(handleLogout);
    return () => setUnauthorizedHandler(null);
  }, [handleLogout]);

  if (authenticated) {
    return <Shell onLogout={handleLogout} />;
  }

  return mode === "login" ? (
    <Login onSuccess={() => setAuthenticated(true)} onSwitch={() => setMode("register")} />
  ) : (
    <Register onSuccess={() => setAuthenticated(true)} onSwitch={() => setMode("login")} />
  );
}