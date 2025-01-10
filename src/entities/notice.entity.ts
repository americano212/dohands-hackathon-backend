import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { CoreEntity } from './core.entity';
import { User } from './user.entity';

@Entity('notice')
export class Notice extends CoreEntity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  @IsInt()
  public noticeId!: number;

  @ApiProperty({ example: 'message title', description: '메시지 제목' })
  @Column({ type: 'varchar', nullable: false })
  @IsString()
  public title!: string;

  @ApiProperty({ example: 'message body', description: '메시지 본문' })
  @Column({ type: 'varchar', nullable: false })
  @IsString()
  public body!: string;

  // ! 전송 성공 여부도 있으면 좋겠지만 시간상 스킵

  @ManyToOne(() => User, (user) => user.notices, { cascade: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
