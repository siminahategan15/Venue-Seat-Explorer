export interface Section {
  _id: string;
  venueId: string;
  name: string;
  rows: number;
  seatsPerRow: number;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
