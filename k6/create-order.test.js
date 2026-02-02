import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

// 26.01.30
// 상품 아이디 교체 했고 docker k6 이미지 받았음 이제 서버 실행시켜서 k6 실행시켜보기

// --- 테스트 전 설정이 필요한 부분 ---
// 1. 테스트할 상품 ID를 입력하세요.
const productId = 'cmkb7xcw2000lv6nfpwshbgds';

// 2. 테스트할 상품의 사이즈 ID를 입력하세요.
const sizeId = 2;

// 3. 해당 상품/사이즈의 현재 재고 수량을 입력하세요.
const initialStock = 10;
// --- 설정 끝 ---

// API 서버의 기본 URL
const BASE_URL = 'http://host.docker.internal:3000'; // 필요시 포트 번호 등을 수정하세요.

// 커스텀 카운터 정의
const successfulOrders = new Counter('successful_orders');
const stockErrorOrders = new Counter('stock_error_orders');
const otherErrorOrders = new Counter('other_error_orders');

export const options = {
  // 시나리오: 초기 재고(initialStock)보다 많은 가상 유저(vus)가 동시에 주문
  scenarios: {
    concurrentOrders: {
      executor: 'shared-iterations',
      vus: initialStock + 10, // 재고보다 10명 더 많은 유저가 동시 주문 시도
      iterations: initialStock + 10,
      maxDuration: '30s',
    },
  },
  // 테스트 종료 후 요약 정보에서 확인할 임계값 설정
  thresholds: {
    // 성공한 주문은 초기 재고 수량과 정확히 일치해야 함
    successful_orders: [`count==${initialStock}`],
    // 재고 부족 오류는 (가상 유저 수 - 초기 재고 수량) 만큼 발생해야 함
    stock_error_orders: [`count==${initialStock + 10 - initialStock}`],
    // 그 외 다른 에러는 없어야 함
    other_error_orders: ['count==0'],
  },
};

// 테스트에 사용할 로그인 정보
const loginPayload = JSON.stringify({
  email: 'buyer@codiit.com',
  password: 'test1234',
});

const httpParams = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// 1. 테스트 시작 전, 모든 가상 유저가 공유할 인증 토큰을 미리 발급받습니다.
export function setup() {
  // db 세팅 (결제 대기중인 주문 전부 취소)
  const url = 'http://host.docker.internal:3000/api/test/orders';
  const res1 = http.del(url);
  console.log(`[Setup] DB Cleanup finished. Status: ${res1.status}. Body: ${res1.body}`);

  // 토큰 발급
  const res2 = http.post(`${BASE_URL}/api/auth/login`, loginPayload, httpParams);
  check(res2, { 'login successful': (r) => r.status === 201 });
  const authToken = res2.json('accessToken');
  if (!authToken) {
    throw new Error('Login failed, could not retrieve auth token.');
  }
  return { authToken };
}

// 2. 각 가상 유저가 주문을 시도하는 로직
export default function (data) {
  const { authToken } = data;

  const orderPayload = JSON.stringify({
    name: `TestUser ${__VU}`, // 가상 유저(Virtual User) ID
    phone: '010-1234-5678',
    address: 'Test Address',
    usePoint: 0,
    orderItems: [
      {
        productId: productId,
        sizeId: sizeId,
        quantity: 1,
      },
    ],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  };

  // 주문 생성 API 호출
  const res = http.post(`${BASE_URL}/api/orders`, orderPayload, params);

  // 응답 결과 확인 및 카운터 증가
  const checkResult = check(res, {
    'order created successfully': (r) => r.status === 201,
    'stock error': (r) => r.status === 400 && r.body.includes('재고가 부족합니다'),
  });

  if (res.status === 201) {
    successfulOrders.add(1);
  } else if (res.status === 400 && res.body.includes('재고가 부족합니다')) {
    stockErrorOrders.add(1);
  } else {
    // 예상치 못한 에러가 발생한 경우
    otherErrorOrders.add(1);
    console.error(`Unexpected response: ${res.status} - ${res.body}`);
  }
}
