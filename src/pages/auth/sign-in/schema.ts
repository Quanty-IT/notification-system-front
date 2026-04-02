import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email({ error: 'Invalid email' }),
  password: z.string().min(1, 'Password is required'),
});

export type SignInFormData = z.infer<typeof signInSchema>;
