import Joi from "joi";
import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user";
import { LoginUserDto } from "../dtos/login-user";

const router = express.Router();

/**
 * @swagger
 * components:
 *  schemas:
 *    LoginUserDto:
 *      type: object
 *      required:
 *        - email
 *        - password
 *      properties:
 *        email:
 *          type: string
 *          description: The user email
 *        password:
 *          type: string
 *          description: The user password
 *      example:
 *        email: "b@mail.com"
 *        password: "12345"
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: The users Authentication API
 */

/**
 * @swagger
 * /api/auth:
 *  post:
 *    summary: Login user
 *    tags: [Authentication]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/LoginUserDto'
 *    responses:
 *      200:
 *        description: The user was successfully authenticated
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                  token:
 *                      type: string
 *                      description: The auto-generated JWT token of the user
 *      400:
 *        description: Bad request
 *      500:
 *        description: Some server error
 */

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  const token = user.generateAuthToken();

  res.send({ token: token });
});

function validate(req: LoginUserDto) {
  const schema = Joi.object({
    email: Joi.string().max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(req);
}

export default router;
