"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const appConfig_1 = require("./appConfig");
const appError_1 = require("../utils/appError");
const accProvider_1 = require("../enums/accProvider");
const auth_service_1 = require("../service/auth.service");
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: appConfig_1.config.GOOGLE_CLIENT_ID,
    clientSecret: appConfig_1.config.GOOGLE_CLIENT_SECRET,
    callbackURL: appConfig_1.config.GOOGLE_CALLBACK_URL,
    scope: ["profile", "email"],
    passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        const { email, sub: googleId, picture } = profile._json;
        console.log(profile, "profile");
        console.log(googleId, "googleId");
        if (!googleId) {
            throw new appError_1.NotFoundError("Google ID (sub) is missing");
        }
        const { user } = await (0, auth_service_1.loginOrCreateAccountService)({
            provider: accProvider_1.ProviderEnum.GOOGLE,
            displayName: profile.displayName,
            providerId: googleId,
            picture: picture,
            email: email,
        });
        done(null, user);
    }
    catch (error) {
        done(error, false);
    }
}));
passport_1.default.serializeUser((user, done) => done(null, user));
passport_1.default.deserializeUser((user, done) => done(null, user));
