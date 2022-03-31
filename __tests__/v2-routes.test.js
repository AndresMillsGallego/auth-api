'use strict';

const { db } = require('../src/models/index');
const { users, authDb } =  require ('../src/auth/models/index');
const supertest = require('supertest');
const { server } = require('../src/server');

const request = supertest(server);

let testUser;
let testWriter;
let testEditor;
let testAdmin;

beforeAll(async () => {
  await db.sync();
  await authDb.sync();
  testUser = await users.create({username: 'Andres', password: 'Snorlax'});
  testWriter = await users.create({username: 'Ivan', password: 'Meowth', role: 'writer'});
  testEditor = await users.create({username: 'Xander', password: 'Jigglypuff', role: 'editor'});
  testAdmin = await users.create({username: 'Allison', password: 'Pikachu', role: 'admin'});
  await request.post('/api/v2/food').send( {
    name: 'Maracuya',
    calories: 50,
    type: 'fruit',
  }).set('Authorization', `Bearer ${testWriter.token}`);
  
  
});

afterAll(async () => {
  await db.drop();
  await authDb.drop();
});

describe('Testing the v2 RBAC routes.  Only an authenticated user should be allowed access', () => {

  test('Testing the POST route.', async () => {
    let response = await request.post('/api/v2/food').send( {
      name: 'Mango',
      calories: 90,
      type: 'fruit',
    }).set('Authorization', `Bearer ${testWriter.token}`);
    let unauthResponse = await request.post('/api/v2/food').set('Authorization', `Bearer ${testUser.token}` );
    
    expect(response.status).toEqual(201);
    expect(response.body.name).toEqual('Mango');

    expect(unauthResponse.status).toEqual(500);
    expect(unauthResponse.body.message).toEqual('Access Denied');
  });

  test('Testing the GET All route', async () => {
    let response = await request.get('/api/v2/food').set('Authorization', `Bearer ${testUser.token}`);
    let badResponse = await request.get('/api/v2/food').set('Authorization', 'Bearer Token' );

    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(2);
    
    expect(badResponse.status).toEqual(500);
    expect(badResponse.body.message).toEqual('Invalid Login');
  });

  test('Testing the GET ONE route', async () => {
    let response = await request.get('/api/v2/food/1').set('Authorization', `Bearer ${testUser.token}`);
    let badResponse = await request.get('/api/v2/food').set('Authorization', 'Bearer Token' );

    expect(response.status).toEqual(200);
    expect(response.body.name).toEqual('Maracuya');
    expect(response.body.type).toEqual('fruit');
    expect(response.body.calories).toEqual(50);

    expect(badResponse.status).toEqual(500);
    expect(badResponse.body.message).toEqual('Invalid Login');
  });

  test('Testing the PUT route', async () => {
    let response = await request.put('/api/v2/food/1').send({calories: 76}).set('Authorization', `Bearer ${testEditor.token}`);
    let unauthResponse = await request.put('/api/v2/food/1').send({calories: 76}).set('Authorization', `Bearer ${testWriter.token}`);
    
    expect(response.status).toEqual(200);
    expect(response.body.name).toEqual('Maracuya');
    expect(response.body.type).toEqual('fruit');
    expect(response.body.calories).toEqual(76);

    expect(unauthResponse.status).toEqual(500);
    expect(unauthResponse.body.message).toEqual('Access Denied');
  });

  test('Testing the DELETE route', async () => {
    let response = await request.delete('/api/v2/food/1').set('Authorization', `Bearer ${testAdmin.token}`);
    let getResponse = await request.get('/api/v2/food/1').set('Authorization', `Bearer ${testAdmin.token}`);
    let unauthResponse = await request.put('/api/v2/food/1').send({calories: 76}).set('Authorization', `Bearer ${testWriter.token}`);
    console.log(response.body);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(1);

    expect(getResponse.body).toEqual(null);

    expect(unauthResponse.status).toEqual(500);
    expect(unauthResponse.body.message).toEqual('Access Denied');
  });
});