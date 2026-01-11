import { JwtPayload } from "jwt-decode";

export interface ExtendedJwtPayload extends JwtPayload {
  email?: string;
  phone_number?: string;
  name?: string;
  ["custom:company"]?: string;
}
