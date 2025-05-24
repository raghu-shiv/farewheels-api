const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const { Company, validate } = require("../models/company");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    const companies = await Company.find().sort("name");
    res.send(companies);  
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const company = new Company({ name: req.body.name });
  await company.save();
  res.send(company);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const company = await Company.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
    },
    { new: true }
  );

  if (!company)
    return res.status(404).send("The company with the given ID was not found.");

  res.send(company);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const company = await Company.findByIdAndRemove(req.params.id);
  if (!company)
    return res.status(404).send("The company with the given ID was not found.");

  res.send(company);
});

router.get("/:id", async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company)
    return res.status(404).send("The company with the given ID was not found.");

  res.send(company);
});

module.exports = router;
