import { atom } from 'jotai';
import User from '../domain/User';

export const sidebar = atom<boolean>(false);

export const userLogin = atom<User>({
  id: !localStorage.getItem('accessToken') ? '' : (localStorage.getItem('accessToken') as string),
  name: '',
  email: !localStorage.getItem('email') ? '' : (localStorage.getItem('email') as string),
});

export const getUser = atom(
  (get) => {
    if (get(userLogin).id) return get(userLogin);
    const token = !localStorage.getItem('accessToken')
      ? ''
      : (localStorage.getItem('accessToken') as string);
    const email = !localStorage.getItem('email') ? '' : (localStorage.getItem('email') as string);
    return { ...get(userLogin), id: token, email: email } as User;
  },
  (get, set, update: User) => {
    // `update` is any single value we receive for updating this atom
    localStorage.setItem('accessToken', update.id);
    localStorage.setItem('email', update.email);
    set(userLogin, update);
  }
);
