"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { ApiError } from "@/lib/api"
import { createUser, setUserActiveStatus } from "@/lib/api/users"
import { ADMIN_PANEL_ROLES, type UserRole } from "@/lib/types"

const CreateUserSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().min(1, "Last name is required."),
    email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
    phoneNumber: z.string().trim().regex(/^\d{11}$/, "Enter an 11-digit phone number."),
    role: z.enum(ADMIN_PANEL_ROLES as [UserRole, ...UserRole[]], { message: "Select a role." }),
    password: z.string().min(7, "At least 7 characters.").max(20, "At most 20 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type CreateUserFieldErrors = Partial<
  Record<"firstName" | "lastName" | "email" | "phoneNumber" | "role" | "password" | "confirmPassword", string>
>

export type CreateUserFormState = {
  error?: string
  fieldErrors?: CreateUserFieldErrors
  success?: boolean
}

export async function createUserAction(
  _prevState: CreateUserFormState | undefined,
  formData: FormData,
): Promise<CreateUserFormState> {
  const parsed = CreateUserSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phoneNumber: formData.get("phoneNumber"),
    role: formData.get("role"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!parsed.success) {
    const fieldErrors: CreateUserFieldErrors = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof CreateUserFieldErrors
      fieldErrors[key] = issue.message
    }
    return { fieldErrors }
  }

  try {
    await createUser(parsed.data)
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Something went wrong. Please try again." }
  }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function setUserActiveStatusAction(userId: string, isActive: boolean) {
  try {
    await setUserActiveStatus(userId, isActive)
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Something went wrong. Please try again." }
  }

  revalidatePath("/admin/users")
  return { success: true as const }
}
