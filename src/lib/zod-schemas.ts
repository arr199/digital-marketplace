import { z } from 'zod'

export const AuthCredentialsSchema = z.object({
  email: z.string().min(1, { message: 'No empty fields' }).email(),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' })
})
export type AuthCredentials = z.infer<typeof AuthCredentialsSchema>

export const QueryValidatorSchema = z.object({
  category: z.string().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  limit: z.number().optional()
})

export type TQueryValidatorSchema = z.infer<typeof QueryValidatorSchema>
