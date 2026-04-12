# City Evolution Simulator 서버/배포 가이드

## 1. 필수 환경변수

- `DATABASE_URL`
  - 배포 가능한 외부 Postgres 연결 문자열
  - `DATABASE_URL`가 없으면 백엔드가 시작되지 않습니다.
- `RESET_PASSWORD`
  - 리더보드 초기화 API 비밀번호
  - 값이 없으면 `/api/reset`은 비활성화됩니다.
- `VITE_API_BASE_URL`
  - 프런트가 다른 API 주소를 바라봐야 할 때만 사용
  - 로컬 기본값은 `http://localhost:3100`
  - 배포 기본값은 `/_/backend`

예시는 루트 `.env.example`에 있습니다.

## 2. 로컬 실행

### 백엔드
```bash
cd backend
npm install
npm start
```

- 기본 주소: `http://localhost:3100`
- 헬스체크: `http://localhost:3100/api/health`

### 프런트엔드
```bash
cd frontend
npm install
npm run dev
```

- 기본 주소: `http://localhost:5173`

## 3. 저장 방식

- 리더보드는 JSON/SQLite 파일이 아니라 Postgres에 저장됩니다.
- 백엔드 시작 시 필요한 테이블과 인덱스를 자동 생성합니다.
- Vercel 재배포 후에도 데이터가 유지되도록 파일 시스템 의존성을 제거했습니다.

## 4. Vercel 배포

- `vercel.json`은 프런트 `/`, 백엔드 `/_/backend` 라우팅을 유지합니다.
- 배포 전 Vercel 프로젝트 환경변수에 아래 값을 설정합니다.
  - `DATABASE_URL`
  - `RESET_PASSWORD`
- 공개 배포 점검 경로
  - 앱: `https://<your-app>.vercel.app/`
  - 헬스체크: `https://<your-app>.vercel.app/_/backend/api/health`

## 5. Git 저장소 정책

- `node_modules`, `dist`, 로컬 데이터 파일, `.vercel` 디렉터리는 커밋하지 않습니다.
- 새 환경에서는 clone 후 각 디렉터리에서 `npm install`로 의존성을 다시 설치합니다.
