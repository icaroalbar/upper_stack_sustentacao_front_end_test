import { DefaultUser, Session as DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id?: string;
    clientId?: string;
    clientName?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    phone_number?: string;
    company?: string;
    whatsapp?: boolean;
    active?: boolean;
    AuthenticationResult: {
      AccessToken: string;
      IdToken: string;
      RefreshToken: string;
      ExpiresIn: number;
      TokenType: "Bearer";
    };
    Session?: string;
    ChallengeName?: string;
    ChallengeParameters?: {
      USER_ID_FOR_SRP: string;
      userAttributes: string;
    };
    phone_number?: string;
    company?: string;
  }

  interface Session extends DefaultSession {
    accessToken: string;
    idToken: string;
    cognitoSession: string;
    refreshToken: string;
    challengeName?: string;
    challengeParametersUser?: string;
    user: User;
  }

  interface JWT extends DefaultJWT {
    accessToken: string;
    idToken: string;
    refreshToken: string;
    expiresIn: number;
    accessTokenExpires: number;
    phone_number?: string;
    company?: string;
    userProfile?: unknown;
  }
}
