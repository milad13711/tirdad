import { getSiteContent } from "@/lib/site-content";
import { LoginPageClient } from "./login-form";

export default async function LoginPage() {
  const content = await getSiteContent();
  return <LoginPageClient siteTitle={content.siteTitle} logoUrl={content.logoUrl} />;
}
