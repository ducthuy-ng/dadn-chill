import User from '../domain/User';
import { http } from './httpClient';

export const loginUser = async (credentials: User) => {
  return await http.post<User, string>('/auth/login', credentials);
};
