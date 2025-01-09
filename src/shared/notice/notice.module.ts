import { Global, Module } from '@nestjs/common';
import { NoticeController } from './notice.controller';
import * as providers from './providers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notice } from '#entities/notice.entity';
import { UserModule } from '../user/user.module';

const services = [...Object.values(providers)];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Notice]), UserModule],
  controllers: [NoticeController],
  providers: services,
  exports: services,
})
export class NoticeModule {}
