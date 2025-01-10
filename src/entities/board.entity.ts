import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { CoreEntity } from '.';
import { ApiProperty } from '@nestjs/swagger';
import { UserBoard } from './user-board.entity';

@Entity('board')
export class Board extends CoreEntity {
  @ApiProperty({ example: 1, description: 'Board 식별 ID' })
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'board_id' })
  @IsInt()
  public boardId!: number;

  @ApiProperty({ example: '10', description: '구글 스프레드시트 index (행 번호)' })
  @Column({ type: 'varchar', nullable: true })
  @IsString()
  public googleSheetId?: string | null;

  @ApiProperty({ example: 'Test Title 테스트 제목', description: '게시글 제목' })
  @Column({ type: 'varchar', nullable: false })
  @IsNotEmpty()
  @MaxLength(255)
  @IsString()
  public title!: string;

  @ApiProperty({ example: 'Test Content 테스트 내용', description: '게시글 내용' })
  @Column({ type: 'text', nullable: false })
  @IsNotEmpty()
  @IsString()
  public content!: string;

  @OneToMany(() => UserBoard, (userBoard) => userBoard.board)
  public userBoards?: UserBoard[];
}
