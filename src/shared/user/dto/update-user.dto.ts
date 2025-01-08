import { User } from '#entities/user.entity';
import { PickType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateUserDto extends PickType(User, [
  'password',
  'fcmToken',
  'profileImageCode',
  'profileBadgeCode',
] as const) {
  @IsOptional()
  public override password?: string;

  @IsOptional()
  public override fcmToken?: string;

  @IsOptional()
  public override profileImageCode?: string;

  @IsOptional()
  public override profileBadgeCode?: string;
}
