import { SizeRawData, SizeResponse } from '@/domains/cart/cart.type.js';
import { CreateOrderItemBody } from '@/domains/order/order.schema.js';

// 주문 베이스
export interface OrderBase<TDate> {
  id: string;
  name: string;
  phoneNumber: string;
  address: string;
  subtotal: number;
  totalQuantity: number;
  usePoint: number;
  createdAt: TDate;
}
// 주문 아이템 베이스
export interface OrderItemBase {
  id: string;
  price: number;
  quantity: number;
  productId: string;
}

export interface ProductBase {
  name: string;
  image: string;
}

export interface ReviewBase<TDate> {
  id: string;
  rating: number;
  content: string;
  createdAt: TDate;
}

export type ProductRawData = ProductBase;

export interface ProductResponse extends ProductBase {
  reviews: ReviewResponse[];
}

export type ReviewRawData = ReviewBase<Date>;

export type ReviewResponse = ReviewBase<string>;

interface OrderItemsReviewResponse {
  isReviewed: boolean;
}

export type OrderItemSizeResponse = Omit<SizeResponse, 'name'>;

export interface CreateOrderItemInputWithPrice extends CreateOrderItemBody {
  price: number;
}

interface GetOrderItemBase<TProduct, TSize> extends OrderItemBase {
  product: TProduct;
  size: TSize;
}

// db 조회 결과 RawData type
export interface GetOrderItemRawData extends GetOrderItemBase<ProductRawData, SizeRawData> {
  review: ReviewRawData | null;
}

// response 응답용 data type
export interface GetOrderItemResponseData
  extends GetOrderItemBase<ProductResponse, OrderItemSizeResponse>, OrderItemsReviewResponse {}
