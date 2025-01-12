import { Module } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { BadgeController } from './badge.controller';
import { UserModule } from 'src/shared/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBadge } from '#entities/user-badge.entity';
import { BadgeRepository } from './badge.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserBadge]), UserModule],
  providers: [BadgeService, BadgeRepository],
  controllers: [BadgeController],
})
export class BadgeModule {}
