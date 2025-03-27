import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UsersRepository } from './user.repository';
import { RoleService } from '../role/providers';
import { GoogleSheetService } from 'src/common';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotUserId } from 'src/common';
import { User } from '#entities/index';

describe('UserService', () => {
  let service: UserService;
  let usersRepository: jest.Mocked<UsersRepository>;

  const mockUser: User = {
    userId: 1,
    employeeId: '2023010101',
    username: '김민수',
    hireDate: new Date('2023-01-01'),
    department: '음성 1센터',
    jobGroup: 1,
    jobPosition: 1,
    jobFamily: 'F',
    jobLevel: 'F1',
    totalExpLastYear: 1,
    profileImageCode: 'F_A',
    profileBadgeCode: 'BADGE_01',
    badges: [],
    fcmToken: 'test-token',
    googleSheetId: '10',
    gender: 'M',
    id: 'minsukim',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UsersRepository,
          useValue: {
            findOne: jest.fn(),
            findAllUserId: jest.fn(),
            update: jest.fn(),
            isExistGoogleSheetId: jest.fn(),
            updateByGoogleSheetId: jest.fn(),
            createFromGSS: jest.fn(),
            setFcmTokenNull: jest.fn(),
          },
        },
        {
          provide: RoleService,
          useValue: {
            giveRoleToUser: jest.fn(),
          },
        },
        {
          provide: GoogleSheetService,
          useValue: {
            writeValueFromSheet: jest.fn(),
            getValueFromSheet: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    usersRepository = module.get(UsersRepository);
  });

  describe('findOne', () => {
    it('유효한 userId로 사용자를 찾을 수 있어야 합니다', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(usersRepository.findOne).toHaveBeenCalledWith(1);
    });

    it('익명 사용자 ID로 접근시 ForbiddenException을 발생시켜야 합니다', async () => {
      await expect(service.findOne(NotUserId.ANONYMOUS)).rejects.toThrow(ForbiddenException);
    });

    it('존재하지 않는 사용자 ID로 접근시 NotFoundException을 발생시켜야 합니다', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
