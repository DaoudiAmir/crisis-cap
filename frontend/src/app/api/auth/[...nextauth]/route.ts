import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"
import { authApi } from "@/lib/api"

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        try {
          const response = await authApi.login({
            email: credentials.email,
            password: credentials.password,
          })
          return response.user
        } catch (error) {
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          accessToken: user.token,
          role: user.role,
          status: user.status,
          badgeNumber: user.badgeNumber,
        }
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role
      session.user.status = token.status
      session.user.badgeNumber = token.badgeNumber
      session.user.accessToken = token.accessToken
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
