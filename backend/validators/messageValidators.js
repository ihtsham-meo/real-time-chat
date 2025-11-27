//backend/validators/messageValidators.js
import Joi from "joi";

export const sendMessageSchema = Joi.object({
    chatId: Joi.string().required().messages({
        "any.required": "chatId is required",
    }),
    content: Joi.string().allow("").optional(),
});

export const getMessagesSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
});
