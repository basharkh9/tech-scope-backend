import winston from "winston";
import mongoose from "mongoose";

export default function () {
  mongoose
    .connect("mongodb://localhost/tech-scope")
    .then(() => winston.info("Connected to MongoDB..."));
}
