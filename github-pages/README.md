# GitHub Pages 배포 안내

이 폴더는 GitHub Pages 배포 관련 설정과 운영 메모를 관리합니다.

## 포함 항목
- GitHub Actions 워크플로우: `.github/workflows/deploy-pages.yml`
- 프론트엔드 빌드 대상: `frontend/`

## 배포 흐름
1. `main` 브랜치에 푸시
2. Actions가 `frontend`를 빌드
3. 빌드 결과물(`frontend/dist`)을 GitHub Pages에 배포

## 최초 1회 설정
1. GitHub 저장소 `Settings > Pages` 이동
2. `Build and deployment`를 `GitHub Actions`로 선택

## API 서버 주소 설정
GitHub Pages는 정적 호스팅이므로 백엔드는 별도 서버가 필요합니다.

- 로컬 개발: 자동으로 `http://localhost:3100` 사용
- 배포 환경: 브라우저 콘솔에서 1회 설정

```js
localStorage.setItem("CITY_API_BASE_URL", "https://your-backend-domain.com");
location.reload();
```

설정 해제:

```js
localStorage.removeItem("CITY_API_BASE_URL");
location.reload();
```
