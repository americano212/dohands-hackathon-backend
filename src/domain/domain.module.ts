import { Module } from '@nestjs/common';
import { BoardModule } from './board/board.module';
import { ExpModule } from './exp/exp.module';
@Module({
  imports: [BoardModule, ExpModule],
})
export class DomainModule {}
