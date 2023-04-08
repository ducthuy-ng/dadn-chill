import { User } from '../core/domain/User';
import { UserRepo } from '../core/usecases/repos/UserRepo';

export class InMemUserRepo implements UserRepo {
  users = new Map<string, User>();

  constructor() {
    const userThuy = new User(
      'f57d2786-f71c-41ad-aa68-d1ed3abc78ee',
      'Thuy Nguyen',
      'nguyen.thuy@gmail.com',
      '9148cb88:278bad0ac96adb235b60ee9d934d1918bd48de50391ddf413eaf5d6a62c4bc38bafc6ee1c0cffc7e4295527c2d008ce841235f7c546c75c5a1fb2238dacbf3ec'
    );

    this.users.set(userThuy.getId(), userThuy);
  }

  async getById(id: string): Promise<User | null> {
    const searchUser = this.users.get(id);
    if (!searchUser) {
      return null;
    }

    return searchUser;
  }

  async getByEmail(email: string): Promise<User | null> {
    for (const [, user] of this.users) {
      if (user.getEmail() === email) {
        return user;
      }
    }

    return null;
  }
}
