import winston from "winston";
import express from "express";
import initializeRoutes from "./startup/routes";
import connectToDb from "./startup/db";
import loadConfiguration from "./startup/config";
import configureLogger from "./startup/logging";

const app = express();
connectToDb();
initializeRoutes(app);
loadConfiguration();
configureLogger();

const port = process.env.PORT || 3000;
app.listen(port, () => winston.info(`Listening on port ${port}...`));
