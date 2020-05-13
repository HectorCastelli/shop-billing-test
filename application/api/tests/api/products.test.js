const request = require('supertest');
const api = require('../../src/api');
describe('Check Products endpoins', () => {
    it('Create a new unit-based product', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Create a new weight-based product', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Fail when creating an invalid product', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Fail when creating an already existing product', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty();
    });
    it('Update the price of a product', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Remove a product from circulation', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Search a product by its name', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Search a product by a price range', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('List all products when no search parameters are present', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
});