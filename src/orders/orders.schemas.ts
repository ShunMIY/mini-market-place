import { z } from 'zod';

export const CreateOrderSchema = z.object({
    items: z.array(
        z.object({
            itemId: z.string().min(1),
            quantity: z.number().int().positive(),
        })
    ).min(1),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;