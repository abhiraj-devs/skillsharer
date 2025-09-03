

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  skills?: string[];
  bio?: string;
}

export async function login(
  identifier: string,
  password: string,
  recaptchaToken: string,
): Promise<User> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identifier, password, recaptchaToken }),
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
  password: string,
  recaptchaToken: string,
): Promise<User> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, recaptchaToken }),
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

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // This could happen if the token is expired or invalid
      localStorage.removeItem('token');
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error fetching user:", error);
    localStorage.removeItem('token');
    return null;
  }
}


export async function updateUser(userData: Partial<User>): Promise<User> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch('/api/user/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update user');
  }

  return data.user;
}


export * from '@/hooks/use-auth';
