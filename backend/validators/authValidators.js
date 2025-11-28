//validators/authValidators.js
import Joi from "joi";

export const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
        "string.min": "Name must be at least 2 characters",
        "string.max": "Name cannot exceed 50 characters",
        "any.required": "Name is required",
    }),
    username: Joi.string()
        .min(3)
        .max(30)
        .pattern(/^[a-zA-Z0-9_]+$/)
        .required()
        .messages({
            "string.min": "Username must be at least 3 characters",
            "string.max": "Username cannot exceed 30 characters",
            "string.pattern.base": "Username can only contain letters, numbers, and underscores",
            "any.required": "Username is required",
        }),
    email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email",
        "any.required": "Email is required",
    }),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            "string.min": "Password must be at least 8 characters",
            "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
            "any.required": "Password is required",
        }),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().optional().messages({
        "string.email": "Please provide a valid email",
    }),
    username: Joi.string().optional(),
    password: Joi.string().required().messages({
        "any.required": "Password is required",
    }),
})
    .or("email", "username")
    .messages({
        "object.missing": "Please provide either email or username",
    });

export const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    username: Joi.string()
        .min(3)
        .max(30)
        .pattern(/^[a-zA-Z0-9_]+$/)
        .optional()
        .messages({
            "string.min": "Username must be at least 3 characters",
            "string.max": "Username cannot exceed 30 characters",
            "string.pattern.base": "Username can only contain letters, numbers, and underscores",
        }),
    email: Joi.string().email().optional(),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .optional()
        .messages({
            "string.min": "Password must be at least 8 characters",
            "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
        }),
}).min(1); // At least one field must be present
