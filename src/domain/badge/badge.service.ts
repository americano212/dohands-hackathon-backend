import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from 'src/shared/user/user.service';
import { BadgeRepository } from './badge.repository';
import { Transactional } from 'typeorm-transactional';
import { BadgeCode, BadgeTitle } from './badge.enum';
import { NoticeService } from 'src/shared/notice/providers';
import { SendNoticeDto } from 'src/shared/notice/providers/dto';

@Injectable()
export class BadgeService {
  constructor(
    private readonly user: UserService,
    private readonly badgesRepository: BadgeRepository,
    private readonly notice: NoticeService,
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
    if (userBadge) await this.sendNewBadgeNotice(userId, badgeCode as BadgeCode); // 뱃지 추가시 알림 전송
    return userBadge ? true : false;
  }

  private async validateBadgeCode(badgeCode: string): Promise<boolean> {
    const badgeCodesList = Object.values(BadgeCode) as string[];
    const isValid = badgeCodesList.includes(badgeCode);
    if (!isValid) throw new NotFoundException(`Not Found ${badgeCode}, invalid BadgeCode`);
    return isValid;
  }

  private async sendNewBadgeNotice(userId: number, badgeCode: BadgeCode): Promise<boolean> {
    const badegTitle = this.getBadgeTitle(badgeCode);
    const sendNoticeData: SendNoticeDto = {
      userIdList: [userId],
      title: '새로운 배지가 도착했어요!',
      body: `${badegTitle} 배지 획득하였습니다. 프로필에서 확인해보세요.`,
    };
    return await this.notice.sendNotice(sendNoticeData);
  }

  private getBadgeTitle(badgeCode: BadgeCode): BadgeTitle {
    return BadgeTitle[badgeCode as keyof typeof BadgeCode];
  }
}
