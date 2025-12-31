import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { OrdersService } from './orders.service';
import type { CreateOrderInput } from './orders.schemas';
import { CreateOrderSchema } from './orders.schemas';
import { ZodValidationPipe } from '../common/zod-validation.pipe';

@Controller('orders')
export class OrdersController {
    constructor(private readonly orders: OrdersService){}

    @Post()
    @UsePipes(new ZodValidationPipe(CreateOrderSchema))
    create(@Body() body: CreateOrderInput){
        return this.orders.create(body);
    }
}
