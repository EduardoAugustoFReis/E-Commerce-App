import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Delete,
  Param,
  ParseIntPipe,
  Get,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { multerConfig } from 'src/common/uploads/multer.config';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @Post()
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.createProduct(
      createProductDto,
      file,
    );
  }

  // LIST ALL PRODUCTS
  @Get()
  listAllProducts() {
    return this.productsService.listAllProducts();
  }

  // LIST PRODUCT BY ID
  @Get(':id')
  listProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.listProductById(id);
  }

  // DELETE PRODUCT
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Delete(':id')
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.deleteProduct(id);
  }

  // UPDATE PRODUCT
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @Patch(':id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.updateProduct(id, updateProductDto, file);
  }
}
