import { Injectable, NotFoundException } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { User } from '#entities/user.entity';

import { UsersRepository } from './user.repository';
import { RoleService } from '../role/providers';
import { LocalRegisterDto, GiveRoleToUserDto } from './dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly role: RoleService,
  ) {}

  @Transactional()
  public async createLocalUser(userData: LocalRegisterDto): Promise<User> {
    const { password, ...userWithoutPassword } = userData;
    const user = await this.usersRepository.create({
      password,
      ...userWithoutPassword,
    });
    return user;
  }

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
    return await this.usersRepository.update(userId, updateUserdata);
  }
}
