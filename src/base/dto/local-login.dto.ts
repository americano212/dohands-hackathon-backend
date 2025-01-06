import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from 'src/shared/user/dto';

export class LocalLoginDto extends PickType(CreateUserDto, ['id', 'password'] as const) {}
