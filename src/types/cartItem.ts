import { Toy } from "./toy";

export type OrderStatus = 'rezervisano' | 'pristiglo' | 'otkazano';
export type RecesentType = 'dete' | 'roditelj' | null;

export interface UserReview {
  rating: number;
  recesentType: RecesentType;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  toy: Toy;
  quantity: number;
  status: OrderStatus;
  userReview?: UserReview;
  addedAt: string;
}
