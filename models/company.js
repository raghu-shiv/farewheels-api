const mongoose = require("mongoose");
const Joi = require("joi");

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
});

const Company = mongoose.model("Company", companySchema);

function validateCompany(company) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
  });

  return schema.validate(company);
}

exports.companySchema = companySchema;
exports.Company = Company;
exports.validate = validateCompany;