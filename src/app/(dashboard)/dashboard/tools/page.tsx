import { redirect } from "next/navigation";
import Link from "next/link";
import { Download, Package } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { getUserToolPackages } from "@/lib/queries/dashboard";
import { formatToman } from "@/lib/format";

export default async function MyToolsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const toolPackages = await getUserToolPackages(session.sub);

  return (
    <div>
      <PageHeader
        title="ابزارهای من"
        description="پکیج‌های رایگان و خریداری‌شده — مستقیم روی سیستم خودتان دانلود کنید"
        action={
          <Button asChild size="sm" variant="outline">
            <Link href="/tools">مشاهده همه ابزارها</Link>
          </Button>
        }
      />

      {toolPackages.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          هنوز پکیجی ندارید.
          <div className="mt-4">
            <Button asChild size="sm">
              <Link href="/tools">مشاهده ابزارها</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {toolPackages.map((toolPackage) => (
            <div key={toolPackage.id} className="flex flex-col rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <h3 className="font-bold leading-7">{toolPackage.title}</h3>
                {toolPackage.price === 0 ? (
                  <Badge variant="success">رایگان</Badge>
                ) : (
                  <Badge variant="outline">{formatToman(toolPackage.price)} تومان</Badge>
                )}
              </div>
              {toolPackage.category && (
                <span className="mb-6 flex w-fit items-center gap-1.5 text-xs text-muted-foreground">
                  <Package size={13} /> {toolPackage.category}
                </span>
              )}
              <Button asChild size="sm" className="mt-auto">
                <a href={`/api/tools/${toolPackage.id}/download`}>
                  <Download size={15} />
                  دانلود
                </a>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
