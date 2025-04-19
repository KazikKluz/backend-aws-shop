import { AxiosResponse, AxiosError } from 'axios';
import { Injectable, HttpException } from '@nestjs/common';
import { Product } from '../interfaces/product.interface';
import { HttpService } from '@nestjs/axios';
import { CreateProductDto } from 'src/dtos/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly httpService: HttpService) {}

  private isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError !== undefined;
  }

  async findAll(): Promise<AxiosResponse<Product[]>> {
    try {
      const response = await this.httpService.axiosRef.get<
        AxiosResponse<Product[]>
      >(`${process.env.PRODUCTS}`);
      return response.data;
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

  async findOneById(id: string): Promise<AxiosResponse<Product>> {
    try {
      const response = await this.httpService.axiosRef.get<
        AxiosResponse<Product>
      >(`${process.env.PRODUCTS}/${id}`);
      // .then((response) => response.data);
      return response.data;
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

  async insertOne(product: CreateProductDto): Promise<AxiosResponse<Product>> {
    try {
      const data = await this.httpService.axiosRef
        .post<AxiosResponse<Product>>(`${process.env.PRODUCTS}`, product)
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
