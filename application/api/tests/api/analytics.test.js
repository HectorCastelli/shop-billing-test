const request = require('supertest');
const api = require('../../src/api');
describe('Check Analytics endpoins', () => {
    it('Get revenue for today.', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Get revenue for a week.', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Fail when getting revenue for last week (lack of data)', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Get best-seller product for today', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Get best-seller product for a week.', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Fail when getting best-seller product for last week (lack of data)', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Get product revenue for today.', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Get product revenue for a week.', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Fail when getting product revenue for last week (lack of data)', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Get a product\'s revenue for today.', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Get a product\'s revenue for a week.', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Fail when getting a product\'s revenue for last week (lack of data)', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Get a product\'s price history', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
});