import type { DefaultSession } from "next-auth"

type Role = "admin" | "editor"

declare module "next-auth" {
  interface User {
    role: Role
    isSuperadmin: boolean
  }
  interface Session {
    user: { id: string; role: Role; isSuperadmin: boolean } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    isSuperadmin: boolean
  }
}
