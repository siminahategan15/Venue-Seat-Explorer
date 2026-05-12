export interface Media {
  _id: string;
  seatId: string;
  venueId: string;
  userId: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
  uploadedBy?: string;
  isFlagged?: boolean;
  flagReason?: string;
  isDeleted?: boolean;
  deletedReason?: string;
  viewCount?: number;
  helpfulCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
