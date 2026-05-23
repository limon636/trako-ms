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
import { DealersService } from './dealers.service';
import { CreateDealerDto } from './dto/create-dealer.dto';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';

@ApiBearerAuth()
@ApiTags('Dealers')
@UseGuards(UserJwtGuard)
@Controller('stores/:storeId/dealers')
export class DealersController {
  constructor(private readonly service: DealersService) {}

  @ApiOperation({ summary: 'List dealers' })
  @Get()
  findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.service.findAll(storeId);
  }

  @ApiOperation({ summary: 'Create dealer' })
  @Post()
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateDealerDto,
  ) {
    return this.service.create(storeId, dto);
  }

  @ApiOperation({ summary: 'Get dealer by ID' })
  @Get(':id')
  findOne(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(storeId, id);
  }

  @ApiOperation({ summary: 'Update dealer' })
  @Patch(':id')
  update(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateDealerDto,
  ) {
    return this.service.update(storeId, id, dto);
  }

  @ApiOperation({ summary: 'Delete dealer' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(storeId, id);
  }
}
