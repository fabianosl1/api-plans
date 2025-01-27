import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreateProductRequest } from '../../application/dto/create-product.dto';
import { CreateProductUseCase } from '../../application/use-cases/create-product';
import { RemoveProductUseCase } from '../../application/use-cases/remove-product';
import { PlanRepository } from '../../domain/repositories/plan.repository';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { GetPlanHistoryUseCase } from '../../application/use-cases/get-plan-history';

@Controller('plans/:planId/products')
export class ProductController {
  constructor(
    @Inject('PlanRepository') private readonly planRepository: PlanRepository,
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  @Get()
  async get(
    @Param('planId') planId: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    const getHistory = new GetPlanHistoryUseCase(
      this.planRepository,
      this.productRepository,
    );

    return await getHistory.execute(
      planId,
      page ? parseInt(page) : 1,
      size ? parseInt(size) : 20,
    );
  }

  @Post()
  @HttpCode(201)
  async post(
    @Param('planId') planId: string,
    @Body() body: CreateProductRequest,
  ) {
    if (!body.name) {
      throw new HttpException(
        "'name' é um campo obrigatório",
        HttpStatus.BAD_REQUEST,
      );
    }

    const createProduct = new CreateProductUseCase(
      this.productRepository,
      this.planRepository,
    );

    return await createProduct.execute(planId, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async destroy(
    @Param('id') productId: string,
    @Param('planId') planId: string,
  ) {
    const removeProduct = new RemoveProductUseCase(this.productRepository);

    return await removeProduct.execute(productId, planId);
  }
}
