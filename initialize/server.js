const { logger } = require("./logging");

module.exports = function (app) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => logger.info(`Listening on port ${port}...`));

  if (process.env.NODE_ENV === "production") {
    logger.info("App is running in production mode");
  } else {
    logger.info("App is running in development mode");
  }
};
