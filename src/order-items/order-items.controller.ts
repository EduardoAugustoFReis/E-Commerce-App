import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateOrderItemDto } from './dto/create-orderItem.dto';
import { UpdateOrderItemDto } from './dto/update-orderItem.dto';

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

  @UseGuards(JwtAuthGuard)
  @Get()
  listAllOrdersItems(@Req() req) {
    return this.orderItemsService.listAllOrdersItems(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  listOrderItemById(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.orderItemsService.listOrderItemById(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteOrderItem(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.orderItemsService.deleteOrderItem(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateOrderItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
    @Req() req,
  ) {
    return this.orderItemsService.updateOrderItem(
      id,
      updateOrderItemDto,
      req.user.userId,
    );
  }
}
