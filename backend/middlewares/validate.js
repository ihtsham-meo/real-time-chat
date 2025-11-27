//backend/middlewares/validate.js
/**
 * Middleware factory for Joi validation
 * Usage: router.post('/path', validate(schema), controller)
 */
const validate = (schema) => {
    return (req, res, next) => {
        // Validate against the schema
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Return all errors, not just the first one
            stripUnknown: true, // Remove unknown fields
        });

        if (error) {
            const errors = error.details.map((detail) => detail.message);
            const err = new Error(errors.join(", "));
            err.statusCode = 400;
            return next(err);
        }

        // Replace req.body with validated and sanitized value
        req.body = value;
        next();
    };
};

export default validate;
