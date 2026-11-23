const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  statusCode: number;
  data: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('joraiq_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('joraiq_token');
      localStorage.removeItem('joraiq_user');
    }

    let errorMessage: string = `Request failed with status ${response.status}`;
    if (data && typeof data === 'object') {
      if (data.message && typeof data.message === 'string') {
        errorMessage = data.message;
      } else if (data.message && Array.isArray(data.message)) {
        errorMessage = data.message.join(', ');
      } else if (data.error) {
        if (typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (data.error.message) {
          errorMessage = Array.isArray(data.error.message)
            ? data.error.message.join(', ')
            : String(data.error.message);
        } else if (data.error.details) {
          errorMessage = Array.isArray(data.error.details)
            ? data.error.details.join(', ')
            : String(data.error.details);
        }
      }
    }

    throw new ApiError(errorMessage, response.status, data);
  }

  // Unwrap unified API envelope { success: true, status: 200, data: ... }
  if (data && typeof data === 'object' && data.success === true && 'data' in data) {
    return data.data as T;
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
};
