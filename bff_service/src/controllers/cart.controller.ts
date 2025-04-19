import { Body, Controller, Get, Header, Put } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Cart, CartItem } from 'src/interfaces/cart.interface';
import { CartService } from 'src/services/cart.service';

@Controller('cart')
export class CartController {
  constructor(readonly cartService: CartService) {}

  @Get()
  @Header('Access-Controll-Allow-Origin', '*')
  findOne(): Promise<AxiosResponse<Cart>> {
    return this.cartService.findOne();
  }

  @Put()
  @Header('Access-Control-Allow-Origin', '*')
  put(@Body() cartItems: CartItem[]): Promise<AxiosResponse<Cart>> {
    return this.cartService.put(cartItems);
  }
}
