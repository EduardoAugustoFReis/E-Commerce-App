import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderItemDto } from './dto/create-orderItem.dto';

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
        price: product.price, // ✅ agora é number
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

  listOrderItemById = async () => {};
}
