export interface Seat {
  _id: string;
  venueId: string;
  sectionId?: string;
  row: string;
  seatNumber: string;
  section?: string;
  category?: string;
  x?: number;
  y?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
