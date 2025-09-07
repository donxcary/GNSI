import passport from "passport";
import { Request } from "express";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { config } from "./appConfig";
import { NotFoundError } from "../utils/appError";
import { ProviderEnum } from "../enums/accProvider";
import { loginOrCreateAccountService } from "../service/auth.service";


passport.use(
    new GoogleStrategy(
    {
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: config.GOOGLE_CALLBACK_URL,
    scope: ["profile", "email"],
    passReqToCallback: true,
    },
    async (req: Request, accessToken, refreshToken, profile, done) => {
        try{
        const { email, sub: googleId, picture } = profile._json;
        console.log(profile, "profile");
        console.log(googleId, "googleId");
        if (!googleId) {
            throw new NotFoundError("Google ID (sub) is missing");
        }

        const { user } = await loginOrCreateAccountService({
            provider: ProviderEnum.GOOGLE,
            displayName: profile.displayName,
            providerId: googleId,
            picture: picture,
            email: email,
        });
        done(null, user);
        } catch (error) {
            done(error, false);
        }
    }
));

if (config.GITHUB_CLIENT_ID && config.GITHUB_CLIENT_SECRET && config.GITHUB_CALLBACK_URL) {
    passport.use(
        new GitHubStrategy(
            {
                clientID: config.GITHUB_CLIENT_ID,
                clientSecret: config.GITHUB_CLIENT_SECRET,
                callbackURL: config.GITHUB_CALLBACK_URL,
                scope: ["user:email"],
                passReqToCallback: true,
            },
            async (
                req: Request,
                accessToken: string,
                refreshToken: string,
                profile: any,
                done: (err: any, user?: any) => void
            ) => {
                try {
                    const email = Array.isArray(profile.emails) && profile.emails.length > 0 ? profile.emails[0].value : undefined;
                    const githubId = profile.id;
                    if (!githubId) throw new NotFoundError("GitHub ID is missing");

                    const { user } = await loginOrCreateAccountService({
                        provider: ProviderEnum.GITHUB,
                        displayName: profile.displayName || profile.username || "GitHub User",
                        providerId: githubId,
                        picture: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
                        email,
                    });
                    done(null, user);
                } catch (error) {
                    done(error, false);
                }
            }
        )
    );
}

if (config.FACEBOOK_CLIENT_ID && config.FACEBOOK_CLIENT_SECRET && config.FACEBOOK_CALLBACK_URL) {
    passport.use(
        new FacebookStrategy(
            {
                clientID: config.FACEBOOK_CLIENT_ID,
                clientSecret: config.FACEBOOK_CLIENT_SECRET,
                callbackURL: config.FACEBOOK_CALLBACK_URL,
                profileFields: ["id", "emails", "name", "displayName", "photos"],
                enableProof: true,
                passReqToCallback: true,
            },
            async (
                req: Request,
                accessToken: string,
                refreshToken: string,
                profile: any,
                done: (err: any, user?: any) => void
            ) => {
                try {
                    const email = Array.isArray(profile.emails) && profile.emails.length > 0 ? profile.emails[0].value : undefined;
                    const facebookId = profile.id;
                    if (!facebookId) throw new NotFoundError("Facebook ID is missing");

                    const { user } = await loginOrCreateAccountService({
                        provider: ProviderEnum.FACEBOOK,
                        displayName: profile.displayName || `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim(),
                        providerId: facebookId,
                        picture: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
                        email,
                    });
                    done(null, user);
                } catch (error) {
                    done(error, false);
                }
            }
        )
    );
}

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));