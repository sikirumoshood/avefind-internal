import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSessionUser } from "@/lib/session"

import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Sign in — Avefind Admin",
}

export default async function LoginPage() {
  const user = await getSessionUser()
  if (user) redirect("/dashboard")

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-lg font-semibold tracking-tight">Avefind Admin</h1>
          <p className="text-sm text-muted-foreground">Internal operations console</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Use your staff credentials to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
