import { ApiResponse, PaginatedResponse, ApiErrorPayload } from "../types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

export class ApiError extends Error {
  statusCode: number;
  errorCode?: string;
  fieldErrors?: Record<string, string[]>;
  isNetworkError: boolean;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.statusCode = payload.statusCode;
    this.errorCode = payload.errorCode;
    this.fieldErrors = payload.fieldErrors;
    this.isNetworkError = !!payload.isNetworkError;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  private getToken(): string | null {
    try {
      const token = localStorage.getItem("sims_auth_token");
      if (!token || token === "undefined" || token === "null" || token.trim() === "") {
        return null;
      }
      return token;
    } catch {
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const token = this.getToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 204 No Content
      if (response.status === 204) {
        return null as unknown as T;
      }

      let data: any = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        // Handle 401 Unauthorized - notify application
        if (response.status === 401) {
          try {
            localStorage.removeItem("sims_auth_token");
            localStorage.removeItem("sims_user_profile");
          } catch {
            // ignore storage error
          }
          window.dispatchEvent(new CustomEvent("sims:unauthorized"));
        }

        // Map field errors from 422 or error details
        const fieldErrors: Record<string, string[]> = data?.errors || {};
        if (data?.error?.details && Array.isArray(data.error.details)) {
          data.error.details.forEach((item: { field?: string; message: string }) => {
            const key = item.field || "general";
            if (!fieldErrors[key]) fieldErrors[key] = [];
            fieldErrors[key].push(item.message);
          });
        }

        const message =
          data?.message ||
          data?.error?.message ||
          `HTTP Error ${response.status}: ${response.statusText}`;

        throw new ApiError({
          message,
          statusCode: response.status,
          errorCode: data?.error?.code,
          fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
          isNetworkError: false,
        });
      }

      // If envelope contains data field, return it or raw payload
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }

      // Network connection error
      throw new ApiError({
        message: `Cannot connect to API server at ${this.baseUrl}. Please ensure the backend is running and CORS is enabled.`,
        statusCode: 0,
        errorCode: "NETWORK_ERROR",
        isNetworkError: true,
      });
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }
    return this.request<T>(url, { method: "GET" });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(BASE_URL);
