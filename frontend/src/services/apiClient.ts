/**
 * Centralized API Client for InspectIQ
 * Manages HTTP communication with the backend FastAPI service.
 * Supports environment-configured base URLs, request timeouts, and typed error handling.
 */

export interface RequestOptions {
  timeoutMs?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  public status?: number;
  public code?: 'NETWORK_ERROR' | 'TIMEOUT_ERROR' | 'VALIDATION_ERROR' | 'SERVER_ERROR' | 'AUTH_ERROR' | 'UNKNOWN_ERROR';
  public details?: unknown;

  constructor(
    message: string,
    status?: number,
    code?: 'NETWORK_ERROR' | 'TIMEOUT_ERROR' | 'VALIDATION_ERROR' | 'SERVER_ERROR' | 'AUTH_ERROR' | 'UNKNOWN_ERROR',
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ApiClient {
  private static getBaseUrl(): string {
    // Standard Vite environment variable
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && typeof envUrl === 'string') {
      return envUrl.replace(/\/+$/, '');
    }
    // Default to empty string for relative proxying
    return '';
  }

  private static formatUrl(endpoint: string): string {
    const base = this.getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return base ? `${base}${cleanEndpoint}` : cleanEndpoint;
  }

  /**
   * Execute typed HTTP GET request
   */
  public static async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * Execute typed HTTP POST request
   */
  public static async post<T>(endpoint: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  }

  /**
   * Health check utility to verify backend connectivity
   */
  public static async checkHealth(timeoutMs = 3000): Promise<{ status: string; service: string; version: string }> {
    return this.get<{ status: string; service: string; version: string }>('/api/v1/health', { timeoutMs });
  }

  /**
   * Core request executor with timeout and error classification
   */
  private static async request<T>(endpoint: string, init: RequestInit & RequestOptions): Promise<T> {
    const url = this.formatUrl(endpoint);
    const timeoutMs = init.timeoutMs || 10000;

    const controller = new AbortController();
    let timeoutTriggered = false;

    const timer = setTimeout(() => {
      timeoutTriggered = true;
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        signal: init.signal || controller.signal,
      });

      clearTimeout(timer);

      // Handle non-2xx HTTP responses
      if (!response.ok) {
        let errorData: unknown;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }

        let code: ApiError['code'] = 'SERVER_ERROR';
        if (response.status === 401 || response.status === 403) {
          code = 'AUTH_ERROR';
        } else if (response.status === 422 || response.status === 400) {
          code = 'VALIDATION_ERROR';
        }

        const message = 
          typeof errorData === 'object' && errorData !== null && 'detail' in errorData
            ? String((errorData as { detail: unknown }).detail)
            : `API Request failed with status ${response.status}`;

        throw new ApiError(message, response.status, code, errorData);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      clearTimeout(timer);

      if (err instanceof ApiError) {
        throw err;
      }

      if (timeoutTriggered) {
        throw new ApiError(`Request to ${endpoint} timed out after ${timeoutMs}ms`, 408, 'TIMEOUT_ERROR');
      }

      const errorMsg = err instanceof Error ? err.message : 'Unknown network failure';
      throw new ApiError(`Network connection failed: ${errorMsg}`, 0, 'NETWORK_ERROR', err);
    }
  }
}
