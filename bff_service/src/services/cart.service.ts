import { AxiosResponse, AxiosError } from 'axios';
import { Injectable, HttpException } from '@nestjs/common';
import { Cart, CartItem } from 'src/interfaces/cart.interface';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class CartService {
  constructor(private readonly httpService: HttpService) {}

  private isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError !== undefined;
  }
  async findOne(): Promise<AxiosResponse<Cart>> {
    try {
      const data = await this.httpService.axiosRef
        .get<AxiosResponse<Cart>>(`${process.env.CART}`)
        .then((response) => response.data);
      return data;
    } catch (err) {
      if (this.isAxiosError(err)) {
        throw new HttpException(
          err.response?.data ?? 'Internal Server Error',
          err.response?.status ?? 500,
        );
      }
      throw new HttpException('Internal Server Error', 500);
    }
  }

  async put(cartItems: CartItem[]): Promise<AxiosResponse<Cart>> {
    try {
      const data = await this.httpService.axiosRef
        .put<AxiosResponse<Cart>>(`${process.env.CART}`, cartItems)
        .then((response) => response.data);
      return data;
    } catch (err) {
      if (this.isAxiosError(err)) {
        throw new HttpException(
          err.response?.data ?? 'Internal Server Error',
          err.response?.status ?? 500,
        );
      }
      throw new HttpException('Internal Server Error', 500);
    }
  }
}
