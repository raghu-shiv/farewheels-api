require("dotenv").config();
const express = require("express");
const app = express();

require("./initialize/logging");
require("./initialize/routes")(app);
require("./initialize/db")();
require("./initialize/config")();
require("./initialize/validation")();
require("./initialize/server")(app);
require("./initialize/gzip")(app);
require("./initialize/helmet")(app);
