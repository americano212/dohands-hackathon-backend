import { User } from '#entities/user.entity';
import { PickType } from '@nestjs/swagger';

export class UpdateUserDto extends PickType(User, [
  'password',
  'fcmToken',
  'profileImageCode',
  'profileBadgeCode',
] as const) {}
