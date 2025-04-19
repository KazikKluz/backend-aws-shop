import { Module } from '@nestjs/common';
import { AppController } from 'src/controllers/app.controller';
import { AppService } from 'src/services/app.service';
import { ProductsModule } from './products.module';
import { CartModule } from './cart.module';
import { OrderModule } from './order.module';

@Module({
  imports: [ProductsModule, CartModule, OrderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
