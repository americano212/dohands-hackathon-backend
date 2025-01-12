import { UserBadge } from '#entities/user-badge.entity';
import { PickType } from '@nestjs/swagger';

export class GiveBadgeToUserDto extends PickType(UserBadge, ['badgeCode'] as const) {}
