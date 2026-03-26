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
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // CREATE
  @UseGuards(JwtAuthGuard)
  @Post()
  createOrder(@Req() req) {
    return this.ordersService.createOrder(req.user.userId);
  }

  // LIST ALL
  @Get()
  listAllOrders() {
    return this.ordersService.listAllOrders();
  }

  // LIST BY ID
  @Get(':id')
  listOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.listOrderById(id);
  }

  // DELETE
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteOrder(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.ordersService.deleteOrder(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body('status') status: 'Pending' | 'Paid' | 'Cancelled',
  ) {
    return this.ordersService.updateStatus(id, req.user.userId, status);
  }
}
