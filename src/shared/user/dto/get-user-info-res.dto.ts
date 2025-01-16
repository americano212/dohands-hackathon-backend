import { UserBadge } from '#entities/user-badge.entity';
import { User } from '#entities/user.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { BadgeCode } from 'src/domain/badge/badge.enum';

export class GetUserInfoResponseDto extends PickType(User, [
  'employeeId',
  'username',
  'hireDate',
  'department',
  'jobGroup',
  'jobPosition',
  'jobFamily',
  'jobLevel',
  'totalExpLastYear',
  'profileImageCode',
  'profileBadgeCode',
] as const) {
  @ApiProperty({
    example: [{ badgeCode: BadgeCode.ANNUAL_MVP_2024, createdAt: new Date() }],
    description: '사용할 수 있는 badge code 리스트',
  })
  public possibleBadgeCodeList?: BadgeCodeWithCreatedAt[] | null;
}

export class BadgeCodeWithCreatedAt extends PickType(UserBadge, [
  'badgeCode',
  'createdAt',
] as const) {}
