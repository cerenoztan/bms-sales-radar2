export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  jobTitle?: string | null;

  role: {
    id: number;
    name: string;
  } | null;

  permissions: string[];
}

export function getStoredUser(): AuthUser | null {
  const rawUser =
    localStorage.getItem('user') ??
    sessionStorage.getItem('user');

  if (!rawUser) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(rawUser) as Partial<AuthUser>;

    return {
      id: parsed.id ?? 0,
      fullName: parsed.fullName ?? '',
      email: parsed.email ?? '',
      jobTitle: parsed.jobTitle ?? null,
      role: parsed.role ?? null,
      permissions: Array.isArray(
        parsed.permissions,
      )
        ? parsed.permissions
        : [],
    };
  } catch {
    return null;
  }
}

export function hasPermission(
  permission: string,
): boolean {
  const user = getStoredUser();

  return (
    user?.permissions.includes(permission) ??
    false
  );
}

export function getAccessToken(): string | null {
  return (
    localStorage.getItem('accessToken') ??
    sessionStorage.getItem('accessToken')
  );
}

export function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
