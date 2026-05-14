export interface Review {
  _id: string;
  seatId: string;
  venueId: string;
  ratingView: number;
  ratingComfort: number;
  userId: string;
  comment?: string;
  isFlagged?: boolean;
  flagReason?: string;
  isDeleted?: boolean;
  deletedReason?: string;
  censoredComment?: {
    original?: string;
    censored?: string;
    reason?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
