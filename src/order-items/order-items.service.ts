import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderItemDto } from './dto/create-orderItem.dto';
import { UpdateOrderItemDto } from './dto/update-orderItem.dto';

@Injectable()
export class OrderItemsService {
  constructor(private readonly prismaService: PrismaService) {}

  createOrderItems = async (
    createOrderItemDto: CreateOrderItemDto,
    userId: number,
  ) => {
    const { items, orderId } = createOrderItemDto;

    // 1. Verifica se o pedido existe e pertence ao usuário
    const order = await this.prismaService.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    if (order.status !== 'Pending') {
      throw new BadRequestException('Pedido já finalizado');
    }

    const productsId = items.map((item) => item.productId);

    // 3. Busca todos os produtos de uma vez
    const products = await this.prismaService.product.findMany({
      where: { id: { in: productsId } },
    });

    // 4. Valida se todos os produtos existem
    if (products.length !== items.length) {
      throw new NotFoundException('Um ou mais produtos não existem');
    }

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    // 5. Monta os dados para criação
    const orderItemsData = items.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new NotFoundException('Produto não encontrado'); // segurança extra
      }

      return {
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const total = orderItemsData.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);

    await this.prismaService.$transaction([
      this.prismaService.orderItem.createMany({
        data: orderItemsData,
      }),
      this.prismaService.order.update({
        where: { id: orderId },
        data: {
          total: {
            increment: total,
          },
        },
      }),
    ]);

    const updatedOrder = await this.prismaService.order.findUnique({
      where: { id: orderId },
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

  listAllOrdersItems = async (userId: number) => {
    return this.prismaService.orderItem.findMany({
      where: {
        order: {
          userId,
        },
      },
      select: {
        id: true,
        price: true,
        quantity: true,
        product: true,
      },
    });
  };

  listOrderItemById = async (orderItemId: number, userId: number) => {
    const orderItem = await this.prismaService.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: true,
        product: true,
      },
    });

    if (!orderItem) {
      throw new NotFoundException('Lista de items não encontrada');
    }

    if (orderItem.order.userId !== userId) {
      throw new UnauthorizedException('Acesso negado');
    }

    return {
      id: orderItem.id,
      price: orderItem.price,
      quantity: orderItem.quantity,
      product: orderItem.product,
    };
  };

  deleteOrderItem = async (orderItemId: number, userId: number) => {
    const orderItem = await this.prismaService.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      throw new NotFoundException('Item não encontrado');
    }

    if (orderItem.order.userId !== userId) {
      throw new UnauthorizedException('Acesso negado.');
    }

    if (orderItem.order.status !== 'Pending') {
      throw new BadRequestException('Pedido já finalizado');
    }

    // calcular quanto vai diminuir do total
    const totalToRemoved = orderItem.price * orderItem.quantity;

    await this.prismaService.$transaction([
      this.prismaService.orderItem.delete({
        where: { id: orderItemId },
      }),
      this.prismaService.order.update({
        where: { id: orderItemId },
        data: {
          total: totalToRemoved,
        },
      }),
    ]);

    return { message: 'Item removido com sucesso' };
  };

  updateOrderItem = async (
    orderItemId: number,
    updateOrderItemDto: UpdateOrderItemDto,
    userId: number,
  ) => {
    const orderItem = await this.prismaService.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true },
    });

    if (!orderItem) {
      throw new NotFoundException('Item não encontrado');
    }

    if (orderItem.order.userId !== userId) {
      throw new UnauthorizedException('Acesso negado');
    }

    if (orderItem.order.status !== 'Pending') {
      throw new BadRequestException('Pedido já finalizado');
    }

    const oldTotal = orderItem.price * orderItem.quantity;
    const newTotal = orderItem.price * updateOrderItemDto.quantity;
    const diffTotal = newTotal - oldTotal;

    await this.prismaService.$transaction([
      this.prismaService.orderItem.update({
        where: { id: orderItemId },
        data: {
          quantity: updateOrderItemDto.quantity,
        },
      }),
      this.prismaService.order.update({
        where: { id: orderItem.orderId },
        data: {
          total: { increment: diffTotal },
        },
      }),
    ]);

    return this.prismaService.order.findUnique({
      where: { id: orderItem.orderId },
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
  };
}
