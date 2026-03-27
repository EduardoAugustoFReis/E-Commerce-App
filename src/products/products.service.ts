import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  private async findProductOrThrow(productId: number) {
    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async createProduct(
    createProductDto: CreateProductDto,
    file: Express.Multer.File,
  ) {
    const imageUrl = `/uploads/${file.filename}`;


    return this.prismaService.product.create({
      data: {
        ...createProductDto,
        imageUrl,
      },
    });
  }

  async listAllProducts() {
    return this.prismaService.product.findMany();
  }

  async listProductById(productId: number) {
    return this.findProductOrThrow(productId);
  }

  async deleteProduct(productId: number) {
    await this.findProductOrThrow(productId);

    await this.prismaService.product.delete({
      where: { id: productId },
    });

    return { message: 'Produto deletado' };
  }

  async updateProduct(
    productId: number,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ) {
    await this.findProductOrThrow(productId);

    const data: any = {
      ...updateProductDto,
    };

    if (file) {
      data.imageUrl = `/uploads/${file.filename}`;
    }

    const updatedProduct = await this.prismaService.product.update({
      where: { id: productId },
      data,
    });

    return { message: 'Produto atualizado', updatedProduct };
  }
}
