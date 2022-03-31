'use strict';

const { authDb } = require('../src/auth/models');
const supertest = require('supertest');
const { server } = require('../src/server');
const base64 = require('base-64');

const request = supertest(server);


beforeAll(async () => {
  await authDb.sync();
});

afterAll(async () => {
  await authDb.drop();
});

describe('Testing our AUTH routes', () => {
  
  test('Testing our POST /signup route', async () => {
    let response = await request.post('/signup').send({username: 'Andres', password: 'word'});
    
    expect(response.status).toEqual(201);
    expect(response.body.user.username).toEqual('Andres');
    expect(response.body.user.password).toBeTruthy();
    expect(response.body.user.role).toEqual('user');
  });

  test('Testing our POST /signin route', async () => {
    let authString = 'Andres:word';
    let encodedString = base64.encode(authString);
    let response = await request.post('/signin').set('Authorization', `Basic ${encodedString}`);
    
    expect(response.status).toEqual(200);
    expect(response.body.user.username).toEqual('Andres');
    expect(response.body.user.password).toBeTruthy();
  });
 
});