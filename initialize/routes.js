const companies = require("../routes/companies");
const customers = require("../routes/customers");
const cars = require("../routes/cars");
const rentals = require("../routes/rentals");
const users = require("../routes/users");
const auth = require("../routes/auth");
const express = require("express");
const error = require("../middleware/error");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/companies", companies);
  app.use("/api/customers", customers);
  app.use("/api/cars", cars);
  app.use("/api/rentals", rentals);
  app.use("/api/users", users);
  app.use("/api/auth", auth);

  app.use(error);
};
