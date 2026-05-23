import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreSetting } from '../../entities/store-setting.entity';

@Injectable()
export class StoreSettingsService {
  constructor(
    @InjectRepository(StoreSetting)
    private readonly settingRepo: Repository<StoreSetting>,
  ) {}

  findAll(storeId: number): Promise<StoreSetting[]> {
    return this.settingRepo.find({ where: { storeId } });
  }

  async set(storeId: number, key: string, value: string): Promise<StoreSetting> {
    let setting = await this.settingRepo.findOne({ where: { storeId, key } });
    if (setting) {
      setting.value = value;
    } else {
      setting = this.settingRepo.create({ storeId, key, value });
    }
    return this.settingRepo.save(setting);
  }

  async delete(storeId: number, key: string): Promise<void> {
    await this.settingRepo.delete({ storeId, key });
  }
}
