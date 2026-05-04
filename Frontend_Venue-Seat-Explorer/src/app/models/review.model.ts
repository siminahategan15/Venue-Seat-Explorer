export interface Review {
  _id: string;
  seatId: string;
  ratingView: number;
  ratingComfort: number;
  userId: string;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}
