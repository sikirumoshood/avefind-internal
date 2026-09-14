"use client"

import { useId, useState, useTransition } from "react"
import type { FormEvent } from "react"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { roleLabel } from "@/lib/roles"
import type { UserRole } from "@/lib/types"

import { createUserAction, type CreateUserFormState } from "./actions"

const initialState: CreateUserFormState = {}

export function CreateUserDialog({ creatableRoles }: { creatableRoles: UserRole[] }) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<CreateUserFormState>(initialState)
  const [role, setRole] = useState<string>(creatableRoles[0] ?? "")
  const [pending, startTransition] = useTransition()

  const firstNameId = useId()
  const lastNameId = useId()
  const emailId = useId()
  const phoneId = useId()
  const roleId = useId()
  const passwordId = useId()
  const confirmPasswordId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await createUserAction(state, formData)
      setState(result)
      if (result.success) {
        toast.success("User created.")
        setOpen(false)
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setRole(creatableRoles[0] ?? "")
          setState(initialState)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus />
          New user
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Create staff user</DialogTitle>
            <DialogDescription>
              Grants Admin, Manager, or Operations access to this console. Customers, merchants, and delivery agents
              sign up through their own apps and aren&apos;t created here.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {state.error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={firstNameId}>First name</Label>
                <Input id={firstNameId} name="firstName" required />
                {state.fieldErrors?.firstName ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.firstName}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor={lastNameId}>Last name</Label>
                <Input id={lastNameId} name="lastName" required />
                {state.fieldErrors?.lastName ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.lastName}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={emailId}>Email</Label>
              <Input id={emailId} name="email" type="email" autoComplete="off" required />
              {state.fieldErrors?.email ? <p className="text-sm text-destructive">{state.fieldErrors.email}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor={phoneId}>Phone number</Label>
              <Input id={phoneId} name="phoneNumber" inputMode="numeric" placeholder="08012345678" required />
              {state.fieldErrors?.phoneNumber ? (
                <p className="text-sm text-destructive">{state.fieldErrors.phoneNumber}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor={roleId}>Role</Label>
              <input type="hidden" name="role" value={role} />
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id={roleId} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {creatableRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {roleLabel(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.fieldErrors?.role ? <p className="text-sm text-destructive">{state.fieldErrors.role}</p> : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={passwordId}>Password</Label>
                <Input id={passwordId} name="password" type="password" autoComplete="new-password" required />
                {state.fieldErrors?.password ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.password}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor={confirmPasswordId}>Confirm password</Label>
                <Input
                  id={confirmPasswordId}
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                />
                {state.fieldErrors?.confirmPassword ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.confirmPassword}</p>
                ) : null}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Create user
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
