import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreSetting } from '../../entities/store-setting.entity';
import { StoreSettingsService } from './store-settings.service';
import { StoreSettingsController } from './store-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StoreSetting])],
  controllers: [StoreSettingsController],
  providers: [StoreSettingsService],
})
export class StoreSettingsModule {}
