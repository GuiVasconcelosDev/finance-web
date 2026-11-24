import type { 
Balances, 
CategoryTotal, 
Summary, 
Transaction,
Category,
TransactionType,
Account,
AccountType,  

} from "./types";

const TOKEN_KEY = "finance.token";

export const tokenStore = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function readMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.detail ?? body.title ?? "Erro inesperado";
  } catch {
    return "Erro inesperado";
  }
}

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();

  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(0, "Não foi possível conectar à API.");
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      tokenStore.clear();
      unauthorizedHandler?.();
    }
    throw new ApiError(response.status, await readMessage(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export function login(email: string, password: string) {
  return request<{ accessToken: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(name: string, email: string, password: string) {
  return request<void>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export const dashboardApi = {
  summary: () => request<Summary>("/api/dashboard/summary"),
  balances: () => request<Balances>("/api/dashboard/balances"),
  byCategory: () => request<CategoryTotal[]>("/api/dashboard/by-category"),
  transactions: () => request<Transaction[]>("/api/transactions"),
};

export const accountsApi = {
  list: () => request<Account[]>("/api/accounts"),
  create: (data: { name: string; type: AccountType; initialBalance: number }) =>
    request<Account>("/api/accounts", { method: "POST", body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/api/accounts/${id}`, { method: "DELETE" }),
};

export const categoriesApi = {
  list: () => request<Category[]>("/api/categories"),
  create: (data: { name: string; type: TransactionType }) =>
    request<Category>("/api/categories", { method: "POST", body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/api/categories/${id}`, { method: "DELETE" }),
};

export interface TransactionInput {
  accountId: string;
  categoryId: string | null;
  type: TransactionType;
  amount: number;
  description: string;
  transactionDate: string;
}

export const transactionsApi = {
  list: () => request<Transaction[]>("/api/transactions"),
  create: (data: TransactionInput) =>
    request<Transaction>("/api/transactions", { method: "POST", body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/api/transactions/${id}`, { method: "DELETE" }),
};