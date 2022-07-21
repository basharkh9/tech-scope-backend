import express from "express";
import swaggerUI from "swagger-ui-express";
import { specs } from "./docs";
import users from "../routes/users";

export default function (app: express.Application) {
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
}
