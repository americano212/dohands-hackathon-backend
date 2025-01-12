import { Module } from '@nestjs/common';
import { BadgeService } from './badge.service';

@Module({
  providers: [BadgeService],
})
export class BadgeModule {}
