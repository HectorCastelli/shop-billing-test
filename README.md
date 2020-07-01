# Shop Billing

## Requirements

The objective of this test is to help us to have an idea of how you approach, analyze and solve a
problem. Also the code and the documentation provided will be analyzed with you in the next
interview.

### The Platform we want to build

We want to create a platform to manage the billing of a shop. The functional concepts in the
platform are:

- Products: can be of two types
  - Unit based: price by unit
- Examples: bread, bottle of water, dozen of eggs
  - Weight based: price by kilogram (the weight can be different for each customer, it
is not a pack)
    - Example: tomatoes, oranges

- Orders: each order contains
  - Tuples of product-quantity (the quantity of each product may be units or weight)
  - A date

### The required functionalities are

- Create a new order
- Add one or more unit based product to a order (for example: 2 breads, 1 bottle of water)
- Add product based in weight (for example: 500 grams of tomatoes, 333 grams of
tomatoes, 250 grams of oranges)
- Get the total price of a order
- For analysis purposes, we also want to get the revenue of a product in a time range (for
example: get the total revenue of tomatoes in the last week)

**You can define the database structure and the offered APIs as you consider** it’s the best
and optimal way to do it

Any extra functionality that make sense in this platform will be valued positively

### Technical requirements

For the implementation the requirements are:

- A way to validate that all the functionalities required are working correctly (tests or a set
of data to replicate the behavior plus an script, or other way you think we can validate
the platform is working correctly)
- All the communication with the platform must be through APIs (REST or GraphQL, as
you think it is the best)
- Use of Javascript or Typescript (a framework can be used)
- Use NodeJS
- Use a SQL database (docker may be used, it must be easy to replicate in other
computer)
- Use of Bitbucket, Github or Gitlab for the delivery of the project

Any other technological advantages like a CI/CD pipeline or a docker build is a plus

### Deliverables

The required deliverables of this test are:

- Code in Bitbucket, Github or Gitlab
- Documentation about how to build, run and validate the code (can be in the repository)
- Documentation about the development process and about the decisions taken
- Documentation about the application structure
- A test suite validating the functionalities will be positively valued

## How to use this repository

You can read on how to test and deploy this application on the [`USAGE.md`](https://github.com/HectorCastelli/shop-billing-test/blob/master/USAGE.md) file.

## Architecture

If you are curious on why/how things are built, check out the [`ARCHITECTURE.md`](https://github.com/HectorCastelli/shop-billing-test/blob/master/ARCHITECTURE.md) file.
