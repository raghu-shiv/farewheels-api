const config = require("config");

module.exports = function () {
  if (!config.get("jwtSecretKey")) {
    throw new Error("FATAL_ERROR: JWT Secret Key is not defined");
  }
};
