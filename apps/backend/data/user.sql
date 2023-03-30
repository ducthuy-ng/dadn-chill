CREATE SCHEMA IF NOT EXISTS data_pipeline;

CREATE TABLE IF NOT EXISTS data_pipeline.user (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  hashedPassword VARCHAR(161) -- Salt=32, Hashed=128, ':'=1
);

-- All password are default: 'password'
-- > let key1 = scryptSync('password', '9148cb88', 64)
INSERT INTO
  data_pipeline.user (id, name, email, hashedPassword)
VALUES
  (
    '0e5e2f86-93dc-4e56-8b12-9517966c43a7',
    'Nhu Phan',
    'nhu.phan@gmail.com',
    '9148cb88:278bad0ac96adb235b60ee9d934d1918bd48de50391ddf413eaf5d6a62c4bc38bafc6ee1c0cffc7e4295527c2d008ce841235f7c546c75c5a1fb2238dacbf3ec'
  ),
  (
    '5fdf0b3a-c3c9-426e-be8e-4f14d324f1d5',
    'Thang Trinh',
    'thang.trinh@gmail.com',
    '9148cb88:278bad0ac96adb235b60ee9d934d1918bd48de50391ddf413eaf5d6a62c4bc38bafc6ee1c0cffc7e4295527c2d008ce841235f7c546c75c5a1fb2238dacbf3ec'
  ),
  (
    '015904e2-51d0-4d3e-946c-77a7201ed02e',
    'Kiet Tran',
    'kiet.tran@gmail.com',
    '9148cb88:278bad0ac96adb235b60ee9d934d1918bd48de50391ddf413eaf5d6a62c4bc38bafc6ee1c0cffc7e4295527c2d008ce841235f7c546c75c5a1fb2238dacbf3ec'
  ),
  (
    'f57d2786-f71c-41ad-aa68-d1ed3abc78ee',
    'Thuy Nguyen',
    'nguyen.thuy@gmail.com',
    '9148cb88:278bad0ac96adb235b60ee9d934d1918bd48de50391ddf413eaf5d6a62c4bc38bafc6ee1c0cffc7e4295527c2d008ce841235f7c546c75c5a1fb2238dacbf3ec'
  )
