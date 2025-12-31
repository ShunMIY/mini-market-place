import { Body, Controller , Get, Post, UsePipes} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemSchema } from './items.schema';
import type { CreateItemInput } from './items.schema';
import { ZodValidationPipe } from '../common/zod-validation.pipe';

@Controller('items')
export class ItemsController {
    constructor(private readonly items: ItemsService){}

    @Post()
    @UsePipes(new ZodValidationPipe(CreateItemSchema))
    create(@Body() body: CreateItemInput){
        return this.items.create(body);
    }

    @Get()
    list(){
        return this.items.list();
    }
}
