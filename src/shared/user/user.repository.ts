import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '#entities/user.entity';

import { CreateUserDto, UserInfoFromGSSDto } from './dto';
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

  public async findAllUserId(): Promise<User[]> {
    return await this.usersRepository.find({
      select: { userId: true },
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

  public async findOneByEmployeeId(employeeId: string): Promise<NullableType<User>> {
    return await this.usersRepository.findOne({
      relations: { roles: true },
      where: { employeeId: employeeId },
      select: {
        userId: true,
        username: true,
        id: true,
        password: true,
        roles: { roleName: true },
      },
    });
  }

  public async findAllByJobGroup(
    department: string | null,
    jobGroup: number | null,
  ): Promise<NullableType<User[]>> {
    const where: any = {};
    if (department !== null) {
      where.department = department;
    }
    if (jobGroup !== null) {
      where.jobGroup = jobGroup;
    }

    return await this.usersRepository.find({
      relations: { roles: true },
      where: where,
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

  public async isExistGoogleSheetId(googleSheetId: string): Promise<boolean> {
    return await this.usersRepository.exists({ where: { googleSheetId: googleSheetId } });
  }

  public async setRefreshToken(userId: number, token: string): Promise<boolean> {
    const result = await this.usersRepository.update({ userId: userId }, { refreshToken: token });
    return result.affected ? true : false;
  }

  public async update(userId: number, updateUserdata: UpdateUserDto): Promise<boolean> {
    const result = await this.usersRepository.update({ userId }, updateUserdata);
    return result.affected ? true : false;
  }

  public async createFromGSS(userInfo: UserInfoFromGSSDto): Promise<User> {
    return await this.usersRepository.save(await this.usersRepository.create(userInfo));
  }

  public async updateByGoogleSheetId(userInfo: UserInfoFromGSSDto): Promise<boolean> {
    const result = await this.usersRepository.update(
      { googleSheetId: userInfo.googleSheetId },
      userInfo,
    );
    return result.affected ? true : false;
  }
}
