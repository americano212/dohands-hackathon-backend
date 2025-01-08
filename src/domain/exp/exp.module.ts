import { Module } from '@nestjs/common';
import { ExpService } from './exp.service';
import { ExpController } from './exp.controller';
import { Exp } from '#entities/exp.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpsRepository } from './exp.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Exp])],
  controllers: [ExpController],
  providers: [ExpService, ExpsRepository],
  exports: [ExpService, ExpsRepository],
})
export class ExpModule {}
