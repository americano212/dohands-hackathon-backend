import { UserBadge } from '#entities/user-badge.entity';
import { User } from '#entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BadgeRepository {
  constructor(@InjectRepository(UserBadge) private userBadgesRepository: Repository<UserBadge>) {}

  public async create(badgeCode: string, user: User): Promise<UserBadge> {
    return await this.userBadgesRepository.save(
      await this.userBadgesRepository.create({ badgeCode, user }),
    );
  }
}
