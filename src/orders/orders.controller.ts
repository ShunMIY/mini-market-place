import { Body, Controller,Param, Post, UsePipes, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';
import type { CreateOrderInput } from './orders.schemas';
import { CreateOrderSchema } from './orders.schemas';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly orders: OrdersService){}

    @Post()
    @ApiOperation({
        summary: 'Create an order',
        description: 'Creates an order atomically. Returns 409 if any item is out of stock.',
      })
    @ApiResponse({ status: 201, description: 'Created' })
    @ApiResponse({ status: 409, description: 'Out of stock / conflict' })
    @UsePipes(new ZodValidationPipe(CreateOrderSchema))
    create(@Body() body: CreateOrderInput){
        return this.orders.create(body);
    }

    @Post(':id/cancel')
    @ApiOperation({
        summary: 'Cancel an order (idempotent)',
        description:
          'Transitions CREATED -> CANCELLED and restores stock. If already CANCELLED, returns 200 with current order.',
      })
    @ApiResponse({ status: 200, description: 'Cancelled (or already cancelled)' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    @ApiResponse({ status: 409, description: 'Cannot cancel due to state (e.g., shipped)' })
    cancel(@Param('id') id: string){
        return this.orders.cancel(id);
    }
    
    @Get(':id')
    @ApiOperation({ summary: 'Get an order by id' })
    @ApiResponse({ status: 200, description: 'OK' })
    @ApiResponse({ status: 404, description: 'Not found' })
    get(@Param('id') id: string){
        return this.orders.get(id);
    }

    @Get()
    @ApiOperation({ summary: 'List orders' })
    @ApiResponse({ status: 200, description: 'OK' })
    list(){
        return this.orders.list();
    }
}
