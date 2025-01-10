import { Exp } from '#entities/exp.entity';
import { PickType } from '@nestjs/swagger';

export class CreateExpDto extends PickType(Exp, [
  'user',
  'googleSheetId',
  'questName',
  'exp',
  'expType',
  'expAt',
  'achieveGrade',
  'period',
  'week',
  'content',
] as const) {}
