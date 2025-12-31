import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderInput } from './orders.schemas';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async get(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { lines: true },
    });
    if (!order) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }
    return order;
  }

  async list() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { lines: true },
    });
  }

  async create(input: CreateOrderInput) {
    const order = await this.prisma.$transaction(async (tx) => {
      // 1) 対象アイテムをまとめて取得
      const itemIds = input.items.map((i) => i.itemId);
      const items = await tx.item.findMany({ where: { id: { in: itemIds } } });

      // map化
      const byId = new Map(items.map((it) => [it.id, it]));

      // 2) 存在チェック + 在庫チェック
      for (const req of input.items) {
        const it = byId.get(req.itemId);
        if (!it) {
          throw new NotFoundException(`Item not found: ${req.itemId}`);
        }
        if (it.stock < req.quantity) {
          throw new ConflictException(`Out of stock: ${it.name}`);
        }
      }

      // 3) 在庫減算（原子的に）
      //    ※ SQLiteでも動くように updateMany で条件付き更新を使う
      for (const req of input.items) {
        const updated = await tx.item.updateMany({
          where: { id: req.itemId, stock: { gte: req.quantity } },
          data: { stock: { decrement: req.quantity }, version: { increment: 1 } },
        });
        if (updated.count !== 1) {
          // 途中で在庫が変わったなど
          throw new ConflictException('Stock changed, please retry');
        }
      }

      // 4) total計算
      let total = 0;
      const linesData = input.items.map((req) => {
        const it = byId.get(req.itemId)!;
        total += it.price * req.quantity;
        return {
          itemId: it.id,
          quantity: req.quantity,
          unitPrice: it.price,
        };
      });

      // 5) Order + OrderLine 作成
      return tx.order.create({
        data: {
          total,
          lines: { create: linesData },
        },
        include: { lines: true },
      });
    });

    return order;
  }

  async cancel(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
            where: { id: orderId },
            include: { lines: true },
        });
        
        if (!order) {
            throw new NotFoundException(`Order not found: ${orderId}`);
        }

        if(order.status === 'CANCELLED'){
            return order;
        }

        if(order.status === 'SHIPPED'){
           throw new ConflictException(`Cannot cancel order with status: ${order.status}`);
        }

        for(const line of order.lines){
            await tx.item.updateMany({
                where: { id: line.itemId },
                data: { stock: { increment: line.quantity }, 
                version: { increment: 1 } ,
            },
            });
        }

        return tx.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
            include: { lines: true },
        });
        }
    );
    }
}
