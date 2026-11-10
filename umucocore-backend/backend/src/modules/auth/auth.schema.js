import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(120),
    contact: z.string().min(3, 'Email or phone is required'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    rememberMe: z.boolean().optional().default(false),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    contact: z.string().min(1, 'Email or phone is required'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional().default(false),
  }),
});

export const googleSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, 'Google ID token is required'),
    rememberMe: z.boolean().optional().default(false),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
  }),
});
