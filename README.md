# TFI_CAMPUS_HANYANG_25Spring_REPACT



Backend
- 프레임워크: **FastAPI** – 빠르고 현대적인 Python 웹 프레임워크로 RESTful API 구현
- 라우팅 & 인증: **OAuth2 기반 JWT 인증 시스템** – 사용자 회원가입, 로그인, 권한 검증 처리
- 비즈니스 로직:
  - 회원가입 및 로그인 기능을 통한 사용자 정보 등록
  - 게임 결과 점수 저장 및 불러오기 기능 제공
- 데이터베이스: **SQLite** – 경량화된 로컬 데이터베이스로 사용자 및 점수 정보 저장
- 배포 환경: **AWS Lightsail** – Ubuntu 기반 인스턴스에 FastAPI 서버를 배포하여 외부 접속 개방
- 문서화 도구: **Swagger UI (FastAPI 기본 제공)** – API 명세 자동화 및 테스트 지원


🖥️ Deployment

- **Backend**: **AWS Lightsail** (Ubuntu 인스턴스에 FastAPI 서버 배포 및 포트 개방 설정)  
- AWS Lightsail 인스턴스를 활용해 FastAPI 백엔드 서버를 Ubuntu 환경에 배포  
- Gunicorn + Uvicorn을 사용한 프로덕션 서버 구동  
- 8000번 포트 개방 후, 외부에서 API 접근 가능하도록 설정




```
📁 backend/
├── domain/
│   ├── user_router.py        # 사용자 관련 API 라우터 정의
│   └── user_schema.py        # 사용자 요청/응답 데이터 모델 정의 (Pydantic)
├── migrations/               # Alembic 마이그레이션 파일 디렉토리
├── .gitignore                # Git에 올리지 않을 파일 목록 정의
├── alembic.ini               # Alembic 설정 파일
├── database.py               # SQLite 연결 및 세션 관리 설정
├── main.py                   # FastAPI 앱 실행 진입점
├── models.py                 # SQLAlchemy 기반 DB 모델 정의
├── security.py               # OAuth2, JWT 토큰 관련 인증 로직
├── test.db                   # SQLite 실제 데이터베이스 파일
├── test.sqbpro               # DB 시각화 툴(SQLite Browser 등) 프로젝트 파일
```
