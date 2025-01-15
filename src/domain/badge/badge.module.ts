import { Module } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { BadgeController } from './badge.controller';
import { UserModule } from 'src/shared/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBadge } from '#entities/user-badge.entity';
import { BadgeRepository } from './badge.repository';
import { NoticeModule } from 'src/shared/notice/notice.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserBadge]), UserModule, NoticeModule],
  providers: [BadgeService, BadgeRepository],
  controllers: [BadgeController],
})
export class BadgeModule {}
