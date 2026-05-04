export interface User {
  _id: string;
  username: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  createdAt?: string;
  updatedAt?: string;
}
