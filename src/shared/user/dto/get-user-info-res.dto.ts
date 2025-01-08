import { User } from '#entities/user.entity';
import { PickType } from '@nestjs/swagger';

export class GetUserInfoResponseDto extends PickType(User, [
  'employeeId',
  'username',
  'hireDate',
  'department',
  'jobGroup',
  'jobFamily',
  'jobLevel',
  'totalExpLastYear',
  'profileImageCode',
  'profileBadgeCode',
  'possibleBadgeCodeList',
] as const) {}
