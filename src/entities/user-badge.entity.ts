import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CoreEntity } from './core.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { User } from './user.entity';

@Entity('badge')
export class UserBadge extends CoreEntity {
  @ApiProperty({ example: 1, description: 'Badge 식별 ID' })
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'badge_id' })
  @IsInt()
  public badgeId!: number;

  @ApiProperty({ example: 'A', description: 'Badge 식별자' })
  @Column({ type: 'varchar', nullable: false, default: 'Z' })
  public badgeCode!: string; // 코드 레벨에서 하드코딩으로 부여

  @ManyToOne(() => User, (user) => user.badges, { cascade: true })
  @JoinColumn({ name: 'user_id' })
  public user!: User;
}
