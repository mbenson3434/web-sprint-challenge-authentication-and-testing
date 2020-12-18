const request = require("supertest");
const server = require("./server");
const db = require("../data/dbConfig");

test('sanity', () => {
  expect(true).toBe(true)
})

let user1 = { username: "megmeg", password: "password" }
let user2 = { username: "meghann", password: "passpass" }

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
afterAll(async (done) => {
  await db.destroy()
  done()
})

describe("Server.js tests", () => {

  describe("Register", () => {
    beforeEach(async () => {
      await db('users').truncate();
    });
    it("Returns 201 on success", async () => {
      const res = await request(server).post("/api/auth/register").send(user1);
      expect(res.status).toBe(201);
    });
    it('Returns new user info', async () => {
      const res = await request(server).post("/api/auth/register").send(user2);
      expect(res.body.username).toBe(user2.username);
    });
  });

  describe('Login', () => {
    beforeEach(async () => {
      await db('users').truncate();
      await request(server).post('/api/auth/register').send(user1);
    });
    it('Returns 200 on success', async () => {
      const res = await request(server).post("/api/auth/login").send(user1);
      expect(res.status).toBe(200);
    });
    it('Returns token', async () => {
      const res = await request(server).post("/api/auth/login").send(user1);
      const keys = Object.keys(res.body);
      expect(keys).toContain("token");
    });
  });

  describe('Get jokes', () => {
    beforeEach(async () => {
      await db('users').truncate();
      await request(server).post('/api/auth/register').send(user2);
    });
    it('Returns 200 on success', async () => {
      const { body: { token } } = await request(server).post('/api/auth/login').send(user2)
      const res = await request(server).get("/api/jokes").set("Authorization", token)
      expect(res.status).toBe(200);
    });
    it('Returns jokes array as truthy', async () => {
      const { body: { token } } = await request(server).post('/api/auth/login').send(user2)
      const res = await request(server).get("/api/jokes").set("Authorization", token);
      expect(res.body).toBeTruthy();
    });
  });
});