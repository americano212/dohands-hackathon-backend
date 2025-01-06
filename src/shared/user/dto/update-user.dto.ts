import { User } from '#entities/user.entity';
import { PickType } from '@nestjs/swagger';

export class UpdateUserDto extends PickType(User, ['password', 'fcmToken'] as const) {}

export class UpdateUserPasswordDto extends PickType(UpdateUserDto, ['password'] as const) {}

export class UpdateUserFCMDto extends PickType(UpdateUserDto, ['fcmToken'] as const) {}
