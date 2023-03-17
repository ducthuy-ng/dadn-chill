import { User } from '../../domain/User';

export interface UserRepo {
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
}

export class UserNotFound implements Error {
  name: 'UserNotFound';
  message: 'User is missing or search field is incorrect';
}
