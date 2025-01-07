import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { UsersRepository } from './user.repository';
import { RoleService } from '../role/providers';
import { GetUserInfoResponseDto, GiveRoleToUserDto, UserInfoFromGSSDto } from './dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GoogleSheetService, NotUserId } from 'src/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UserService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly role: RoleService,
    private readonly gssService: GoogleSheetService,
  ) {}

  public async getUserInfo(userId: number): Promise<GetUserInfoResponseDto> {
    if (userId === NotUserId.ANONYMOUS) throw new ForbiddenException(`Invalid access_token`);

    const user = await this.usersRepository.findOne(userId);
    if (!user) throw new NotFoundException(`User ID ${userId} NOT Found`);
    const userInfo: GetUserInfoResponseDto = {
      employeeId: user.employeeId,
      username: user.username,
      hireDate: user.hireDate,
      department: user.department,
      jobGroup: user.jobGroup,
      jobFamily: user.jobFamily,
      jobLevel: user.jobLevel,
      totalExpLastYear: user.totalExpLastYear,
    };
    return userInfo;
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
    if (userId === NotUserId.ANONYMOUS) throw new ForbiddenException(`Invalid access_token`);

    if (updateUserdata.password) await this.updatePasswordToGSS(userId, updateUserdata.password); // PW 업데이트일 경우 GSS도 업데이트
    return await this.usersRepository.update(userId, updateUserdata);
  }

  private async updatePasswordToGSS(userId: number, password: string) {
    // TODO DB에서 userId로 부터 googleSheetId 불러오기
    const user = await this.usersRepository.findOne(userId);
    if (!user) throw new NotFoundException(`Not Found user_id ${userId}`);
    const { googleSheetId } = user;
    if (!googleSheetId) throw new NotFoundException(`Not Found googleSheetId user_id ${userId}`);
    const tabName = 'member_info';
    const range = `J${googleSheetId}`;
    await this.gssService.writeValueFromSheet({
      tabName: tabName,
      range: range,
      inputValue: password,
    });
  }

  // TODO transaction
  @Cron(CronExpression.EVERY_MINUTE) // 1분마다 자동 실행
  public async getUserInfoFromGSS(): Promise<boolean> {
    const tabName = 'member_info';
    const range = 'B10:K20';
    const values = await this.gssService.getValueFromSheet({ tabName, range });

    for (let idx = 0; idx < values.length; idx++) {
      if (values[idx][0] === '') continue; // No employeeId
      if (values[idx][5] === '') continue; // No jobFamily & jobLevel
      if (values[idx][6] === '') continue; // No id

      const default_password = values[idx][7];
      const change_password = values[idx][8];

      const userInfo: UserInfoFromGSSDto = {
        googleSheetId: `${idx + 10}`,
        employeeId: values[idx][0],
        username: values[idx][1],
        hireDate: new Date(values[idx][2]),
        department: values[idx][3],
        jobGroup: Number(values[idx][4]),
        jobFamily: values[idx][5][0],
        jobLevel: values[idx][5],
        id: values[idx][6],
        password: change_password !== '' ? change_password : default_password,
        totalExpLastYear: Number(values[idx][9].replace(/,/g, '')),
      };

      const isExist = await this.usersRepository.isExistGoogleSheetId(userInfo.googleSheetId);

      if (isExist) {
        // 이미 존재할 때는 업데이트
        await this.usersRepository.updateByGoogleSheetId(userInfo);
      } else {
        // 새로운 직원일 때는 추가
        await this.usersRepository.createFromGSS(userInfo);
      }
    }

    return true;
  }
}
