import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, CreateExpenseCategoryDto } from './dto/create-expense.dto';
import { StoreAccessGuard } from '../../common/guards/store-access.guard';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('Expenses')
@Controller('stores/:storeId')
export class ExpensesController {
  constructor(private readonly service: ExpensesService) {}

  // ─── Categories ──────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List expense categories' })
  @UseGuards(StoreAccessGuard)
  @Get('expense-categories')
  findCategories(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.service.findAllCategories(storeId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create expense category (admin only)' })
  @UseGuards(UserJwtGuard)
  @Post('expense-categories')
  createCategory(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateExpenseCategoryDto,
  ) {
    return this.service.createCategory(storeId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete expense category (admin only)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(UserJwtGuard)
  @Delete('expense-categories/:id')
  removeCategory(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.removeCategory(storeId, id);
  }

  // ─── Expenses ────────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List expenses' })
  @UseGuards(StoreAccessGuard)
  @Get('expenses')
  findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.service.findAll(storeId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create expense' })
  @UseGuards(StoreAccessGuard)
  @Post('expenses')
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @CurrentUser() user: User,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.service.create(storeId, user.id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get expense by ID' })
  @UseGuards(StoreAccessGuard)
  @Get('expenses/:id')
  findOne(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(storeId, id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete expense (admin only)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(UserJwtGuard)
  @Delete('expenses/:id')
  remove(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(storeId, id);
  }
}
