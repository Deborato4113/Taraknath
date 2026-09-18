import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const authOptions = {
  // JWT sessions — deliberately no database adapter here. The backend
  // (Express + Prisma) owns the User table; Auth.js just needs to know
  // "is this login valid" via the Credentials provider below, then it
  // encodes the result into a signed cookie. No Prisma in the frontend.
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!res.ok) return null; // wrong password / no such user

        const user = await res.json();
        // Whatever is returned here gets passed to the jwt() callback below
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),

    // "Continue with Google" — GoogleSignInButton does the actual Firebase
    // popup sign-in in the browser and hands us the resulting ID token
    // here. We don't trust it ourselves; the backend verifies it with
    // Firebase Admin and creates the user if this is their first sign-in.
    CredentialsProvider({
      id: "firebase",
      name: "Google",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.idToken) return null;

        const res = await fetch(`${API_URL}/api/auth/firebase-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: credentials.idToken }),
        });

        if (!res.ok) return null;

        const user = await res.json();
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // Runs whenever a JWT is created/updated — stash id + role on the token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Runs whenever a session is checked client-side — copy from token onto
    // the session object so components can read session.user.role, etc.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
