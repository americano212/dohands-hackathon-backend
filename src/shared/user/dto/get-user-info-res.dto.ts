import { User } from '#entities/user.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { BadgeCode } from 'src/domain/badge/badge.enum';

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
  @ApiProperty({
    example: [BadgeCode.ANNUAL_MVP_2024, BadgeCode.COMPANY_PROJECT_OVER_5],
    description: '사용할 수 있는 badge code 리스트',
  })
  public possibleBadgeCodeList?: string[] | null;
}
