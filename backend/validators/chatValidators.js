//backend/validators/chatValidators.js
import Joi from "joi";

export const createOrGetChatSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": "userId is required",
    }),
});

export const createGroupChatSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        "string.min": "Group name must be at least 2 characters",
        "string.max": "Group name cannot exceed 100 characters",
        "any.required": "Group name is required",
    }),
    users: Joi.alternatives()
        .try(
            Joi.array().items(Joi.string()).min(1),
            Joi.string()
        )
        .required()
        .messages({
            "any.required": "Users are required",
        }),
});

export const addRemoveUserSchema = Joi.object({
    chatId: Joi.string().required().messages({
        "any.required": "chatId is required",
    }),
    userId: Joi.string().required().messages({
        "any.required": "userId is required",
    }),
});

export const leaveGroupSchema = Joi.object({
    chatId: Joi.string().required().messages({
        "any.required": "chatId is required",
    }),
});

export const renameGroupSchema = Joi.object({
    chatId: Joi.string().required().messages({
        "any.required": "chatId is required",
    }),
    newName: Joi.string().min(2).max(100).required().messages({
        "string.min": "Group name must be at least 2 characters",
        "string.max": "Group name cannot exceed 100 characters",
        "any.required": "New name is required",
    }),
});

export const transferAdminSchema = Joi.object({
    chatId: Joi.string().required().messages({
        "any.required": "chatId is required",
    }),
    newAdminId: Joi.string().required().messages({
        "any.required": "newAdminId is required",
    }),
});

export const updateGroupPicSchema = Joi.object({
    chatId: Joi.string().required().messages({
        "any.required": "chatId is required",
    }),
});
