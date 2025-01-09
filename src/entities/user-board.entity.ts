import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Board } from './board.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

@Entity('user_board')
export class UserBoard {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
    name: 'user_board_id',
  })
  public userBoardId!: number;

  @ApiProperty({ example: true, description: '유저가 해당 게시글을 읽어는지 여부' })
  @Column({ type: 'boolean', nullable: false, default: false })
  @IsBoolean()
  public isRead!: boolean;

  @ManyToOne(() => User, (user) => user.userBoards, { cascade: true })
  @JoinColumn({ name: 'user_id' })
  public user!: User;

  @ManyToOne(() => Board, (board) => board.userBoards, { cascade: true })
  @JoinColumn({ name: 'board_id' })
  public board!: Board;
}
