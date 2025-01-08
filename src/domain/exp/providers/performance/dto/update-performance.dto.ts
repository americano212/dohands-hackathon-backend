import { Exp } from '#entities/exp.entity';
import { PickType } from '@nestjs/swagger';

export class UpdatePerformanceDto extends PickType(Exp, [
  'userId',
  'googleSheetId',
  'expAt',
  'exp',
] as const) {}
