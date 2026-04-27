import { UserType } from '@/types';
import { storage } from './storage';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export const authService = {
  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; msg?: string }> => {
    const users = (await storage.get<StoredUser[]>(USERS_KEY)) ?? [];
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return { success: false, msg: 'Ya existe una cuenta con ese correo.' };

    const newUser: StoredUser = {
      id: Date.now().toString(),
      name,
      email: email.toLowerCase(),
      password,
    };
    await storage.set(USERS_KEY, [...users, newUser]);
    const session: UserType = { uid: newUser.id, name: newUser.name, email: newUser.email };
    await storage.set(CURRENT_USER_KEY, session);
    return { success: true };
  },

  login: async (
    email: string,
    password: string
  ): Promise<{ success: boolean; msg?: string }> => {
    const users = (await storage.get<StoredUser[]>(USERS_KEY)) ?? [];
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) return { success: false, msg: 'Correo o contraseña incorrectos.' };

    const session: UserType = { uid: user.id, name: user.name, email: user.email };
    await storage.set(CURRENT_USER_KEY, session);
    return { success: true };
  },

  logout: async (): Promise<void> => {
    await storage.remove(CURRENT_USER_KEY);
  },

  getSession: async (): Promise<UserType> => {
    return await storage.get<UserType>(CURRENT_USER_KEY);
  },
};
