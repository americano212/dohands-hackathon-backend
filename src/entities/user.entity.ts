import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsInt, IsNotEmpty, IsString, Length } from 'class-validator';
import { CoreEntity } from './core.entity';
import { UserRole } from './user-role.entity';
import { Content } from './board';

@Entity('user')
export class User extends CoreEntity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  @IsInt()
  public userId!: number;

  @ApiProperty({ example: '홍길동' })
  @Column({ type: 'varchar', nullable: true })
  @Length(2, 10)
  @IsString()
  public username?: string;

  @ApiProperty({ example: 'minsukim', description: '로그인을 위한 ID' })
  @Column({ type: 'varchar', nullable: false, unique: true })
  @IsNotEmpty()
  @IsString()
  public id!: string;

  @ApiProperty({ example: 'password', description: '로그인시 비밀번호(평문저장 주의)' })
  @Column({ type: 'varchar', nullable: true })
  @IsString()
  public password?: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  @IsString()
  public refreshToken?: string;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  public roles?: UserRole[];

  @OneToMany(() => Content, (content) => content.user)
  public contents?: Content[];

  constructor(userId?: number) {
    super();
    if (userId) this.userId = userId;
  }
}
