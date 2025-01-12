import { Injectable } from '@nestjs/common';
import { UserService } from 'src/shared/user/user.service';
import { BadgeRepository } from './badge.repository';

@Injectable()
export class BadgeService {
  constructor(
    private readonly user: UserService,
    private readonly badgesRepository: BadgeRepository,
  ) {}
  public async giveBadgeToUser(userId: number, badgeCode: string): Promise<boolean> {
    const user = await this.user.findOne(userId);
    const userBadge = await this.badgesRepository.create(badgeCode, user);
    return userBadge ? true : false;
  }
}
