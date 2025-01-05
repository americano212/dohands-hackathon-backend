import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsInt, IsNotEmpty, IsString, Length } from 'class-validator';
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

  @Column({ type: 'varchar', nullable: true, select: false })
  @IsString()
  public passwordHash?: string;

  @ApiProperty({ example: 'test@example.com' })
  @Column({ type: 'varchar', nullable: false, unique: true })
  @IsNotEmpty()
  @IsEmail()
  public email!: string;

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
