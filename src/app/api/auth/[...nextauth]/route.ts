'use server';
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// In a real application, you'd want to store users in a database.
const users = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123', // In a real app, this would be a hashed password
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'test@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }
        
        const user = users.find((user) => user.email === credentials.email);

        // In a real app, you would compare a hashed password.
        if (user && user.password === credentials.password) {
          // Return a user object without the password
          return { id: user.id, name: user.name, email: user.email };
        } else {
          return null;
        }
      },
    }),
    // ...add more providers here, like Google, if you set them up
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
