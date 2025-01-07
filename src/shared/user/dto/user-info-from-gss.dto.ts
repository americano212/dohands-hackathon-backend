import { User } from '#entities/user.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';

export class UserInfoFromGSSDto extends PickType(User, [
  'googleSheetId',
  'employeeId',
  'username',
  'hireDate',
  'department',
  'jobGroup',
  'jobFamily',
  'jobLevel',
  'id',
  'password',
  'totalExpLastYear',
] as const) {
  @ApiProperty({ example: '10', description: 'google sheet address' })
  public override googleSheetId!: string;
}
