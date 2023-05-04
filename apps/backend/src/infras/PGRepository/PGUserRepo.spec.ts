import { Pool } from 'pg';
import { PGRepository } from '.';
import { UserRepo } from '../../core/usecases/repos/UserRepo';
import { BSLogger } from '../BSLogger';

describe('Test PG UserRepo', () => {
  let userRepo: UserRepo;
  let pgRepo: PGRepository;
  const PgConnString = 'postgresql://backend:password@localhost:5432/backend';

  const dummyLogger = new BSLogger('test logger', { target: '' });
  beforeAll(async () => {
    pgRepo = new PGRepository(
      { host: 'localhost', user: 'backend', password: 'password', database: 'backend' },
      dummyLogger
    );
    userRepo = pgRepo;
  });

  afterAll(async () => {
    await pgRepo.disconnect();
    const pool = new Pool({ connectionString: PgConnString });
    await pool.query("SELECT setval('id_sequence', 7, false)");
    await pool.end();
  });

  it('should return a valid user if get existing by ID', async () => {
    const userThuy = await userRepo.getByUserId('f57d2786-f71c-41ad-aa68-d1ed3abc78ee');
    expect(userThuy).not.toBeNull();
    expect(userThuy).toHaveProperty('name', 'Thuy Nguyen');
    expect(userThuy).toHaveProperty('email', 'nguyen.thuy@gmail.com');
    expect(userThuy).toHaveProperty(
      'hashedPassword',
      '9148cb88:278bad0ac96adb235b60ee9d934d1918bd48de50391ddf413eaf5d6a62c4bc38bafc6ee1c0cffc7e4295527c2d008ce841235f7c546c75c5a1fb2238dacbf3ec'
    );
  });

  it('should return null when get non existing user by ID ', async () => {
    const userThuy = await userRepo.getByUserId('11111111-1111-1111-1111-11111111');
    expect(userThuy).toBeNull();
  });

  it('should return a valid user if get existing by email', async () => {
    const userThuy = await userRepo.getByEmail('nguyen.thuy@gmail.com');
    expect(userThuy).not.toBeNull();
    expect(userThuy).toHaveProperty('name', 'Thuy Nguyen');
    expect(userThuy).toHaveProperty('id', 'f57d2786-f71c-41ad-aa68-d1ed3abc78ee');
    expect(userThuy).toHaveProperty(
      'hashedPassword',
      '9148cb88:278bad0ac96adb235b60ee9d934d1918bd48de50391ddf413eaf5d6a62c4bc38bafc6ee1c0cffc7e4295527c2d008ce841235f7c546c75c5a1fb2238dacbf3ec'
    );
  });

  it('should return a valid user if get existing by email', async () => {
    const userThuy = await userRepo.getByEmail('nguyen.thuy2@gmail.com');
    expect(userThuy).toBeNull();
  });
});
