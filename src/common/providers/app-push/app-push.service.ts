import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '../config.service';
import { AppPushMessageDto, AppPushMessageResponseDto } from './dto';
import * as admin from 'firebase-admin';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';

@Injectable()
export class AppPushService {
  constructor(private config: ConfigService) {
    const firebase_params = {
      type: this.config.get('firebase.type'),
      projectId: this.config.get('firebase.project_id'),
      privateKeyId: this.config.get('firebase.private_key_id'),
      privateKey: this.config.get('firebase.private_key').replace(/\\n/g, '\n'),
      clientEmail: this.config.get('firebase.client_email'),
      clientId: this.config.get('firebase.client_id'),
      authUri: this.config.get('firebase.auth_uri'),
      tokenUri: this.config.get('firebase.token_uri'),
      authProviderX509CertUrl: this.config.get('firebase.auth_provider_x509_cert_url'),
      clientC509CertUrl: this.config.get('firebase.client_x509_cert_url'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(firebase_params),
    });
  }
  public async sendPushMessage(message: AppPushMessageDto): Promise<AppPushMessageResponseDto> {
    console.log(message);
    const tokens = message.targetDevicesFcmToken;

    const sendPromises = tokens.map(async (token) => {
      const fcmPayload: Message = {
        token: token,
        notification: {
          title: message.notification.title,
          body: message.notification.body,
        },
      };
      try {
        const result = await admin.messaging().send(fcmPayload);
        console.log('send-message-result', result);
        return { success: true, token }; // 성공한 토큰 반환
      } catch (error) {
        throw new BadRequestException(error);
      }
    });

    const results = await Promise.allSettled(sendPromises); // 모든 작업이 완료될 때까지 기다림
    // 성공과 실패 결과를 분리
    const successes = results.filter((result) => result.status === 'fulfilled');
    const failures = results.filter((result) => result.status === 'rejected');

    return {
      isSuccess: failures.length === 0,
      successMsgCount: successes.length,
      failMsgCount: failures.length,
    };
  }
}
