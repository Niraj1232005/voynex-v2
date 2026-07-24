const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function request(path: string, options: RequestInit = {}) {
  const url = `${API_URL}${path}`;
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && options.body) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Important for HttpOnly cookies
  };

  const response = await fetch(url, mergedOptions);

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  // Handle empty response/no content
  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export const api = {
  get: (path: string, options?: RequestInit) => request(path, { ...options, method: 'GET' }),
  post: (path: string, body?: any, options?: RequestInit) =>
    request(path, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (path: string, body?: any, options?: RequestInit) =>
    request(path, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: (path: string, body?: any, options?: RequestInit) =>
    request(path, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (path: string, options?: RequestInit) => request(path, { ...options, method: 'DELETE' }),
};
