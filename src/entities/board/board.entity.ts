import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { User, CoreEntity } from '..';
import { ApiProperty } from '@nestjs/swagger';

@Entity('Board')
export class Board extends CoreEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'board_id' })
  @IsInt()
  public contentId!: number;

  @ApiProperty({ example: 10, description: '구글 스프레드시트 index' })
  @Column({ type: 'int', nullable: true })
  @IsInt()
  public googleSheetId?: number | null;

  @ApiProperty({ example: 'Test Title' })
  @Column({ type: 'varchar', nullable: false })
  @IsNotEmpty()
  @MaxLength(255)
  @IsString()
  public title!: string;

  @ApiProperty({ example: 'Test Content' })
  @Column({ type: 'text', nullable: false })
  @IsNotEmpty()
  @IsString()
  public content!: string;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.boards, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
