import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { ConfigService } from './config.service';

@Injectable()
export class UtilService {
  constructor(private config: ConfigService) {}

  public async passwordEncoding(password: string): Promise<string> {
    const saltOrRounds = this.config.get('bcrypt.salt');
    const passwordHash = await bcrypt.hash(password, saltOrRounds);
    return passwordHash;
  }

  public async passwordCompare(password: string, passwordHash: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, passwordHash);
    return isMatch;
  }

  public async intersection<T>(A: T[], B: T[]): Promise<T[]> {
    return A.filter((x) => B.includes(x));
  }

  public async difference<T>(A: T[], B: T[]): Promise<T[]> {
    return A.filter((x) => !B.includes(x));
  }

  public getWeeksByYear(year: number): { range: string[]; month: number }[] {
    const weeks = [];
    const startDate = new Date(`${year}-01-01`); // 해당 년도의 첫날
    const endDate = new Date(`${year}-12-31`); // 해당 년도의 마지막 날

    // 첫 번째 주 계산: 1월 1일이 속한 주의 마지막 날
    const firstWeekEnd = new Date(startDate);
    firstWeekEnd.setDate(firstWeekEnd.getDate() + (6 - startDate.getDay())); // 주의 마지막 날 계산

    // 첫 번째 주 추가
    weeks.push({
      range: [
        `${String(startDate.getMonth() + 1).padStart(2, '0')}.${String(startDate.getDate()).padStart(2, '0')}`,
        `${String(firstWeekEnd.getMonth() + 1).padStart(2, '0')}.${String(firstWeekEnd.getDate()).padStart(2, '0')}`,
      ],
      month: startDate.getMonth() + 1, // 첫 주는 시작 월 기준
    });

    // 첫 번째 주 이후 계산
    const currentDate = new Date(firstWeekEnd);
    currentDate.setDate(currentDate.getDate() + 1); // 다음 주의 시작 날짜

    while (currentDate <= endDate) {
      // 현재 주의 시작 날짜
      const weekStart = new Date(currentDate);

      // 현재 주의 종료 날짜 (7일 뒤)
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // 주의 종료 날짜가 현재 년도를 넘어가면 조정
      if (weekEnd > endDate) {
        weekEnd.setDate(endDate.getDate());
      }

      // 속하는 월 계산: 시작 날짜와 종료 날짜의 월별 날 수 비교
      const startMonthDays = Math.max(0, 7 - weekEnd.getDay()); // 시작 월에 속한 날 수
      const endMonthDays = Math.min(7, weekEnd.getDay() + 1); // 종료 월에 속한 날 수

      const primaryMonth =
        startMonthDays > endMonthDays ? weekStart.getMonth() + 1 : weekEnd.getMonth() + 1;

      // MM.DD ~ MM.DD 형식 생성
      const weekRange = [
        `${String(weekStart.getMonth() + 1).padStart(2, '0')}.${String(weekStart.getDate()).padStart(2, '0')}`,
        `${String(weekEnd.getMonth() + 1).padStart(2, '0')}.${String(weekEnd.getDate()).padStart(2, '0')}`,
      ];

      // 결과 배열에 추가
      weeks.push({
        range: weekRange,
        month: primaryMonth,
      });

      // 다음 주로 이동
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return weeks;
  }
}
