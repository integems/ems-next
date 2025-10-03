// config/passport.ts
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { config } from "./config";
import { deriveFullName } from "@/common/utils";

// Define the user interface for type safety
export interface PassportUser {
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: config.getEnv("GOOGLE_CLIENT_ID") as string,
      clientSecret: config.getEnv("GOOGLE_CLIENT_SECRET") as string,
      callbackURL:
        (config.getEnv("GOOGLE_CALLBACK_URL") as string) ||
        "http://localhost:3000/api/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: PassportUser | false) => void,
    ) => {
      try {
        const { name, emails, photos } = profile;
        if (!emails?.[0]?.value) {
          throw new Error("No email provided by Google");
        }
        const user: PassportUser = {
          email: emails[0].value,
          fullName: deriveFullName(
            name?.givenName,
            undefined,
            name?.familyName,
          ),
          firstName: name?.givenName || emails[0].value,
          lastName: name?.familyName || "",
          profileImage: photos?.[0]?.value,
        };
        done(null, user);
      } catch (error) {
        // console.error("Google Strategy error:", error);
        done(error, false);
      }
    },
  ),
);

export default passport;
