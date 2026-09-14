"use client"

import { useActionState, useId, useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ADMIN_PANEL_ROLES } from "@/lib/types"
import { roleLabel } from "@/lib/roles"

import { loginAction, type LoginFormState } from "./actions"

const initialState: LoginFormState = {}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState)
  const [role, setRole] = useState(state.values?.role ?? ADMIN_PANEL_ROLES[0])
  const emailId = useId()
  const passwordId = useId()
  const roleId = useId()

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={emailId}>Email</Label>
        <Input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@avefind.com"
          defaultValue={state.values?.email}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          required
        />
        {state.fieldErrors?.email ? (
          <p className="text-sm text-destructive">{state.fieldErrors.email}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={passwordId}>Password</Label>
        <Input
          id={passwordId}
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          required
        />
        {state.fieldErrors?.password ? (
          <p className="text-sm text-destructive">{state.fieldErrors.password}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={roleId}>Signing in as</Label>
        <input type="hidden" name="role" value={role} />
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id={roleId} className="w-full" aria-invalid={Boolean(state.fieldErrors?.role)}>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_PANEL_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {roleLabel(r)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.fieldErrors?.role ? (
          <p className="text-sm text-destructive">{state.fieldErrors.role}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Sign in
      </Button>
    </form>
  )
}
