export interface Seat {
  _id: string;
  venueId: string;
  sectionId: string;
  row: number;
  seatNumber: number;
  x?: number;
  y?: number;
  createdAt?: string;
  updatedAt?: string;
}
