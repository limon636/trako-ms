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
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';

@ApiBearerAuth()
@ApiTags('Customers')
@UseGuards(UserJwtGuard)
@Controller('stores/:storeId/customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @ApiOperation({ summary: 'List customers' })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  findAll(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(storeId, search);
  }

  @ApiOperation({ summary: 'Create customer' })
  @Post()
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.service.create(storeId, dto);
  }

  @ApiOperation({ summary: 'Get customer by ID' })
  @Get(':id')
  findOne(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(storeId, id);
  }

  @ApiOperation({ summary: 'Update customer' })
  @Patch(':id')
  update(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.service.update(storeId, id, dto);
  }

  @ApiOperation({ summary: 'Delete customer' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(storeId, id);
  }
}
