import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponseDto } from 'src/common/dto';

export type FcmToken = string;

export class Notification {
  @ApiProperty({ example: 'message title', description: '메시지 제목' })
  public title!: string;

  @ApiProperty({ example: 'message body', description: '메시지 본문' })
  public body!: string;
}

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
