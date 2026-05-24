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
import { StoreAccessGuard } from '../../common/guards/store-access.guard';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';

@ApiTags('Product Categories')
@Controller('stores/:storeId/categories')
export class ProductCategoriesController {
  constructor(private readonly service: ProductCategoriesService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List categories for a store' })
  @UseGuards(StoreAccessGuard)
  @Get()
  findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.service.findAll(storeId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category (admin only)' })
  @UseGuards(UserJwtGuard)
  @Post()
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateProductCategoryDto,
  ) {
    return this.service.create(storeId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get category by ID' })
  @UseGuards(StoreAccessGuard)
  @Get(':id')
  findOne(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(storeId, id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rename category (admin only)' })
  @UseGuards(UserJwtGuard)
  @Patch(':id')
  update(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProductCategoryDto,
  ) {
    return this.service.update(storeId, id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category (admin only)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(UserJwtGuard)
  @Delete(':id')
  remove(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(storeId, id);
  }
}
