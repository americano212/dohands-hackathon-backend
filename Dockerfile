# Node.js 베이스 이미지
FROM node:20

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스코드 복사
COPY . .

# 빌드된 코드만 실행 (dist/ 디렉토리 포함)
RUN npm run build

# 실행 시 사용하는 포트
EXPOSE 8081

# 실행 명령어
CMD ["node", "dist/src/main"]
