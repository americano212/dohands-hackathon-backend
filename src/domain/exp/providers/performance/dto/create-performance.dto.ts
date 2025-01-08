import { Exp } from '#entities/exp.entity';
import { PickType } from '@nestjs/swagger';

export class CreatePerformanceDto extends PickType(Exp, [
  'userId',
  'googleSheetId',
  'expAt',
  'exp',
] as const) {}
