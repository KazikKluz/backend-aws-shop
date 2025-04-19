import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { OrderController } from 'src/controllers/order.controller';
import { OrderService } from 'src/services/order.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 120,
    }),
    HttpModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
