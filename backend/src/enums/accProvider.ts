export const ProviderEnum = {
    GOOGLE: "google",
    FACEBOOK: "facebook",
    TWITTER: "twitter",
    GITHUB: "github",
    LINKEDIN: "linkedin",
    INSTAGRAM: "instagram",
    PINTEREST: "pinterest",
    SNAPCHAT: "snapchat",
    TIKTOK: "tiktok",
    EMAIL: "email"
};

export type ProviderEnumType = typeof ProviderEnum[keyof typeof ProviderEnum];