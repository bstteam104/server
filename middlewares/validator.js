import Joi from "joi";

export const SignupSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .email({ tlds: { allow: ["com", "net"] } }) // Ensure this is correctly formatted
    .required(), // Add parentheses here
});

export const RegisterSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({ tlds: { allow: ["com", "net"] } }),
  phone: Joi.number()
    .integer()
    .min(1000000000) // Minimum 10-digit number
    .max(999999999999999) // Maximum 15-digit number
    .required(),
  password: Joi.string().min(8).max(50).required(),
});

export const SigninSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({ tlds: { allow: ["com", "net"] } }),
    password: Joi.string().min(8).max(50).required(),
});
