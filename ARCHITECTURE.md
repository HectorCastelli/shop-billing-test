# Architecture

## First decisions

The first set of decisions were:

- Use Express.js instead of Nest.JS due to:
  - Nest.JS does a lot for you, reducing the surface area of decisions I can make to showcase my own skills;
  - Express.js is commonly-used and very simple;
- Use Jest.js for testing instead of Cypress.io due to pricing limitations.
- Use Docker Compose with:
  - One container with Node.js and the API;
  - One container with MySQL;
  - Shared ENV file for easy configuration;

This repository will be organized to have separate folders for the API code and the Database information.

On the API section, the source code, as well as helper scripts will be included.

On the Database section, initialization scripts will be included.

## Planning the API

Before getting started with code, it's important to know what functionality we want to support. This way, we can plan our data structure accordingly.

- Orders
  - Create new order
  - Add Products to order
  - Remove Products from order
  - Get total price of an order
  - Conclude an order (AKA pay for it)

- Products
  - Create unit-based products
  - Create weight-based products
  - Update a product's price
  - Remove a product from circulation
  - Search products by name
  - Search products by price range

- Analytics
  - Products
    - See price history
    - See revenue in a time-range
    - See best-sellers in a time-range
  - Orders
    - See revenue in a time-range

To simplify the HTTP verbs used, I will stick to GET for all READ request and POST to all WRITE requests.

The endpoints will be named after their functionality in hopes of keeping the API human friendly.

- orders/
  - create/
  - order/*ID*/product/add
  - order/*ID*/product/remove
  - order/*ID*/getCost
  - order/*ID*/processPayment

- products/
  - create/
  - search/?name=*name*&from=*price*&to=*price*
  - product/*ID*/updatePrice
  - product/*ID*/remove

- analytics/
  - products/
    - bestSellers?from=*date*&to=*date*
    - revenue?from=*date*&to=*date*
    - product/*ID*/priceHistory
    - product/*ID*/revenue?from=*date*&to=*date*
  - orders/
    - revenue?from=*date*&to=*date*

To be as correct as possible while still being relatively easy to remember, the expected status codes are:

- 200: Request OKAY
  - Request was successful
- 201: Resource Created
  - Creation/Write request successful
- 400: Bad Request
  - Request doesn't follow the expected format
  - Missing required fields
- 403: Forbidden Request
  - Request is logically forbidden (Paying an already paid-for order)
- 404: Resource Missing
  - Requested resource is missing
  - No resources match requested description
- 500: Exception
  - Any other exceptions

## Thinking data-structures

Now that the tests are designed (as far as their function goes), we run into an issue that we don't know WHAT data to test for.

Defining the appearance of the data based on its functionality is the desired way to go here.

To avoid switching context too much, I decided to use `sequelize` and `sequelize-cli` to create and managed the database.

I first created the necessary configuration files to use `sequelize-cli` then proceeded to generate models for the three object types: *Order*, *Product* and their joining mechanism *OrderProducts*.

The database will have three tables like this:

- Product
  - `productId` - A custom identifier for the specific product. Not the primary key, as updates to a product would insert new rows with the same `productId` but potentially different values for the other fields.
  - `name`
  - `unitType` - The base unit, like "Packs" or "Kilos". This is an extra field to allow for a single Product table to store all product types (unit-based, weight-based, volume-based, etc).
  - `basePrice` - The price of 1 unit of `unitType`
  - `inCirculation` - If a product can still be purchased, only one element with this `productId` should have this as `true`.
- Order
  - `finalCost`
  - `isPayed`
- OrderProduct
  - `OrderId`
  - `ProductId` - Not `Product`.`id`, since a same physical product can have multiple entries in `Product` if their values are updated.
  - `amount` - The amount of units of the Product.

All tables have `id` (except OrderProduct), `createdAt` and `updatedAt` fields that are managed "automagically" by sequelize.

To comfortably use the sequelize models on other parts of the application, the `src/database/sequelize.js` module is used.

Another addition is, on `api.js`, the first step is to load the database and verify if any tables need creation. This is a design choice to make the application easily testeable when executing on a local environment.

## Implementing functionality

In the largest scope of things, the easiest step.

My aim is to use the previously created sequelize models to run the necessary queries to execute the functionality that is necessary.
