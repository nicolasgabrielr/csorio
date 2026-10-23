import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string;
        const password = credentials?.password as string;

        if (!username || !password) return null;

        const adminUser = process.env.ADMIN_USER;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminUser || !adminPasswordHash) return null;
        if (username !== adminUser) return null;

        // El hash está codificado en base64 para evitar problemas con $ en .env
        const decodedHash = Buffer.from(adminPasswordHash, "base64").toString("utf-8");
        const passwordMatch = await bcrypt.compare(password, decodedHash);
        if (!passwordMatch) return null;

        return { id: "admin", name: "Administrador", email: "admin@wedding.local" };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = "admin";
      return token;
    },
    async session({ session, token }) {
      if (token.role) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
