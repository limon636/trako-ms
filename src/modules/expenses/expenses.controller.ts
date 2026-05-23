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
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiBearerAuth()
@ApiTags('Expenses')
@UseGuards(UserJwtGuard)
@Controller('stores/:storeId')
export class ExpensesController {
  constructor(private readonly service: ExpensesService) {}

  // ─── Categories ──────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'List expense categories' })
  @Get('expense-categories')
  findCategories(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.service.findAllCategories(storeId);
  }

  @ApiOperation({ summary: 'Create expense category' })
  @Post('expense-categories')
  createCategory(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateExpenseCategoryDto,
  ) {
    return this.service.createCategory(storeId, dto);
  }

  @ApiOperation({ summary: 'Delete expense category' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('expense-categories/:id')
  removeCategory(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.removeCategory(storeId, id);
  }

  // ─── Expenses ────────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'List expenses' })
  @Get('expenses')
  findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.service.findAll(storeId);
  }

  @ApiOperation({ summary: 'Create expense' })
  @Post('expenses')
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @CurrentUser() user: User,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.service.create(storeId, user.id, dto);
  }

  @ApiOperation({ summary: 'Get expense by ID' })
  @Get('expenses/:id')
  findOne(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(storeId, id);
  }

  @ApiOperation({ summary: 'Delete expense' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('expenses/:id')
  remove(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(storeId, id);
  }
}
