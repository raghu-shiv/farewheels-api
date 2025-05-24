const { Rental, validate } = require("../models/rental");
const { Car } = require("../models/car");
const { Customer } = require("../models/customer");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  const rentals = await Rental.find().sort("-rentedOn");
  res.send(rentals);
});

router.post("/", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findById(req.body.customerId);
    if (!customer)
      return res.status(400).send("Fetched customerId is invalid.");

    const car = await Car.findById(req.body.carId);
    if (!car) return res.status(400).send("Fetched carId is invalid.");

    if (car.numberInStock === 0)
      return res.status(400).send("This car is out of stock at the moment.");

    let rental = new Rental({
      customer: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
      },
      car: {
        _id: car._id,
        modelName: car.modelName,
        dailyRentalRate: car.dailyRentalRate,
      },
    });

    rental = await rental.save({ session });

    car.numberInStock--;
    await car.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.send(rental);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Your vehicle is not booked. Something went wrong");
    console.log(err);
  }
});

router.get("/:id", async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental)
    return res.status(404).send("The rental with the given ID was not found.");

  res.send(rental);
});

module.exports = router;
