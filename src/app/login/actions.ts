"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { ApiError } from "@/lib/api"
import { login } from "@/lib/api/auth"
import { createSessionCookie } from "@/lib/session"
import { ADMIN_PANEL_ROLES, type UserRole } from "@/lib/types"

const LoginSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  role: z.enum(ADMIN_PANEL_ROLES as [UserRole, ...UserRole[]], {
    message: "Select which role you're signing in as.",
  }),
})

export type LoginFormState = {
  error?: string
  fieldErrors?: Partial<Record<"email" | "password" | "role", string>>
  values?: { email?: string; role?: string }
}

export async function loginAction(
  _prevState: LoginFormState | undefined,
  formData: FormData,
): Promise<LoginFormState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  }

  const parsed = LoginSchema.safeParse(raw)

  if (!parsed.success) {
    const fieldErrors: NonNullable<LoginFormState["fieldErrors"]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof typeof fieldErrors
      fieldErrors[key] = issue.message
    }
    return { fieldErrors, values: { email: String(raw.email ?? ""), role: String(raw.role ?? "") } }
  }

  try {
    const response = await login(parsed.data)
    await createSessionCookie(response.token)
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.status === 401
          ? "Invalid email, password, or role."
          : error.message
        : "Something went wrong. Please try again."

    return { error: message, values: { email: parsed.data.email, role: parsed.data.role } }
  }

  redirect("/dashboard")
}
