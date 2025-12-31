import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemInput } from './items.schema';

@Injectable()
export class ItemsService {
    constructor(private prisma:PrismaService){}

    create(input: CreateItemInput){
        return this.prisma.item.create({
            data: input,
        });
    }

    list(){
        return this.prisma.item.findMany({orderBy:{createdAt:'desc'}});
    }

}
