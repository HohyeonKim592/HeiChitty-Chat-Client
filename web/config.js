"use strict";

// 빌드 타임 서버 주소 (config-only).
//
// 이 뷰어는 사용자에게 서버 주소를 묻지 않는다. 아래 값으로 자동 접속한다.
// 운영 빌드에서는 이 한 줄을 운영 도메인으로 교체한다(빌드 프로파일별 교체 지점).
//
// 현재 값은 임시 placeholder — 운영 도메인 확정 시 교체(CE3-S1/G-DOM).
// 같은 도메인을 capacitor.config.json 의 allowNavigation 에도 맞춰 좁힐 것.
window.HEICHITTY_SERVER = "http://127.0.0.1:3000";
