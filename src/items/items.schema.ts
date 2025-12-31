import { z } from 'zod';

export const CreateItemSchema = z.object({
    name: z.string().min(1).max(200),
    price: z.number().int().nonnegative(),
    stock: z.number().int().nonnegative(),
});

export type CreateItemInput = z.infer<typeof CreateItemSchema>;