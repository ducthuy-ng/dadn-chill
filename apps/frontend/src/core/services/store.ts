import { atom } from 'jotai';
import User from '../domain/User';

export const sidebar = atom<boolean>(false);

export const userLogin = atom<User>({
  id: !sessionStorage.getItem('accessToken')
    ? ''
    : (sessionStorage.getItem('accessToken') as string),
  name: '',
  email: !sessionStorage.getItem('email') ? '' : (sessionStorage.getItem('email') as string),
});

export const getUser = atom(
  (get) => {
    if (get(userLogin).id) return get(userLogin);
    const token = !sessionStorage.getItem('accessToken')
      ? ''
      : (sessionStorage.getItem('accessToken') as string);
    const email = !sessionStorage.getItem('email')
      ? ''
      : (sessionStorage.getItem('email') as string);
    return { ...get(userLogin), id: token, email: email } as User;
  },
  (get, set, update: User) => {
    // `update` is any single value we receive for updating this atom
    sessionStorage.setItem('accessToken', update.id);
    sessionStorage.setItem('email', update.email);
    set(userLogin, update);
  }
);
