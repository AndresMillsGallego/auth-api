'use strict';

const { db } = require('../src/models/index');
const supertest = require('supertest');
const { server } = require('../src/server');

const request = supertest(server);


beforeAll(async () => {
  await db.sync();
  await request.post('/api/v1/food').send({
    name: 'Maracuya',
    calories: 50,
    type: 'fruit',
  });
 
});

afterAll(async () => {
  await db.drop();
});

describe('Testing the v1 routes', () => {

  test('Testing the POST route', async () => {
    let response = await request.post('/api/v1/food').send( {
      name: 'Mango',
      calories: 90,
      type: 'fruit',
    });

    expect(response.status).toEqual(201);
    expect(response.body.name).toEqual('Mango');
  });

  test('Testing the GET ALL route', async () => {
    let response = await request.get('/api/v1/food');
    
    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(2);
  });

  test('Testing the GET ONE route', async () => {
    let response = await request.get('/api/v1/food/2');
    
    expect(response.status).toEqual(200);
    expect(response.body.name).toEqual('Mango');
  });

  test('Testing the PUT route', async () => {
    let response = await request.put('/api/v1/food/2').send({calories: 105});
    
    expect(response.status).toEqual(200);
    expect(response.body.calories).toEqual(105);
    expect(response.body.name).toEqual('Mango');
  });

  test('Testing the DELETE route', async () => {
    let response = await request.delete('/api/v1/food/2');
    let getResponse = await request.get('/api/v1/food/2');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(1);

    expect(getResponse.body).toEqual(null);
  });
});