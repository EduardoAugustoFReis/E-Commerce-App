import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateOrderItemDto } from './dto/create-orderItem.dto';

@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createOrderItems(@Body() createOrderItemDto: CreateOrderItemDto, @Req() req) {
    return this.orderItemsService.createOrderItems(
      createOrderItemDto,
      req.user.userId,
    );
  }

  @Get(':id')
  listOrderItemById(@Param('id', ParseIntPipe) id: number) {
    return this.orderItemsService.listOrderItemById();
  }
}
