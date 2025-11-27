//backend/config/validateEnv.js
/**
 * Validates that all required environment variables are present
 * Fails fast at startup if any are missing
 */
const validateEnv = () => {
    const required = [
        "MONGO_URI",
        "JWT_SECRET",
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
    ];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        console.error("❌ Missing required environment variables:");
        missing.forEach((key) => console.error(`   - ${key}`));
        process.exit(1);
    }

    console.log("✅ All required environment variables are present");
};

export default validateEnv;
