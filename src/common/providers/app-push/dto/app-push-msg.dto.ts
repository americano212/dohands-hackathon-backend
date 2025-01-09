import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponseDto } from 'src/common/dto';
import { Notification } from 'src/shared/notice/providers/dto';

export type FcmToken = string;

export class AppPushMessageDto {
  @ApiProperty({ example: ['<FCM registration token>'], description: '디바이스 토큰' })
  public targetDevicesFcmToken!: FcmToken[];

  @ApiProperty({
    type: Notification,
    description: '푸시 알림 데이터',
  })
  public notification!: Notification;
}

export class AppPushMessageResponseDto extends SuccessResponseDto {
  @ApiProperty({ example: 1, description: '성공한 메시지 수' })
  successMsgCount!: number;

  @ApiProperty({ example: 0, description: '실패한 메시지 수' })
  failMsgCount!: number;
}
