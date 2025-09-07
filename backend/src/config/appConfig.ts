import { getEnv } from "../utils/getEvn";

const appConfig = () => ({
    NODE_ENV: getEnv("NODE_ENV", "development"),
    PORT: getEnv("PORT", "5000"),
    BASE_PATH: getEnv("BASE_PATH", "/api"),
    MONGODB_URI: getEnv("MONGODB_URI", ""),
    SESSION_SECRET: getEnv("SESSION_SECRET", ""),
    SESSION_EXPIRES_IN: getEnv("SESSION_EXPIRES_IN", ""),
    GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID", ""),
    GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET", ""),
    GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL", ""),
    GITHUB_CLIENT_ID: getEnv("GITHUB_CLIENT_ID", ""),
    GITHUB_CLIENT_SECRET: getEnv("GITHUB_CLIENT_SECRET", ""),
    GITHUB_CALLBACK_URL: getEnv("GITHUB_CALLBACK_URL", ""),
    FACEBOOK_CLIENT_ID: getEnv("FACEBOOK_CLIENT_ID", ""),
    FACEBOOK_CLIENT_SECRET: getEnv("FACEBOOK_CLIENT_SECRET", ""),
    FACEBOOK_CALLBACK_URL: getEnv("FACEBOOK_CALLBACK_URL", ""),
    FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "localhost"),
    FRONTEND_GOOGLE_CALLBACK_URL: getEnv("FRONTEND_GOOGLE_CALLBACK_URL", ""),
});

export const config = appConfig();