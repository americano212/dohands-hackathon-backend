import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsInt, IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';
import { CoreEntity } from './core.entity';
import { UserRole } from './user-role.entity';
import { Board } from './board';
import { Exp } from './exp';

@Entity('user')
export class User extends CoreEntity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  @IsInt()
  public userId!: number;

  @ApiProperty({ example: 'E10', description: 'google sheet address' })
  @Column({ type: 'varchar', nullable: true })
  @MaxLength(30)
  @IsString()
  public googleSheetId?: string | null;

  @ApiProperty({ example: '2025010101', description: '사원번호 (입사일+번호)' })
  @Column({ type: 'varchar', nullable: false, unique: true, default: 'DEFAULT_EMPLOYEE_ID' })
  @MaxLength(30)
  @IsNotEmpty()
  @IsString()
  public employeeId!: string;


  @ApiProperty({ example: '홍길동' })
  @Column({ type: 'varchar', nullable: true })
  @Length(2, 10)
  @IsString()
  public username?: string | null;

  @ApiProperty({ example: 'minsukim', description: '로그인을 위한 ID' })
  @Column({ type: 'varchar', nullable: false, unique: true })
  @IsNotEmpty()
  @IsString()
  public id!: string;

  @ApiProperty({ example: 'password', description: '로그인시 비밀번호(평문저장 주의)' })
  @Column({ type: 'varchar', nullable: true })
  @IsString()
  public password?: string | null;

  @ApiProperty({ example: '2025.01.01', description: '입사일' })
  @Column({ type: 'date', nullable: true })
  public hireDate?: Date | null;

  @ApiProperty({ example: '음성 1센터', description: '소속' })
  @Column({ type: 'varchar', nullable: true })
  @MaxLength(30)
  @IsNotEmpty()
  @IsString()
  public department?: string | null;

  @ApiProperty({ example: '1', description: '직무 그룹 (1/2)' })
  @Column({ type: 'int', nullable: true })
  @IsNotEmpty()
  @IsInt()
  public jobGroup!: number | null;

  @ApiProperty({ example: 'F', description: '레벨 분류용 직군 (F현장직군, B관리직군, G성장전략, T기술직군)' })
  @Column({ type: 'varchar', nullable: true })
  @MaxLength(30)
  @IsNotEmpty()
  @IsString()
  public jobFamily!: string | null;
  
  @ApiProperty({ description: 'JWT Token' })
  @Column({ type: 'text', nullable: true, select: false })
  @IsString()
  public refreshToken?: string | null;

  @ApiProperty({ example: '<FCM Token>', description: 'FCM Token' })
  @Column({ type: 'text', nullable: true })
  @IsString()
  public fcmToken?: string | null;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  public roles?: UserRole[];

  @OneToMany(() => Board, (board) => board.user)
  public boards?: Board[];

  @OneToMany(() => Exp, (exp) => exp.user)
  public exps?: Exp[];

  constructor(userId?: number) {
    super();
    if (userId) this.userId = userId;
  }
}
