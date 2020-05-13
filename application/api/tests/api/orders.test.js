const request = require('supertest');
const api = require('../../src/api');
describe('Check Orders endpoins', () => {
    it('Create a new order', async () => {
        const res = await request(app).post('orders/create').send(
            {

            }
        );
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('order');
    });
    it('Fetch an valid order', async () => {
        const res = await request(app).get('orders/1');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty();
    });
    it('Fail when retrieving an invalid order', async () => {
        const orderId = 1234;
        const res = await request(app).get(`/orders/${orderId}`);
        expect(res.statusCode).toEqual(404);
    });
    it('Add a single product to an order', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Add multiple products to an order', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Fail when adding an invalid product to an order', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Compute the cost of an order', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Process payment to a valid order', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('Process payment to an invalid (already paid for) order', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
    it('', async () => {
        const res = await request(app).verb().send({});
        expect(res.statusCode).toEqual();
        expect(res.body).toHaveProperty();
    });
});