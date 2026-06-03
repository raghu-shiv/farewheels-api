const { Car, validate } = require("../models/car");
const { Company } = require("../models/company");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  // throw new Error("Not able to fetch cars")
  const cars = await Car.find().sort("name");
  res.send(cars);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const company = await Company.findById(req.body.companyId);
  if (!company)
    return res.status(400).send("The company with the given ID is invalid.");

  const car = new Car({
    modelName: req.body.modelName,
    company: {
      _id: company._id,
      name: company.name,
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate,
  });

  await car.save();
  res.send(car);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const company = await Company.findById(req.body.companyId);
  if (!company)
    return res.status(400).send("The company with the given ID is invalid.");

  const car = await Car.findByIdAndUpdate(
    req.params.id,
    {
      modelName: req.body.modelName,
      company: {
        _id: company._id,
        name: company.name,
      },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate,
    },
    { new: true },
  );

  if (!car)
    return res.status(404).send("The car with the given ID was not found.");

  res.send(car);
});

router.delete("/:id", async (req, res) => {
  const car = await Car.findByIdAndRemove(req.params.id);

  if (!car)
    return res.status(404).send("The car with the given ID was not found.");

  res.send(car);
});

router.get("/:id", async (req, res) => {
  const car = await Car.findById(req.params.id);

  if (!car)
    return res.status(404).send("The car with the given ID was not found.");

  res.send(car);
});

module.exports = router;
