import { Body, Controller, Get, Header, Put } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { CartItem } from 'src/interfaces/cart.interface';
import { OrderService } from 'src/services/order.service';

@Controller('orders')
export class OrderController {
  constructor(readonly orderService: OrderService) {}

  @Get()
  @Header('Access-Controll-Allow-Origin', '*')
  findOrders(): Promise<AxiosResponse<CartItem[]>> {
    return this.orderService.findOrders();
  }
}
