import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';
import { SubscriptionLimitsGuard } from '../../common/guards/subscription-limits.guard';
import { SubscriptionLimit, LimitType } from '../../common/decorators/subscription-limit.decorator';

@ApiBearerAuth()
@ApiTags('Products')
@UseGuards(UserJwtGuard)
@Controller('stores/:storeId/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'List all products in store' })
  @Get()
  findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.productsService.findAll(storeId);
  }

  @ApiOperation({ summary: 'Create product (checks max_products limit)' })
  @UseGuards(SubscriptionLimitsGuard)
  @SubscriptionLimit(LimitType.PRODUCTS)
  @Post()
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(storeId, dto);
  }

  @ApiOperation({ summary: 'Get product by ID' })
  @Get(':id')
  findOne(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.findOne(storeId, id);
  }

  @ApiOperation({ summary: 'Update product' })
  @Patch(':id')
  update(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(storeId, id, dto);
  }

  @ApiOperation({ summary: 'Soft-delete product' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.remove(storeId, id);
  }

  @ApiOperation({ summary: 'Get current stock level for a product' })
  @Get(':id/stock')
  getStock(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.getStock(storeId, id);
  }

  @ApiOperation({ summary: 'Manual stock adjustment' })
  @Post(':id/stock/adjust')
  adjust(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StockAdjustmentDto,
  ) {
    return this.productsService.adjust(storeId, id, dto.quantityChange, dto.note);
  }

  @ApiOperation({ summary: 'Get stock ledger history' })
  @Get(':id/stock/ledger')
  getLedger(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.getLedger(storeId, id);
  }
}
