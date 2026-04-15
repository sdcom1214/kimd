# City Evolution Simulator

도시 정책 선택을 통해 도시 지표를 변화시키는 Vite + Express 프로젝트입니다.

- 프런트엔드: `frontend/`
- 백엔드: `backend/`
- 배포 경로 계약: 프런트 `/`, 백엔드 `/_/backend`

상세 실행 및 배포 방법은 `docs/SERVER_SETUP.md`를 참고하세요.

## 패치 노트

### v1.0.0 (2026-04-15)

#### 보안 / 안정성
- XSS 대응 강화를 위해 주요 UI 렌더링 경로를 문자열 `innerHTML` 템플릿에서 DOM API(`createElement`, `textContent`) 기반으로 개선했습니다.
- 백엔드 결과 저장 시 `playerName`, `cityType`를 정규화(sanitize)하도록 보강하고, `cityType` 길이 제한(최대 80자)을 추가했습니다.
- API 응답에 기본 보안 헤더(`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`)를 적용했습니다.

#### 성능 / 운영
- 리더보드 캐시를 `limit` 파라미터별 캐시로 분리해 서로 다른 조회 크기 간 캐시 오염을 방지했습니다.
- 캐시 키 상한 및 만료 정리(prune) 로직을 추가해 장기 실행 시 메모리 증가를 완화했습니다.
- Firestore 기반 rate limit 실패 시 in-memory fallback 제한을 적용하도록 보완해 장애 상황에서도 기본 보호가 유지되도록 했습니다.
