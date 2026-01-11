import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { jwtDecode } from "jwt-decode";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  const token = session.user.AuthenticationResult.AccessToken;
  const decoded = jwtDecode(token);
  const groupId = decoded["cognito:groups"] || 4;

  if (groupId > 3) {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
