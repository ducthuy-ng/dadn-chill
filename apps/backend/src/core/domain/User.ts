import { randomUUID } from 'crypto';

class User {
  private id: string;
  private name: string;
  private email: string;
  private hashedPassword: string;

  constructor(name: string, email: string, hashedPassword: string) {
    this.id = randomUUID();
    this.name = name;
    this.email = email;
    this.hashedPassword = hashedPassword;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getHashedPassword(): string {
    return this.hashedPassword;
  }

  getEmail(): string {
    return this.email;
  }

  updatePassword(newHashedPassword: string) {
    this.hashedPassword = newHashedPassword;
  }
}

export { User };
