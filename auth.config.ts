import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  providers: [], // providers thật khai báo ở auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith("/decks") ||
        nextUrl.pathname.startsWith("/api/decks");

      if (isProtected) return isLoggedIn;
      return true;
    },
  },
};
