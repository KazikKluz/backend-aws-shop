import { AxiosResponse, AxiosError } from 'axios';
import { Injectable, HttpException } from '@nestjs/common';
import { CartItem } from 'src/interfaces/cart.interface';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class OrderService {
  constructor(private readonly httpService: HttpService) {}

  private isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError !== undefined;
  }

  async findOrders(): Promise<AxiosResponse<CartItem[]>> {
    try {
      const data = await this.httpService.axiosRef
        .get<AxiosResponse<CartItem[]>>(`${process.env.CART}/api/orders`)
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
