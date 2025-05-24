const mongoose = require("mongoose");
const Joi = require("joi");

const Rental = mongoose.model(
  "Rental",
  new mongoose.Schema({
    customer: {
      type: new mongoose.Schema({
        name: {
          type: String,
          required: true,
          minlength: 5,
          maxlength: 50,
        },
        phone: {
          type: String,
          required: true,
          minlength: 5,
          maxlength: 50,
        },
        isPrime: {
          type: Boolean,
          default: false,
        },
      }),
      required: true,
    },
    car: {
      type: new mongoose.Schema({
        modelName: {
          type: String,
          required: true,
          trim: true,
          minlength: 5,
          maxlength: 255,
        },
        dailyRentalRate: {
          type: Number,
          required: true,
          min: 0,
          max: 255,
        },
      }),
      required: true,
    },
    rentedOn: {
      type: Date,
      required: true,
      default: Date.now,
    },
    returnedOn: {
      type: Date,
    },
    rent: {
      type: Number,
      min: 0,
    },
  })
);

const validateRental = (rental) => {
  const schema = Joi.object({
    carId: Joi.objectId().required(),
    customerId: Joi.objectId().required(),
  });

  return schema.validate(rental);
};

exports.validate = validateRental;
exports.Rental = Rental;
