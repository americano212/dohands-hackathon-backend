import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsInt, IsString, Length, MaxLength } from 'class-validator';
import { CoreEntity } from './core.entity';
import { UserRole } from './user-role.entity';
import { Exp } from './exp.entity';
import { Notice } from './notice.entity';
import { UserBoard } from './user-board.entity';

@Entity('user')
export class User extends CoreEntity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  @IsInt()
  public userId!: number;

  @ApiProperty({ example: '10', description: '구글 스프레드시트 index (행 번호)' })
  @Column({ type: 'varchar', nullable: true })
  @MaxLength(30)
  @IsString()
  public googleSheetId?: string | null;

  @ApiProperty({ example: '2025010101', description: '사원번호 (입사일+번호)' })
  @Column({ type: 'varchar', nullable: false, unique: true, default: 'DEFAULT_EMPLOYEE_ID' })
  @MaxLength(30)
  @IsString()
  public employeeId!: string;

  @ApiProperty({ example: '홍길동' })
  @Column({ type: 'varchar', nullable: true })
  @Length(2, 10)
  @IsString()
  public username?: string | null;

  @ApiProperty({ example: 'minsukim', description: '로그인을 위한 ID' })
  @Column({ type: 'varchar', nullable: false, unique: true })
  @IsString()
  public id!: string;

  @ApiProperty({ example: 'password', description: '로그인시 비밀번호(평문저장 주의)' })
  @Column({ type: 'varchar', nullable: true })
  @IsString()
  public password?: string | null;

  @ApiProperty({ example: '2025-01-01', description: '입사일' })
  @Column({ type: 'date', nullable: true })
  public hireDate?: Date | null;

  @ApiProperty({ example: '음성 1센터', description: '소속' })
  @Column({ type: 'varchar', nullable: true })
  @MaxLength(30)
  @IsString()
  public department?: string | null;

  @ApiProperty({ example: 1, description: '직무 그룹 (1/2)' })
  @Column({ type: 'int', nullable: true })
  @IsInt()
  public jobGroup?: number | null;

  @ApiProperty({
    example: 'F',
    description: '레벨 분류용 직군 (F현장직군, B관리직군, G성장전략, T기술직군)',
  })
  @Column({ type: 'varchar', nullable: true })
  @MaxLength(30)
  @IsString()
  public jobFamily!: string | null;

  @ApiProperty({
    example: 'F1 - I',
    description: '레벨',
  })
  @Column({ type: 'varchar', nullable: true })
  @MaxLength(30)
  @IsString()
  public jobLevel!: string | null;

  @ApiProperty({ example: 10000, description: '작년까지 획득한 총경험치 양' })
  @Column({ type: 'int', nullable: false, default: 0 })
  @IsInt()
  public totalExpLastYear!: number;

  @ApiProperty({ description: 'JWT Token' })
  @Column({ type: 'text', nullable: true, select: false })
  @IsString()
  public refreshToken?: string | null;

  @ApiProperty({ example: '<FCM Token>', description: 'FCM Token' })
  @Column({ type: 'text', nullable: true })
  @IsString()
  public fcmToken?: string | null;

  @ApiProperty({ example: 'F-B', description: '프로필 이미지 식별자(직군_성별) A:남자, B:여자' })
  @Column({ type: 'varchar', nullable: true, default: 'F_B' })
  @IsString()
  public profileImageCode?: string | null;

  @ApiProperty({ example: 'A', description: '프로필 badge 식별자' })
  @Column({ type: 'varchar', nullable: true })
  public profileBadgeCode?: string | null;

  // ! 최대 5개라해서 정규화 안하는게 나을듯
  @ApiProperty({ example: ['A', 'B'], description: '사용할 수 있는 badge 리스트' })
  @Column({ type: 'json', nullable: true })
  public possibleBadgeCodeList?: string[] | null;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  public roles?: UserRole[];

  @OneToMany(() => UserBoard, (userBoard) => userBoard.user)
  public userBoards?: UserBoard[];

  @OneToMany(() => Exp, (exp) => exp.user)
  public exps?: Exp[];

  @OneToMany(() => Notice, (notice) => notice.user)
  public notices?: Notice[];

  constructor(userId?: number) {
    super();
    if (userId) this.userId = userId;
  }
}
