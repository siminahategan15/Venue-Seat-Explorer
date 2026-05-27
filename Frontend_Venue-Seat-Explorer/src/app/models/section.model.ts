export interface Section {
  _id: string;
  venueId: string;
  name: string;
  level: 'lower' | 'middle' | 'upper' | 'vip';
  totalRows: number;
  createdAt?: Date;
  updatedAt?: Date;
}
