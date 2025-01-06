import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { GiveRoleToUserDto, UpdateUserDto } from './dto';
import { UserService } from './user.service';
import { SuccessResponseDto } from 'src/common/dto';
import { Role, Roles, UserId } from 'src/common';

@ApiBearerAuth()
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly user: UserService) {}

  @Roles(Role.SuperAdmin)
  @Post('role')
  public async giveRoleToUser(@Body() data: GiveRoleToUserDto): Promise<SuccessResponseDto> {
    return { isSuccess: await this.user.giveRole(data) };
  }

  @Patch()
  public async update(
    @UserId() userId: number,
    @Body() updateUserdata: UpdateUserDto,
  ): Promise<SuccessResponseDto> {
    return { isSuccess: await this.user.update(userId, updateUserdata) };
  }
}
