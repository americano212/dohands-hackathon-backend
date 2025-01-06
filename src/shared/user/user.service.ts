import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { UsersRepository } from './user.repository';
import { RoleService } from '../role/providers';
import { GiveRoleToUserDto } from './dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotUserId } from 'src/common';

@Injectable()
export class UserService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly role: RoleService,
  ) {}

  @Transactional()
  public async giveRole(giveRoleData: GiveRoleToUserDto): Promise<boolean> {
    const { userId, roleName } = giveRoleData;

    const user = await this.usersRepository.findOne(userId);
    if (!user) throw new NotFoundException(`User ID ${userId} NOT Found`);

    const isSuccess = await this.role.giveRoleToUser(roleName, user);
    if (!isSuccess) throw new NotFoundException(`The role '${roleName}' invalid role`);
    return isSuccess;
  }

  public async isExistId(id: string): Promise<boolean> {
    return await this.usersRepository.isExistId(id);
  }

  public async update(userId: number, updateUserdata: UpdateUserDto): Promise<boolean> {
    if (userId === NotUserId.ANONYMOUS) throw new ForbiddenException(`Invalid access_token`);
    // TODO pw일 경우 GoogleSheet 업데이트
    return await this.usersRepository.update(userId, updateUserdata);
  }
}
