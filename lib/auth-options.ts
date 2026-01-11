// lib/auth-options.ts

import axios from "axios";
import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { API_BASE_URL } from "@/shared/api";

type MeUserResponse = {
  id: string;
  email: string;
  company: string;
  whatsapp: string;
  name: string;
  phoneNumber: string;
  _links: {
    self: { href: string };
  };
};

// Endpoint específico para buscar dados do usuário logado (ambiente dev)
// Exemplo: curl -X GET 'http://localhost:8030/dev/users/me' \
//   -H 'Authorization: Bearer SEU_ACCESS_TOKEN_AQUI'
const USERS_ME_URL =
  process.env.NEXT_PUBLIC_USERS_ME_URL ?? "http://localhost:8030/dev/users/me";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { data } = await axios.post(
            `${API_BASE_URL}/auth/login`,
            {
              username: credentials.username,
              password: credentials.password,
            },
            {
              headers: { "Content-Type": "application/json" },
            }
          );
          return data;
        } catch (error) {
          console.error("Erro na autenticação:", error);

          if (axios.isAxiosError(error) && error.response) {
            const responseData = error.response.data;
            const errorMessage =
              typeof responseData === "string"
                ? responseData
                : responseData?.error?.message ||
                  responseData?.error ||
                  responseData?.message ||
                  JSON.stringify(responseData);
            throw new Error(errorMessage || "Erro na autenticação");
          }

          const fallbackMessage =
            error instanceof Error ? error.message : "Erro desconhecido";
          throw new Error(`Erro ao autenticar: ${fallbackMessage}`);
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if (user.ChallengeName === "NEW_PASSWORD_REQUIRED") {
          token.challengeName = user.ChallengeName;
          token.challengeParametersUser =
            user.ChallengeParameters?.USER_ID_FOR_SRP || null;
          token.challengeParametersUserAtributes =
            user.ChallengeParameters?.userAttributes || null;
          token.cognitoSession = user.Session;
          token.accessToken = null;
          token.idToken = null;
          token.refreshToken = null;
          token.expiresIn = null;
        } else {
          token.accessToken = user.AuthenticationResult.AccessToken;
          token.idToken = user.AuthenticationResult.IdToken;
          token.refreshToken = user.AuthenticationResult.RefreshToken;
          token.expiresIn = user.AuthenticationResult.ExpiresIn;
          token.accessTokenExpires =
            Date.now() + (user.AuthenticationResult.ExpiresIn || 0) * 1000;
          token.cognitoSession = user.Session;
          token.challengeName = null;
          token.challengeParametersUser = null;

          try {
            const { data } = await axios.get<MeUserResponse>(USERS_ME_URL, {
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
                "Content-Type": "application/json",
              },
            });
            token.userProfile = data;
          } catch (error) {
            console.error("Erro ao buscar dados do usuário em /users/me:", error);
            token.userProfile = null;
          }
        }
      }

      if (
        typeof token.accessTokenExpires === "number" &&
        Date.now() < token.accessTokenExpires
      ) {
        return token;
      }

      return token;
    },

    async session({ session, token }) {
      if (token.challengeName === "NEW_PASSWORD_REQUIRED") {
        const userAttributes = token.challengeParametersUserAtributes
          ? JSON.parse(token.challengeParametersUserAtributes as string)
          : {};

        session.user = {
          name: userAttributes.name,
          email: userAttributes.email,
          company: userAttributes["custom:company"],
          challengeName: token.challengeName as string,
          challengeParametersUser: token.challengeParametersUser as string,
          cognitoSession: token.cognitoSession as string,
        } as unknown as User;

        session.accessToken = "";
        session.idToken = "";
        session.refreshToken = "";
        session.challengeName = token.challengeName as string;
        session.challengeParametersUser =
          token.challengeParametersUser as string;
        session.cognitoSession = token.cognitoSession as string;
      } else if (token.accessToken) {
        const profile = token.userProfile as MeUserResponse | null;

        const fullName = profile?.name ?? "";
        const [firstName, ...restName] = fullName.split(" ");
        const lastName = restName.join(" ").trim() || undefined;
        const whatsappFlag =
          typeof profile?.whatsapp === "string"
            ? profile.whatsapp === "1"
            : Boolean(profile?.whatsapp);

        session.user = {
          id: profile?.id,
          clientId: profile?.id,
          clientName: profile?.company,
          firstName,
          lastName,
          name: fullName || undefined,
          email: profile?.email,
          phone_number: profile?.phoneNumber,
          whatsapp: whatsappFlag,
          active: true,
          company: profile?.company,
          AuthenticationResult: {
            AccessToken: token.accessToken,
            IdToken: token.idToken,
            RefreshToken: token.refreshToken,
            ExpiresIn: token.expiresIn,
            TokenType: "Bearer",
          },
        } as User;

        session.accessToken = token.accessToken as string;
        session.idToken = token.idToken as string;
        session.refreshToken = token.refreshToken as string;
        session.challengeName = token.challengeName as string;
        session.challengeParametersUser =
          token.challengeParametersUser as string;
        session.cognitoSession = token.cognitoSession as string;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
