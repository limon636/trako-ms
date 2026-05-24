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
import { StoreAccessGuard } from '../../common/guards/store-access.guard';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';

@ApiTags('Dealers')
@Controller('stores/:storeId/dealers')
export class DealersController {
  constructor(private readonly service: DealersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List dealers' })
  @UseGuards(StoreAccessGuard)
  @Get()
  findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.service.findAll(storeId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create dealer (admin only)' })
  @UseGuards(UserJwtGuard)
  @Post()
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateDealerDto,
  ) {
    return this.service.create(storeId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dealer by ID' })
  @UseGuards(StoreAccessGuard)
  @Get(':id')
  findOne(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(storeId, id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update dealer (admin only)' })
  @UseGuards(UserJwtGuard)
  @Patch(':id')
  update(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateDealerDto,
  ) {
    return this.service.update(storeId, id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete dealer (admin only)' })
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
