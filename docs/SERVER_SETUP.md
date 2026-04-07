# City Evolution Simulator 서버 실행 가이드

## 1. 로컬 실행 방법

### 프론트엔드
1. 터미널에서 `frontend` 폴더로 이동
```bash
cd /home/superdragon/city-evolution-simulator/frontend
```
2. 의존성 설치
```bash
npm install
```
3. 개발 서버 실행
```bash
npm run dev
```

### 백엔드
1. 다른 터미널에서 `backend` 폴더로 이동
```bash
cd /home/superdragon/city-evolution-simulator/backend
```
2. 의존성 설치
```bash
npm install
```
3. 서버 실행
```bash
npm start
```

## 2. 로컬 접속 주소
- 프론트엔드: `http://localhost:5173`
- 백엔드: `http://localhost:3100`
- 헬스체크: `http://localhost:3100/api/health`

## 3. 리더보드 데이터 저장 방식
- 백엔드는 결과를 SQLite로 저장합니다.
- DB 파일 위치: `backend/data/leaderboard.db`
- 기존 JSON 파일(`backend/data/leaderboard.json`)이 있으면 서버 시작 시 마이그레이션됩니다.

## 4. 배포 시 수정할 항목
- 프론트 API 주소 설정(`frontend/main.js`)
- 현재 로컬 기본값:
```js
const API_BASE_URL = "http://localhost:3100";
```
- 배포 시 예시:
```js
const API_BASE_URL = "https://your-domain.com";
```

## 5. 배포 준비 체크리스트
- 도메인 연결 여부
- 리버스 프록시 설정(`/` 프론트, `/api` 백엔드)
- 백엔드 프로세스 매니저(PM2 등) 적용
- 환경별 포트/CORS/API 주소 확인

## 6. Render 배포(선택)
이 저장소에는 루트 `render.yaml`이 포함되어 있습니다.

- 백엔드 서비스: `backend/`, 헬스체크 `/api/health`
- 프론트 서비스: `frontend/`, 빌드 결과 `dist`, SPA rewrite `/* -> /index.html`

### 배포 절차
1. `render.yaml`을 포함해 Git 원격 저장소에 푸시
2. Render Blueprint 열기
   - `https://dashboard.render.com/blueprint/new?repo=<YOUR_HTTPS_REPO_URL>`
3. Dashboard에서 **Apply**
4. 배포 후 주소 확인
   - 백엔드: `https://<api-service>.onrender.com/api/health`
   - 프론트: `https://<frontend-service>.onrender.com`

## 7. 프론트 API 주소 결정 우선순위
1. `VITE_API_BASE_URL` (빌드 타임)
2. `window.CITY_API_BASE_URL`
3. `localStorage.CITY_API_BASE_URL`
4. 로컬 fallback (`http://localhost:3100`, localhost에서만)
