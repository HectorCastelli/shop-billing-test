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
