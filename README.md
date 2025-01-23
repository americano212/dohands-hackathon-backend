# ✋ HandsUp(핸즈업) Backend Repository
🌐 Landing Page 주소: https://www.blaybus.com/activities/407/landing

📃 Swagger 주소: https://dohands.dongjun.me/docs

2025 Blaybus 실전 앱 개발 경진대회 우수상 & 베스트 팀워크상 수상 🏆

## 💻 프로젝트 소개
**핸즈업**은 '두핸즈 구성원의 성과관리를 위한 사내 게이미피케이션 앱 개발'이라는 주제 하에 두핸즈 구성원들이 직장에서의 성취를 기반으로 일의 즐거움을 느끼고 동기부여를 받을 수 있도록 사내 성과를 가시화하여 보여줄 수 있는 앱 서비스입니다.


## 🔧 요구 기능
이미지

## 🏃‍♂️ Challenge
1. 주최 측의 요구사항으로 웹/앱으로 된 관리자 페이지 대신, 기존에 사용하던 Google Spread Sheet와 연동 되어야했음.
   - 별도의 DB를 유지하면서 Google Spread Sheet와 동기화 유지를 위해서, 데이터 일관성에 대한 고민을 많이하게 되었습니다.
   - 여러명의 관리자가 Spread Sheet을 조작하거나, 조작하는 도중에 DB의 트랜잭션이 진행되는 등 여러 Use Case에 대해 고민해보고, 적절한 트랜잭션과 Lock을 사용하기 위해 노력했습니다.
2. 새로운 게시물, 경험치/뱃지 획득 상황에 유저에게 push 알림을 보내기 위해서 FCM(Firebase Cloud Messaging)을 도입함.
   - 개인/다수에게 알림을 보내는 상황에서 메시지 전송 종류(단일/다중/주제)를 선택하는 상황이 있었는데, 사내 앱의 특성을 감안하여 대략적인 유저수를 산정하고, 전송속도와 limit을 고려하여 FCM 로직을 설계하였습니다.
3. 프론트엔드 개발자와 온라인으로 비동기 협업을 하는 상황에서 원활한 의사소통이 필요했음.
   - Swagger로 API Documnet를 만들고, 예시 response를 볼 수 있도록 DTO level에서 ApiProperty를 적용하였으며, 이 과정에서 코드의 중복이나 품질 저하가 없도록 'Mapped types'을 활용하였습니다.
   - 프론트 입장에서 API를 원활하게 parsing 할 수 있도록 response format을 통일시키고, HttpCode를 적극 활용하였습니다.
   - Test용 API를 관리자용으로 제공하여 프론트엔드가 개발시에 직접 DB에 접속해서 데이터를 세팅할 필요 없도록 지원하였습니다.


## 🔗 연결된 프로젝트
프론트엔드(AOS) Github: https://github.com/SANDY-9/Project_Handsup

## 🔨 Dev Guide
### Boilorplate
Fork from https://github.com/americano212/nestjs-rest-api-templete

### ⚙ Dev Environment
- `Typescript: 5.7.2`
- `Nest: 10.4.9`
- `TypeORM: 0.3.20`
- **Database**: MySQL Community(v8.0.33)
- **Infra Structure**: Amazon Web Service (managed by Terraform)
- **CI/CD**: CI/CD with `github action` & Packages managed by `depandabot`
- **Monitoring**: `Sentry`, `Slack`

### Cloud Architecture
이미지
