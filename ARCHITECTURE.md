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
  - Effectivate an order (AKA pay for it)

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
  - *ID*/product/add
  - *ID*/product/remove
  - *ID*/getCost
  - *ID*/processPayment

- products/
  - create/
  - search/?name=*name*&from=*price*&to=*price*
  - *ID*/updatePrice
  - *ID*/remove

- analytics/
  - products/
    - bestSellers?from=*date*&to=*date*
    - revenue?from=*date*&to=*date*
    - *ID*/priceHistory
    - *ID*/revenue?from=*date*&to=*date*
  - orders/
    - revenue?from=*date*&to=*date

To be as correct as possible while still being relatively easy to remember, the expected status codes are:

- 200: Request OKAY
  - Request was sucessfull
- 201: Resource Created
  - Creation/Write request sucessfull
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

## Thinking data-structure

Now that the tests are designed (as far as their function goes), we run into an issue that we don't know WHAT data to test for.

Defininig the apparence of the data based on its functionality is the desired way to go here.


