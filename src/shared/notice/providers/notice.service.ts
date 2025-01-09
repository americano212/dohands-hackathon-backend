import { Injectable } from '@nestjs/common';
import { UserService } from 'src/shared/user/user.service';
import { GetNoticeDto, GetNoticeListDto, SendNoticeDto } from './dto';
import { AppPushService } from 'src/common';
import { NoticeRepository } from './notice.repository';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class NoticeService {
  constructor(
    private readonly user: UserService,
    private readonly appPush: AppPushService,
    private readonly noticesRepository: NoticeRepository,
  ) {}

  public async sendNotice(sendNoticeData: SendNoticeDto): Promise<boolean> {
    // UserID로 부터 토큰 추출
    const userFcmTokenList: string[] = [];

    const tokenPromises = sendNoticeData.userIdList.map(async (userId) => {
      try {
        const fcmToken = await this.user.getUserFcmToken(userId);
        return { success: true, userId, fcmToken };
      } catch (error) {
        console.error(`Failed to fetch FCM token for userId: ${userId}`, error);
        return { success: false, userId, error };
      }
    });

    const results = await Promise.allSettled(tokenPromises);

    // 성공한 FCM 토큰만 필터링
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        if (result.value.fcmToken) userFcmTokenList.push(result.value.fcmToken);
      }
    });

    // 알림 전송
    await this.appPush.sendPushMessage({
      targetDevicesFcmToken: userFcmTokenList,
      notification: { title: sendNoticeData.title, body: sendNoticeData.body },
    });

    // 알림 저장
    // ! 실패한 알림도 일단 DB에는 저장
    sendNoticeData.userIdList.forEach(async (userId) => {
      const user = await this.user.findOne(userId);
      await this.noticesRepository.create({
        title: sendNoticeData.title,
        body: sendNoticeData.body,
        user: user,
      });
    });
    return true;
  }

  @Transactional()
  public async noticeListByUserId(userId: number): Promise<GetNoticeListDto> {
    const user = await this.user.findOne(userId);
    const results = await this.noticesRepository.findAllByUserId(user.userId);
    const noticeList: GetNoticeDto[] = [];
    results.forEach((result) => {
      const { title, body, createdAt } = result;
      noticeList.push({ title, body, createdAt });
    });
    return { noticeList: noticeList };
  }
}
