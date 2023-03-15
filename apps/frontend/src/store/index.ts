import { atom } from 'jotai';

export const sidebar = atom<boolean>(false);
export const showSidebar = atom(
  (get) => get(sidebar)
);
