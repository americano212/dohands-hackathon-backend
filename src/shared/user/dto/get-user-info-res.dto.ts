import { User } from '#entities/user.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';

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
] as const) {
  @ApiProperty({ example: ['A', 'B'], description: '사용할 수 있는 badge code 리스트' })
  public possibleBadgeCodeList?: string[] | null;
}
