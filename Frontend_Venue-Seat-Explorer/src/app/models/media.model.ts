export interface Media {
  _id: string;
  seatId: string;
  venueId: string;
  userId: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
  uploadedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
