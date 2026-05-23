import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from '../../entities/expense.entity';
import { ExpenseCategory } from '../../entities/expense-category.entity';
import { CreateExpenseDto, CreateExpenseCategoryDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(ExpenseCategory)
    private readonly categoryRepo: Repository<ExpenseCategory>,
  ) {}

  // ─── Categories ────────────────────────────────────────────────────────────

  async createCategory(storeId: number, dto: CreateExpenseCategoryDto): Promise<ExpenseCategory> {
    const exists = await this.categoryRepo.findOne({ where: { storeId, name: dto.name } });
    if (exists) throw new ConflictException('Category already exists');
    return this.categoryRepo.save(this.categoryRepo.create({ storeId, name: dto.name }));
  }

  findAllCategories(storeId: number): Promise<ExpenseCategory[]> {
    return this.categoryRepo.find({ where: { storeId }, order: { name: 'ASC' } });
  }

  async removeCategory(storeId: number, id: number): Promise<void> {
    const cat = await this.categoryRepo.findOne({ where: { id, storeId } });
    if (!cat) throw new NotFoundException('Category not found');
    await this.categoryRepo.remove(cat);
  }

  // ─── Expenses ───────────────────────────────────────────────────────────────

  create(storeId: number, userId: number | null, dto: CreateExpenseDto): Promise<Expense> {
    const expense = this.expenseRepo.create({
      ...dto,
      storeId,
      recordedBy: userId,
      categoryId: dto.categoryId ?? null,
    });
    return this.expenseRepo.save(expense);
  }

  findAll(storeId: number): Promise<Expense[]> {
    return this.expenseRepo.find({
      where: { storeId },
      relations: { category: true },
      order: { expenseDate: 'DESC' },
    });
  }

  async findOne(storeId: number, id: number): Promise<Expense> {
    const e = await this.expenseRepo.findOne({
      where: { id, storeId },
      relations: { category: true },
    });
    if (!e) throw new NotFoundException('Expense not found');
    return e;
  }

  async remove(storeId: number, id: number): Promise<void> {
    const expense = await this.findOne(storeId, id);
    await this.expenseRepo.softRemove(expense);
  }
}
