import { Request, Response, NextFunction } from 'express';
import { UserType } from '@prisma/client';

// 테스트 및 개발 목적으로 req.user 객체를 주입하는 임시 미들웨어
const MOCK_USER_ID = 'cmis6gtxu0000uyo9xtdf3vhg';

const MOCK_USER = {
  id: MOCK_USER_ID,
  name: '테스트 사용자',
  password: 'testpassword',
  email: 'test@test.com',
  type: UserType.BUYER,
  point: 1000,
  createdAt: new Date(),
  updatedAt: new Date(),
  gradeId: 'BRONZE',
  image: null,
};

export const mockAuthMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  req.user = MOCK_USER;
  console.log(`[Mock Auth] 사용자 ID ${MOCK_USER_ID} 주입 완료.`);
  next();
};

// user가 개발이 되기 전에 기능 테스트를 하기 위래 만든 임시 미들웨어입니다.
// user가 만들어 지면 지워야 합니다.
