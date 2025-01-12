import { Module } from '@nestjs/common';
import { BoardModule } from './board/board.module';
import { ExpModule } from './exp/exp.module';
import { BadgeModule } from './badge/badge.module';
@Module({
  imports: [BoardModule, ExpModule, BadgeModule],
})
export class DomainModule {}
