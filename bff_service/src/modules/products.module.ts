import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ProductsController } from 'src/controllers/products.controller';
import { ProductsService } from 'src/services/products.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 120,
    }),
    HttpModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
