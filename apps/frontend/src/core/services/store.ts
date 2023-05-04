import { atom } from 'jotai';
import User from '../domain/User';

export const sidebar = atom<boolean>(false);

export const userLogin = atom<User>({
  id: '',
  name: '',
  email: '',
});

export const getToken = atom(
  (get) => get(userLogin).id,
  (get, set, token) => {
    // `update` is any single value we receive for updating this atom
    set(userLogin, { ...get(userLogin), id: token } as User);
  }
);
