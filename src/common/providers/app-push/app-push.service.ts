import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '../config.service';
import { AppPushMessageDto, AppPushMessageResponseDto } from './dto';
import * as admin from 'firebase-admin';
import { MulticastMessage } from 'firebase-admin/lib/messaging/messaging-api';

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

    if (tokens.length === 0) {
      console.log('No device tokens provided');
      return { isSuccess: false, successMsgCount: 0, failMsgCount: 0 };
    }

    const fcmPayload: MulticastMessage = {
      tokens: tokens,
      notification: {
        title: message.notification.title,
        body: message.notification.body,
      },
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(fcmPayload);
      console.log('send-multicast-result', response);

      return {
        isSuccess: response.failureCount === 0,
        successMsgCount: response.successCount,
        failMsgCount: response.failureCount,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
