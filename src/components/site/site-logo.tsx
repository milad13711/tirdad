import { Sparkles } from "lucide-react";

// Shared logo mark used in Navbar, Footer, and the mobile bottom nav sheet.
// Falls back to the default Sparkles-in-a-box mark when the admin hasn't
// uploaded a custom logo yet (logoUrl === "").
export function SiteLogo({ logoUrl, siteTitle }: { logoUrl: string; siteTitle: string }) {
  return (
    <>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="h-8 w-8 rounded-md object-cover" />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Sparkles size={16} />
        </span>
      )}
      {siteTitle}
    </>
  );
}
