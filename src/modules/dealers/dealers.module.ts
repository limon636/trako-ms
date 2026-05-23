import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dealer } from '../../entities/dealer.entity';
import { DealersService } from './dealers.service';
import { DealersController } from './dealers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Dealer])],
  controllers: [DealersController],
  providers: [DealersService],
  exports: [TypeOrmModule],
})
export class DealersModule {}
