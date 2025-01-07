import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsInt, IsString, Max } from 'class-validator';

import { User, CoreEntity } from '..';
import { ApiProperty } from '@nestjs/swagger';

@Entity('exp')
export class Exp extends CoreEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'exp_id' })
  @IsInt()
  public expId!: number;

  @ApiProperty({ example: 'E10', description: 'google sheet address' })
  @Column({ type: 'varchar', nullable: true })
  @Max(30)
  @IsString()
  public googleSheetId?: string | null;

  @ApiProperty({ description: 'quest name' })
  @Column({ type: 'varchar', nullable: true })
  @Max(255)
  @IsString()
  public questName?: string | null;

  @ApiProperty({ description: '획득한 경험치' })
  @Column({ type: 'int', nullable: false })
  @IsInt()
  public exp!: number;

  @ApiProperty({ example: "J",description: 'exp type ex)J(직무별), H1(상반기 인사평가), H2(하반기 인사평가), L(리더부여), C(전사)' })
  @Column({ type: 'varchar', nullable: false })
  @Max(30)
  @IsString()
  public expType!: string;

  @ApiProperty({ example: new Date(), description: '경험치 획득 날짜' })
  @Column({ type: 'datetime', nullable: true })
  public expDt?: Date | null;

  @ApiProperty({ example: "MAX", description: '달성 내용 ex)MAX, MEDIAN, S, A, B, C, D' })
  @Column({ type: 'varchar', nullable: true })
  @Max(30)
  @IsString()
  public result?: string | null;

  @ApiProperty({ example: 1, description: '주차 (1~52)' })
  @Column({ type: 'int', nullable: true })
  @IsInt()
  public week?: number | null;

  @ApiProperty({ description: '생산성 수치(직무별 퀘스트)' })
  @Column({ type: 'int', nullable: true })
  @IsInt()
  public productivity?: number | null;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.exps, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;
}
