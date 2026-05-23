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
import { ProductCategoriesService } from './product-categories.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';

@ApiBearerAuth()
@ApiTags('Product Categories')
@UseGuards(UserJwtGuard)
@Controller('stores/:storeId/categories')
export class ProductCategoriesController {
  constructor(private readonly service: ProductCategoriesService) {}

  @ApiOperation({ summary: 'List categories for a store' })
  @Get()
  findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.service.findAll(storeId);
  }

  @ApiOperation({ summary: 'Create category' })
  @Post()
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateProductCategoryDto,
  ) {
    return this.service.create(storeId, dto);
  }

  @ApiOperation({ summary: 'Get category by ID' })
  @Get(':id')
  findOne(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(storeId, id);
  }

  @ApiOperation({ summary: 'Rename category' })
  @Patch(':id')
  update(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProductCategoryDto,
  ) {
    return this.service.update(storeId, id, dto);
  }

  @ApiOperation({ summary: 'Delete category' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(storeId, id);
  }
}
