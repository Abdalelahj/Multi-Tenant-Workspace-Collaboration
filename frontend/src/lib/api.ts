import { API_URL } from './constants';

interface ApiFetchOptions extends RequestInit {
  userId?: string;
  workspaceId?: string;
}

/** 
 * Typed fetch wrapper that injects X-User-Id and X-Workspace-Id headers
 * for multi-tenant auth. 
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { userId, workspaceId, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers ?? {}),
  };

  if (userId) (headers as Record<string, string>)['X-User-Id'] = userId;
  if (workspaceId)
    (headers as Record<string, string>)['X-Workspace-Id'] = workspaceId;

  const res = await fetch(`${API_URL}/api${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? `API error ${res.status}`,
    );
  }

  return res.json() as Promise<T>;
}
