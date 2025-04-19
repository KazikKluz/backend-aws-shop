import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  // Query,
  Param,
  UseInterceptors,
} from '@nestjs/common';

import { CacheInterceptor } from '@nestjs/cache-manager';
import { Product } from 'src/interfaces/product.interface';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from 'src/dtos/create-product.dto';
import { AxiosResponse } from 'axios';

@Controller('products')
@UseInterceptors(CacheInterceptor)
export class ProductsController {
  constructor(readonly productsService: ProductsService) {}

  @Get()
  @Header('Access-Control-Allow-Origin', '*')
  findAll(): Promise<AxiosResponse<Product[] | Product>> {
    return this.productsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.productsService.findOneById(id);
  }

  // @Get()
  // @Header('Access-Control-Allow-Origin', '*')
  // findById(
  //   @Query() query: { productId?: string },
  // ): Promise<AxiosResponse<Product[] | Product>> {
  //   if (query.productId) {
  //     console.log('controller up');
  //     return this.productsService.findOne(query.productId);
  //   } else {
  //     console.log('controller down');
  //     return this.productsService.findAll();
  //   }
  // }

  @Post()
  @Header('Access-Control-Allow-Origin', '*')
  create(@Body() product: CreateProductDto): Promise<AxiosResponse<Product>> {
    return this.productsService.insertOne(product);
  }
}
