import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from 'src/shared/user/user.service';
import { BadgeRepository } from './badge.repository';
import { Transactional } from 'typeorm-transactional';
import { BadgeCode } from './badge.enum';

@Injectable()
export class BadgeService {
  constructor(
    private readonly user: UserService,
    private readonly badgesRepository: BadgeRepository,
  ) {}

  @Transactional()
  public async giveBadgeToUser(userId: number, badgeCode: string): Promise<boolean> {
    await this.validateBadgeCode(badgeCode);

    const user = await this.user.findOne(userId);
    const userBadgeCodeList: string[] = [];
    user.badges?.forEach((badge) => {
      userBadgeCodeList.push(badge.badgeCode);
    });
    const isExist = userBadgeCodeList.includes(badgeCode);
    if (isExist) return true;
    const userBadge = await this.badgesRepository.create(badgeCode, user);
    return userBadge ? true : false;
  }

  private async validateBadgeCode(badgeCode: string): Promise<boolean> {
    const badgeCodesList = Object.values(BadgeCode) as string[];
    const isValid = badgeCodesList.includes(badgeCode);
    if (!isValid) throw new NotFoundException(`Not Found ${badgeCode}, invalid BadgeCode`);
    return isValid;
  }
}
