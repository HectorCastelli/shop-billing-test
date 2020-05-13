const request = require('supertest');
const api = require('../../src/api');
describe('General Check on API status', () => {
    it('should be running', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('healthy', 'true');
    });
});