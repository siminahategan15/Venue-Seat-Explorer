export interface Venue {
  _id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  capacity: number;
  imageUrl?: string;
  adminId: string; // MongoDB id
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    placeId?: string;
  };
  categories?: string[];
  amenities?: string[];
  phone?: string;
  website?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
