/**
 * Thin client for the Spring Boot backend (see backend/README.md).
 *
 * The base URL comes from VITE_API_BASE_URL. When it is not set, or the service
 * is unreachable, callers fall back to the app's built-in behaviour so every
 * feature keeps working.
 */

const RAW_BASE = (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "";

export const API_BASE = RAW_BASE.replace(/\/+$/, "");

export const hasBackend = API_BASE.length > 0;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  if (!hasBackend) throw new ApiError("Backend is not configured.", 0);

  const { timeoutMs = 20000, ...rest } = init ?? {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(rest.headers ?? {}),
      },
    });

    const text = await res.text();
    const body = text ? (JSON.parse(text) as unknown) : null;

    if (!res.ok) {
      const message =
        body && typeof body === "object" && "message" in body
          ? String((body as { message: unknown }).message)
          : `Request failed (${res.status}).`;
      throw new ApiError(message, res.status);
    }

    return body as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("The server took too long to respond.", 0);
    }
    throw new ApiError(err instanceof Error ? err.message : "Could not reach the server.", 0);
  } finally {
    clearTimeout(timer);
  }
}

/* ---------------------------------- types --------------------------------- */

export type ApiContact = {
  id: number;
  name: string;
  number: string;
  tone: string;
  category: string;
  priority: number;
};

export type ApiReport = {
  id: number;
  kind: string;
  risk: string;
  location?: string;
  notes?: string;
  attachments: string[];
  createdAt: string;
};

export type ApiIncidentEvent = {
  id: number;
  icon: string;
  title: string;
  detail?: string;
  tone: string;
  occurredAt: string;
};

export type ApiIncident = {
  reference: string;
  status: string;
  location?: string;
  createdAt: string;
  events: ApiIncidentEvent[];
};

/* --------------------------------- calls ---------------------------------- */

export const api = {
  contacts: () => apiFetch<ApiContact[]>("/api/contacts"),

  reportStats: () => apiFetch<{ reportsThisMonth: number; total: number }>("/api/reports/stats"),

  createReport: (body: {
    kind: string;
    risk: string;
    location?: string;
    notes?: string;
    attachments?: string[];
  }) => apiFetch<ApiReport>("/api/reports", { method: "POST", body: JSON.stringify(body) }),

  latestIncident: () => apiFetch<ApiIncident>("/api/incidents/latest"),

  triggerSos: (body: {
    deviceId?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    accuracyMeters?: number;
  }) => apiFetch<ApiIncident>("/api/sos", { method: "POST", body: JSON.stringify(body) }),

  assistant: (messages: { role: "user" | "assistant"; content: string }[]) =>
    apiFetch<{ reply: string }>("/api/assistant/chat", {
      method: "POST",
      body: JSON.stringify({ messages }),
      timeoutMs: 60000,
    }),
};
