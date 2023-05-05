import { randomUUID, scryptSync } from 'crypto';
import { DomainRegistry } from '../../infras/DomainRegistry';

export class InvalidCredential {}

export class LoginUseCase {
  public domainRegistry: DomainRegistry;
  constructor(domainRegistry: DomainRegistry) {
    this.domainRegistry = domainRegistry;
  }

  async execute(email: string, password: string): Promise<string> {
    const userRepo = this.domainRegistry.userRepo;

    try {
      const user = await userRepo.getByEmail(email);
      if (!user) {
        return '';
      }

      const [salt, hashedStoredPassword] = user.getHashedPassword().split(':');

      const inputHashedPassword = scryptSync(password, salt, 64);
      const inputHexPassword = inputHashedPassword.toString('hex');

      if (!(inputHexPassword === hashedStoredPassword)) {
        return '';
      }

      return randomUUID();
    } catch (err) {
      return '';
    }
  }
}
