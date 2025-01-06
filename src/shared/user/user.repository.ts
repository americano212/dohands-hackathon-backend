import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '#entities/user.entity';

import { CreateUserDto } from './dto';
import { NullableType } from 'src/common/types';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

  public async create(userData: CreateUserDto): Promise<User> {
    return await this.usersRepository.save(await this.usersRepository.create(userData));
  }

  public async findOne(userId: number): Promise<NullableType<User>> {
    return await this.usersRepository.findOne({
      relations: { roles: true },
      where: { userId: userId },
    });
  }

  public async findOneById(id: string): Promise<NullableType<User>> {
    return await this.usersRepository.findOne({
      relations: { roles: true },
      where: { id: id },
      select: {
        userId: true,
        username: true,
        id: true,
        password: true,
        roles: { roleName: true },
      },
    });
  }

  public async isExistUsername(username: string): Promise<boolean> {
    return await this.usersRepository.exists({ where: { username: username } });
  }

  public async isExistId(id: string): Promise<boolean> {
    return await this.usersRepository.exists({ where: { id: id } });
  }

  public async setRefreshToken(userId: number, token: string): Promise<boolean> {
    const result = await this.usersRepository.update({ userId: userId }, { refreshToken: token });
    return result.affected ? true : false;
  }

  public async update(userId: number, updateUserdata: UpdateUserDto): Promise<boolean> {
    const result = await this.usersRepository.update({ userId }, updateUserdata);
    return result.affected ? true : false;
  }
}
