import { Exp } from '#entities/exp.entity';
import { PickType } from '@nestjs/swagger';

export class UpdateLeaderQuestDto extends PickType(Exp, [
  'user',
  'week',
  'period',
  'exp',
  'expAt',
  'questName',
  'result',
] as const) {}
