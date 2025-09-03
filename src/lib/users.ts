
// In a real application, you'd want to store and retrieve users from a database.
// For this demo, we'll use a shared in-memory array that can be mutated.

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // Should be hashed
    skills: string[];
}

export const users: User[] = [
  {
    id: '1',
    name: 'Ben Carter',
    email: 'test@example.com',
    password: 'password123', // In a real app, this would be a hashed password
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Figma', 'UI/UX Design'],
  },
];
