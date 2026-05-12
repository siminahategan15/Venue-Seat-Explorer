export interface User {
  _id: string;
  firebaseUid: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
  role: 'admin' | 'user';
}
