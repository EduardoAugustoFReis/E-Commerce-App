import { Module } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { OrderItemsController } from './order-items.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [OrderItemsService],
  controllers: [OrderItemsController],
  imports: [PrismaModule],
})
export class OrderItemsModule {}
