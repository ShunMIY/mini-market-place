import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Orders (e2e)', () => {
  let app: INestApplication;
  let itemId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates item', async () => {
    const res = await request(app.getHttpServer())
      .post('/items')
      .send({ name: 'Apple', price: 100, stock: 2 })
      .expect(201);

    itemId = res.body.id;
  });

  it('creates order', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({
        items: [{ itemId, quantity: 2 }],
      })
      .expect(201);
  });

  it('fails when out of stock', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({
        items: [{ itemId, quantity: 1 }],
      })
      .expect(409);
  });
});
