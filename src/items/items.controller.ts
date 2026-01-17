import { Body, Controller , Delete, Get, Post, UsePipes, Param} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemSchema } from './items.schema';
import type { CreateItemInput} from './items.schema';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('items')
@Controller('items')
export class ItemsController {
    constructor(private readonly items: ItemsService){}

    @Post()
    @ApiOperation({ summary: 'Create an item' })
    @ApiResponse({ status: 201, description: 'Created' })
    @ApiResponse({ status: 400, description: 'Validation failed' })
    @UsePipes(new ZodValidationPipe(CreateItemSchema))
    create(@Body() body: CreateItemInput){
        return this.items.create(body);
    }

    @Delete(':id')
    delete(@Param('id') id: string){
        return this.items.delete(id);
    }

    @Get()
    @ApiOperation({ summary: 'List items' })
    @ApiResponse({ status: 200, description: 'OK' })
    list(){
        return this.items.list();
    }
}
