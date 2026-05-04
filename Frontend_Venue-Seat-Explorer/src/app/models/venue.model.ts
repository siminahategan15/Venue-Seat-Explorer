export interface Venue {
  _id: string;
  name: string;
  city: string;
  country: string;
  description?: string;
  capacity: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
