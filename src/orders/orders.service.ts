import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: PrismaService) {}

  createOrder = async (userId: number) => {
    const newOrder = await this.prismaService.order.create({
      data: {
        userId,
      },
      select: {
        id: true,
        status: true,
        item: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return newOrder;
  };

  listAllOrders = async () => {
    return await this.prismaService.order.findMany({
      select: {
        id: true,
        status: true,
        item: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  };

  listOrderById = async (orderId: number) => {
    return await this.prismaService.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        item: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  };

  deleteOrder = async (orderId: number, userId: number) => {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrada.');
    }

    if (order.userId !== userId) {
      throw new UnauthorizedException('Acesso negado, esse pedido não é seu.');
    }

    await this.prismaService.order.delete({
      where: { id: orderId },
    });

    return { message: 'Pedido deletado' };
  };

  checkout = async (orderId: number, userId: number) => {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: {
        item: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    if (order.userId !== userId) {
      throw new UnauthorizedException('Acesso negado');
    }

    if (order.item.length === 0) {
      throw new BadRequestException('Pedido não possui itens');
    }

    if (order.status !== 'Pending') {
      throw new BadRequestException('Pedido já finalizado');
    }

    const updatedOrder = this.prismaService.order.update({
      where: { id: orderId },
      data: {
        status: 'Paid',
      },
      select: {
        id: true,
        status: true,
        total: true,
        item: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    return updatedOrder;
  };
}
