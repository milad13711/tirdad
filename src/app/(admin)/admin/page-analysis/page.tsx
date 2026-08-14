import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { PageAnalysisPanel } from "@/components/admin/page-analysis-panel";
import { getSession } from "@/lib/auth/session";
import { isStaffOrAdmin } from "@/lib/auth/roles";
import { getPageAnalysisRequests } from "@/lib/queries/admin";

export default async function AdminPageAnalysisPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isStaffOrAdmin(session)) redirect("/dashboard");

  const pageAnalysisRequests = await getPageAnalysisRequests();
  const pendingCount = pageAnalysisRequests.filter((r) => !r.respondedAt).length;

  return (
    <div>
      <PageHeader
        title="درخواست‌های آنالیز پیج"
        description="درخواست‌های آنالیز رایگان پیج اینستاگرام از لندینگ"
      />
      <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>
          مجموع درخواست‌ها: <strong className="text-foreground">{pageAnalysisRequests.length}</strong>
        </span>
        <span>
          در انتظار پاسخ: <strong className="text-foreground">{pendingCount}</strong>
        </span>
      </div>
      <PageAnalysisPanel leads={pageAnalysisRequests} />
    </div>
  );
}
