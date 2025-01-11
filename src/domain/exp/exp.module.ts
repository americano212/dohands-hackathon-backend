import { Module } from '@nestjs/common';
import { ExpController } from './exp.controller';
import { Exp } from '#entities/exp.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpsRepository } from './exp.repository';
import * as providers from './providers';
import { UserModule } from 'src/shared/user/user.module';

const services = [...Object.values(providers), ExpsRepository];

@Module({
  imports: [TypeOrmModule.forFeature([Exp]), UserModule],
  controllers: [ExpController],
  providers: services,
  exports: services,
})
export class ExpModule {}
