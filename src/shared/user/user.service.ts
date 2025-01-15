import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { UsersRepository } from './user.repository';
import { RoleService } from '../role/providers';
import { GetUserInfoResponseDto, GiveRoleToUserDto, UserInfoFromGSSDto } from './dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GoogleSheetService, NotUserId } from 'src/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from '#entities/index';
import { BadgeCode } from 'src/domain/badge/badge.enum';
import { JobPosition } from './job-position.const';

@Injectable()
export class UserService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly role: RoleService,
    private readonly gssService: GoogleSheetService,
  ) {}

  public async findOne(userId: number): Promise<User> {
    if (userId === NotUserId.ANONYMOUS) throw new ForbiddenException(`Invalid access_token`);
    const user = await this.usersRepository.findOne(userId);
    if (!user) throw new NotFoundException(`User ID ${userId} NOT Found`);
    return user;
  }

  public async findAllUserId(): Promise<number[]> {
    const users = await this.usersRepository.findAllUserId();
    const userIdList: number[] = [];
    users.forEach((user) => {
      userIdList.push(user.userId);
    });
    return userIdList;
  }

  public async getUserInfo(userId: number): Promise<GetUserInfoResponseDto> {
    const user = await this.findOne(userId);
    const possibleBadgeCodeList: string[] = [];
    user.badges?.forEach((badge) => {
      possibleBadgeCodeList.push(badge.badgeCode);
    });
    const userInfo: GetUserInfoResponseDto = {
      employeeId: user.employeeId,
      username: user.username,
      hireDate: user.hireDate,
      department: user.department,
      jobGroup: user.jobGroup,
      jobPosition: user.jobPosition,
      jobFamily: user.jobFamily,
      jobLevel: user.jobLevel,
      totalExpLastYear: user.totalExpLastYear,
      profileImageCode: user.profileImageCode,
      profileBadgeCode: user.profileBadgeCode,
      possibleBadgeCodeList: possibleBadgeCodeList,
    };
    return userInfo;
  }

  public async getUserFcmToken(userId: number): Promise<string> {
    const user = await this.findOne(userId);
    const { fcmToken } = user;
    if (!fcmToken) throw new NotFoundException(`User ID ${userId} don't have fcm token`);
    return fcmToken;
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

  public async updateField(
    userId: number,
    field: string,
    updateData: UpdateUserDto,
  ): Promise<boolean> {
    const user = await this.findOne(userId);
    switch (field) {
      case 'password':
        if (!updateData.password) throw new BadRequestException(`BAD REQUEST require password`);
        return this.updatePassword(user.userId, updateData.password);
      case 'fcm_token':
        if (!updateData.fcmToken) throw new BadRequestException(`BAD REQUEST require fcmToken`);
        return this.updateFcmToken(user.userId, updateData.fcmToken);
      case 'profile_image_code':
        if (!updateData.profileImageCode)
          throw new BadRequestException(`BAD REQUEST require profileImageCode`);
        return this.updateProfileImageCode(user.userId, updateData.profileImageCode);
      case 'profile_badge_code':
        if (!updateData.profileBadgeCode)
          throw new BadRequestException(`BAD REQUEST require profileBadgeCode`);
        return this.updateProfileBadgeCode(user.userId, updateData.profileBadgeCode);
      default:
        throw new BadRequestException('Invalid field');
    }
  }

  private async updatePassword(userId: number, password: string): Promise<boolean> {
    await this.updatePasswordToGSS(userId, password); // PW 업데이트일 경우 GSS도 업데이트
    return await this.usersRepository.update(userId, { password });
  }

  private async updateFcmToken(userId: number, fcmToken: string): Promise<boolean> {
    return await this.usersRepository.update(userId, { fcmToken });
  }

  private async updateProfileImageCode(userId: number, profileImageCode: string): Promise<boolean> {
    return await this.usersRepository.update(userId, { profileImageCode });
  }

  private async updateProfileBadgeCode(userId: number, profileBadgeCode: string): Promise<boolean> {
    const badgeCodesList = Object.values(BadgeCode) as string[];
    const isValid = badgeCodesList.includes(profileBadgeCode);
    if (!isValid) throw new NotFoundException(`Not Found ${profileBadgeCode}, invalid BadgeCode`);
    return await this.usersRepository.update(userId, { profileBadgeCode });
  }

  private async updatePasswordToGSS(userId: number, password: string) {
    // userId로 부터 googleSheetId 불러오기
    const user = await this.findOne(userId);
    const { googleSheetId } = user;
    if (!googleSheetId) throw new NotFoundException(`Not Found googleSheetId user_id ${userId}`);
    const tabName = 'member_info';
    const range = `L${googleSheetId}`; // TODO 레거시
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
    const range = 'B10:M100'; // TODO 레거시
    const values = await this.gssService.getValueFromSheet({ tabName, range });

    for (let idx = 0; idx < values.length; idx++) {
      const value = values[idx];

      if (value[0] === '') continue; // No employeeId
      if (value[2] === '') continue; // No gender
      if (value[7] === '') continue; // No jobFamily & jobLevel
      if (value[8] === '') continue; // No id

      const employeeId = value[0]; // 사번 2023010101
      const username = value[1]; // 유저명 김민수
      const gender = value[2] === '남' ? 'A' : 'B'; // 성별 M A | B
      const hireDate = new Date(value[3]); // 입사일 2023-01-01
      const department = value[4]; // 소속 음성 1센터
      const jobGroup = Number(value[5]); // 직무그룹 1
      const jobPositionText: string = value[6]; // 직책 파트장
      const jobLevel = value[7]; // 레벨 F1 - I
      const jobFamily = jobLevel[0]; // 직군분류 F
      const profileImageCode = `${jobFamily}_${gender}`;
      const id = value[8];
      const default_password = value[9];
      const change_password = value[10];
      const totalExpLastYear = Number(value[11].replace(/,/g, ''));

      const jobPosition = JobPosition[jobPositionText];

      const userInfo: UserInfoFromGSSDto = {
        googleSheetId: `${idx + 10}`,
        employeeId,
        username,
        gender,
        hireDate,
        department,
        jobGroup,
        jobPosition,
        jobLevel,
        jobFamily,
        profileImageCode,
        id,
        password: change_password !== '' ? change_password : default_password,
        totalExpLastYear,
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
