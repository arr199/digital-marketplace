import { z } from 'zod'

export const AuthCredentialsSchema = z.object({
  email: z.string().min(1, { message: 'No empty fields' }).email(),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' })
})
export type AuthCredentials = z.infer<typeof AuthCredentialsSchema>
