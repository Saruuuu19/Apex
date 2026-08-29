import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const hasToken = (await cookies()).has("apex_token");

  if (!hasToken) {
    redirect("/login");
  }

  redirect("/home/feed");
}
