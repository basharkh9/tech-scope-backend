import config from "config";
import jwt from "jsonwebtoken";
import Joi from "joi";
import mongoose, { Document } from "mongoose";

// this interface used add generateAuthToken method
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  generateAuthToken: () => string;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this.id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
};

const User = mongoose.model<IUser>("User", userSchema);

export function validateUser(user: IUser) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(user);
}

export { User as User, validateUser as validate };
