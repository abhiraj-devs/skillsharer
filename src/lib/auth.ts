export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function login(
  email: string,
  password: string
): Promise<User> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to login');
  }

  if (data.token) {
    localStorage.setItem('token', data.token);
  }

  return data.user;
}

export async function register(
  email: string,
  password: string
): Promise<User> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to register');
  }

  if (data.token) {
    localStorage.setItem('token', data.token);
  }

  return data.user;
}

export async function getMe(): Promise<User | null> {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }

  const response = await fetch('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // This could happen if the token is expired
    localStorage.removeItem('token');
    return null;
  }

  const data = await response.json();
  return data.user;
}

export * from '@/hooks/use-auth';
