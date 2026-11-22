import { ApiError } from "./api";

export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.status === 409 || err.status === 422) {
      return err.message;
    }
    if (err.status === 400) {
      return "Verifique os dados informados.";
    }
  }
  return fallback;
}