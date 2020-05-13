const request = require("supertest");
const api = require("../../src/api");
const baseUrl = "/analytics/";

describe("Check Analytics endpoints", () => {
  it("Get revenue for today.", async () => {
    const today = new Date();
    const res = await request(api)
      .get(baseUrl + "orders/revenue")
      .query({ from: today });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("totalRevenue");
  });
  it("Get revenue for a week.", async () => {
    const today = new Date();
    const sevenDaysAgo = today.setDate(today.getDate() - 7);
    const res = await request(api)
      .get(baseUrl + "orders/revenue")
      .query({ from: sevenDaysAgo, to: today });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("totalRevenue");
  });
  it("Fail when getting revenue for last week (lack of data)", async () => {
    const today = new Date();
    const sevenDaysAgo = today.setDate(today.getDate() - 7);
    const fourteenDaysAgo = today.setDate(today.getDate() - 14);
    const res = await request(api)
      .get(baseUrl + "orders/revenue")
      .query({ from: fourteenDaysAgo, to: sevenDaysAgo });
    expect(res.statusCode).toEqual(404);
  });
  it("Get best-seller product for today", async () => {
    const today = new Date();
    const res = await request(api)
      .get(baseUrl + "products/bestSeller")
      .query({ from: today });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("products");
  });
  it("Get best-seller product for a week.", async () => {
    const today = new Date();
    const sevenDaysAgo = today.setDate(today.getDate() - 7);
    const res = await request(api)
      .get(baseUrl + "products/bestSeller")
      .query({ from: sevenDaysAgo, to: today });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("products");
  });
  it("Fail when getting best-seller product for last week (lack of data)", async () => {
    const today = new Date();
    const sevenDaysAgo = today.setDate(today.getDate() - 7);
    const fourteenDaysAgo = today.setDate(today.getDate() - 14);
    const res = await request(api)
      .get(baseUrl + "products/bestSeller")
      .query({ from: fourteenDaysAgo, to: sevenDaysAgo });
      expect(res.statusCode).toEqual(404);
  });
  it("Get products revenue for today.", async () => {
    const today = new Date();
    const res = await request(api)
      .get(baseUrl + "products/revenue")
      .query({ from: today });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("totalRevenue");
  });
  it("Get products revenue for a week.", async () => {
    const today = new Date();
    const sevenDaysAgo = today.setDate(today.getDate() - 7);
    const res = await request(api)
      .get(baseUrl + "products/revenue")
      .query({ from: sevenDaysAgo, to: today });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("totalRevenue");
  });
  it("Fail when getting products revenue for last week (lack of data)", async () => {
    const today = new Date();
    const sevenDaysAgo = today.setDate(today.getDate() - 7);
    const fourteenDaysAgo = today.setDate(today.getDate() - 14);
    const res = await request(api)
      .get(baseUrl + "products/revenue")
      .query({ from: fourteenDaysAgo, to: sevenDaysAgo });
      expect(res.statusCode).toEqual(404);
  });
  it("Get a product's revenue for today.", async () => {
    const today = new Date();
    const res = await request(api)
      .get(baseUrl + "products/product/1/revenue")
      .query({ from: today });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("totalRevenue");
  });
  it("Get a product's revenue for a week.", async () => {
    const today = new Date();
    const sevenDaysAgo = today.setDate(today.getDate() - 7);
    const res = await request(api)
      .get(baseUrl + "products/product/1/revenue")
      .query({ from: sevenDaysAgo, to: today });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("totalRevenue");
  });
  it("Fail when getting a product's revenue for last week (lack of data)", async () => {
    const today = new Date();
    const sevenDaysAgo = today.setDate(today.getDate() - 7);
    const fourteenDaysAgo = today.setDate(today.getDate() - 14);
    const res = await request(api)
      .get(baseUrl + "products/product/1/revenue")
      .query({ from: fourteenDaysAgo, to: sevenDaysAgo });
      expect(res.statusCode).toEqual(404);
  });
  it("Get a product's price history", async () => {
    const res = await request(api).get(baseUrl + "products/product/1/priceHistory");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('history');
  });
});
