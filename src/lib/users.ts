
// This file is no longer needed as user data is now stored in MongoDB.
// It is kept to avoid breaking existing imports, but it should not be used.

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // Should be hashed
    skills: string[];
}

export const users: User[] = [];
