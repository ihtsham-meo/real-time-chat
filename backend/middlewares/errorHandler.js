//backend/middlewares/errorHandler.js
/**
 * Centralized error handling middleware
 * Catches all errors and sends consistent JSON responses
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error for debugging
    console.error(`[ERROR] ${statusCode}: ${message}`);
    if (process.env.NODE_ENV === "development") {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

export default errorHandler;
