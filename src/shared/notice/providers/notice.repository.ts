import { Notice } from '#entities/notice.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNoticeDto } from './dto';

@Injectable()
export class NoticeRepository {
  constructor(@InjectRepository(Notice) private noticesRepository: Repository<Notice>) {}

  public async create(noticeData: CreateNoticeDto): Promise<Notice> {
    return await this.noticesRepository.save(await this.noticesRepository.create(noticeData));
  }

  public async findAllByUserId(userId: number): Promise<Notice[]> {
    return await this.noticesRepository.find({
      relations: { user: true },
      where: { user: { userId: userId } },
    });
  }
}
