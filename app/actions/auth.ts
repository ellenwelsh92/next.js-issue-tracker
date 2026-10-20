'use server'

import { z } from 'zod'
import {
  verifyPassword,
  createSession,
  createUser,
  deleteSession,
} from '@/lib/auth'
import { getUserByEmail } from '@/lib/dal'
import { mockDelay } from '@/lib/utils'
import { redirect } from 'next/navigation'

// Define Zod schema for signin validation
const SignInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

// Define Zod schema for signup validation
const SignUpSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type SignInData = z.infer<typeof SignInSchema>
export type SignUpData = z.infer<typeof SignUpSchema>

export type ActionResponse = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  error?: string
}

export const signIn = async (formData: FormData): Promise<ActionResponse> => {
  await mockDelay(700)
  try {
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    // validate with Zod
    const validationResult = SignInSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    const user = await getUserByEmail(data.email)
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password',
        errors: {
          email: ['Invalid email or password'],
        },
      }
    }

    const isPasswordValid = await verifyPassword(data.password, user.password)
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email or password',
        errors: {
          email: ['Invalid email or password'],
        },
      }
    }

    const sessionCreated = await createSession(user.id)
    if (!sessionCreated) {
      return {
        success: false,
        message: 'Unable to sign in. Please try again.',
        error: 'Failed to create session',
      }
    }

    return {
      success: true,
      message: 'Signed in successfully',
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      message: 'Failed to sign in',
      error: 'Failed to sign in',
    }
  }
}

export const signUp = async (formData: FormData): Promise<ActionResponse> => {
  await mockDelay(700)
  try {
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    }

    // validate with Zod
    const validationResult = SignUpSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    const existingUser = await getUserByEmail(data.email)
    if (existingUser) {
      return {
        success: false,
        message: 'An account with this email already exists',
        errors: {
          email: ['An account with this email already exists'],
        },
      }
    }

    const user = await createUser(data.email, data.password)
    if (!user) {
      return {
        success: false,
        message: 'Try again',
        error: 'Account could not be created',
      }
    }

    const sessionCreated = await createSession(user.id)
    if (!sessionCreated) {
      return {
        success: false,
        message:
          'Your account was created, but we could not sign you in. Please sign in to continue.',
        error: 'Failed to create session',
      }
    }

    return {
      success: true,
      message: 'Account created',
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      message: 'There was an error creating your account',
      error: 'There was an error creating your account',
    }
  }
}

export const signOut = async () => {
  try {
    await mockDelay(300)
    await deleteSession()
  } catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Error signing out')
  } finally {
    redirect('/signin')
  }
}
