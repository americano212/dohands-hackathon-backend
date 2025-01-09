import { Exp } from '#entities/exp.entity';
import { PickType } from '@nestjs/swagger';

export class CreateExpDto extends PickType(Exp, [
  'user',
  'googleSheetId',
  'questName',
  'exp',
  'expType',
  'expAt',
  'result',
  'period',
  'week',
  'productivity',
  'content',
] as const) {}
