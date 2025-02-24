import Joi from "joi";

export const SignupSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .email({ tlds: { allow: ["com", "net"] } }) // Ensure this is correctly formatted
    .required(), // Add parentheses here
});