import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  private async findCategoryOrThrow(categoryId: number) {
    const category = await this.prismaService.category.findUnique({
      where: { id: categoryId },
      select: {
        name: true,
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontradoa');
    }

    return category;
  }

  createCategory = async (createCategoryDto: CreateCategoryDto) => {
    return await this.prismaService.category.create({
      data: {
        ...createCategoryDto,
      },
    });
  };

  listAllCategories = async () => {
    return await this.prismaService.category.findMany();
  };

  listCategoryById = async (categoryId: number) => {
    return await this.findCategoryOrThrow(categoryId);
  };

  deleteCategory = async (categoryId: number) => {
    await this.findCategoryOrThrow(categoryId);

    await this.prismaService.category.delete({
      where: { id: categoryId },
    });

    return { message: 'Categoria deletada' };
  };

  updateCategory = async (
    categoryId: number,
    updateCategoryDto: UpdateCategoryDto,
  ) => {
    await this.findCategoryOrThrow(categoryId);

    const updatedCategory = await this.prismaService.category.update({
      where: { id: categoryId },
      data: {
        ...updateCategoryDto,
      },
    });

    return { message: 'Categoria atualizada', updatedCategory };
  };
}
