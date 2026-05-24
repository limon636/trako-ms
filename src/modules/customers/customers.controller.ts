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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { StoreAccessGuard } from '../../common/guards/store-access.guard';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';

@ApiTags('Customers')
@Controller('stores/:storeId/customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List customers' })
  @ApiQuery({ name: 'search', required: false })
  @UseGuards(StoreAccessGuard)
  @Get()
  findAll(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(storeId, search);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create customer' })
  @UseGuards(StoreAccessGuard)
  @Post()
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.service.create(storeId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer by ID' })
  @UseGuards(StoreAccessGuard)
  @Get(':id')
  findOne(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(storeId, id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update customer' })
  @UseGuards(StoreAccessGuard)
  @Patch(':id')
  update(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.service.update(storeId, id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete customer (admin only)' })
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
