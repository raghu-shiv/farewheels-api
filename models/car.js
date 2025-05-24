const Joi = require("joi");
const mongoose = require("mongoose");
const { companySchema } = require("./company");

const Car = mongoose.model(
  "Car",
  new mongoose.Schema({
    modelName: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 255,
    },
    company: {
      type: companySchema,
      required: true,
    },
    numberInStock: {
      type: Number,
      required: true,
      min: 0,
      max: 25,
    },
    dailyRentalRate: {
      type: Number,
      required: true,
      min: 0,
      max: 250,
    },
  })
);

const validateCar = (car) => {
  const schema = Joi.object({
    modelName: Joi.string().min(5).max(50).required(),
    companyId: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).max(25).required(),
    dailyRentalRate: Joi.number().min(0).max(250).required(),
  });

  return schema.validate(car);
};

exports.validate = validateCar;
exports.Car = Car;
