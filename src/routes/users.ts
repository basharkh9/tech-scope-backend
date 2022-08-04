import bcrypt from "bcrypt";
import _ from "lodash";
import { User, validate } from "../models/user";
import express from "express";
import swaggerJsDoc from "swagger-jsdoc";
import { UniqueUserDto } from "../dtos/unique-user";
import Joi from "joi";
const router = express.Router();

/**
 * @swagger
 * components:
 *  schemas:
 *    CreateUserDto:
 *      type: object
 *      required:
 *        - name
 *        - email
 *        - password
 *      properties:
 *        name:
 *          type: string
 *          description: The user full name
 *        email:
 *          type: string
 *          description: The user email
 *        password:
 *          type: string
 *          description: The user password
 *      example:
 *        name: "Bashar Khadra"
 *        email: "b@mail.com"
 *        password: "12345"
 */

/**
 * @swagger
 * components:
 *  schemas:
 *    UniqueUserDto:
 *      type: object
 *      required:
 *        - email
 *      properties:
 *        email:
 *          type: string
 *          description: The user email
 *      example:
 *        email: "b@mail.com"
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The users managing API
 */

/**
 * @swagger
 * /api/users:
 *  post:
 *    summary: Create a new user
 *    tags: [Users]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CreateUserDto'
 *    responses:
 *      200:
 *        description: The user was successfully created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateUserDto'
 *        headers:
 *          x-auth-token:
 *            schema:
 *              type: string
 *      400:
 *        description: Bad request
 *      500:
 *        description: Some server error
 */
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "name", "email"]));
});

/**
 * @swagger
 * /api/users/unique:
 *  post:
 *    summary: Check if existing user is registered with the same email
 *    tags: [Users]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UniqueUserDto'
 *
 *    responses:
 *      200:
 *        description: User not regestered before
 *        content:
 *          text/plain:
 *            schema:
 *              type: string
 *              example: User is not registered before.
 *      400:
 *        description: Bad request
 *      409:
 *        description: User already exist
 *        content:
 *          text/plain:
 *            schema:
 *              type: string
 *              example: User already exist.
 *      500:
 *        description: Some server error
 */
router.post("/unique", async (req, res) => {
  const { error } = validateEmail(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(200).send("User is not registered before.");

  return res.status(409).send("User already exist.");
});

function validateEmail(user: UniqueUserDto) {
  const schema = Joi.object({
    email: Joi.string().max(255).required().email(),
  });

  return schema.validate(user);
}
export default router;
