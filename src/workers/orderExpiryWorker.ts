import { redisClient } from '@/config/redis.js';
import { logger } from '@/config/logger.js';
import { orderService } from '@/domains/order/order.container.js';

const QUEUE_KEY = 'order_expire_queue';

export async function startOrderExpiryWorker() {
  logger.info('👷 주문 만료 처리 워커가 시작되었습니다. (1초 간격 감시)');

  // 1초마다 반복
  setInterval(async () => {
    try {
      const now = Date.now(); // 현재 시간 (밀리초)

      // 1. 만료된 주문 조회
      // ZRANGEBYSCORE key min max
      const expiredOrderIds = await redisClient.zrangebyscore(QUEUE_KEY, 0, now);

      if (expiredOrderIds.length > 0) {
        logger.info(`🚨 만료된 주문 발견! ID: ${expiredOrderIds.join(', ')}`);

        // 2. 루프 돌면서 하나씩 DB에서 취소 처리
        for (const orderId of expiredOrderIds) {
          try {
            // DB 트랜잭션으로 안전하게 원복
            await orderService.expireWaitingOrder(orderId);
            // 3. 처리가 끝났으니 Redis 명단에서 제거
            await redisClient.zrem(QUEUE_KEY, orderId);
          } catch (e) {
            logger.error(`❌ 주문 ${orderId}처리 중 에러: ${e}`);
          }
        }
      }
    } catch (e) {
      logger.error(`❌ 워커 에러 발생: ${e}`);
      // 에러가 나도 다음 1초 뒤에 다시 시도하므로 안전함
    }
  }, 1000); // 1000ms
}

startOrderExpiryWorker();
