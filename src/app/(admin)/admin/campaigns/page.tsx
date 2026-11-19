import { redirect } from "next/navigation";
import { MousePointerClick } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NewCampaignLinkForm } from "@/components/admin/new-campaign-link-form";
import { CopyLinkButton } from "@/components/admin/copy-link-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { QuestionAnsweredToggle } from "@/components/admin/question-answered-toggle";
import { getSession } from "@/lib/auth/session";
import { isFullAdmin } from "@/lib/auth/roles";
import { getCampaignLinksWithStats, getCampaignQuestions, getAdminCourses, getAdminToolPackages } from "@/lib/queries/admin";
import { formatJalali } from "@/lib/format";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

const SECTION_LABEL: Record<string, string> = {
  video: "ویدیو",
  cover: "کاور",
  demo_video: "ویدیوی دمو",
  description: "توضیحات",
  syllabus: "سرفصل‌ها",
  price_buy_box: "باکس قیمت و خرید",
};

export default async function AdminCampaignsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isFullAdmin(session)) redirect("/admin/inbox");

  const [links, questions, courses, toolPackages] = await Promise.all([
    getCampaignLinksWithStats(),
    getCampaignQuestions(),
    getAdminCourses(),
    getAdminToolPackages(),
  ]);

  return (
    <div>
      <PageHeader
        title="لینک‌های کمپین و آمار فروش"
        description="لینک اختصاصی برای تبلیغات هر محصول، به‌همراه قیف تبدیل و سوالات مخاطبان — محرمانه، فقط برای مدیر کل"
      />

      <NewCampaignLinkForm
        courses={courses.map((c) => ({ id: c.id, title: c.title }))}
        toolPackages={toolPackages.map((t) => ({ id: t.id, title: t.title }))}
      />

      <div className="mt-6">
        {links.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            هنوز لینک کمپینی ساخته نشده است.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>محصول / عنوان کمپین</TableHead>
                <TableHead>کلیک لینک</TableHead>
                <TableHead>بازدید صفحه</TableHead>
                <TableHead>{"ماندگاری >۱۰ثانیه"}</TableHead>
                <TableHead>بیشترین توقف</TableHead>
                <TableHead>کلیک پرداخت</TableHead>
                <TableHead>پرداخت موفق</TableHead>
                <TableHead>نرخ تبدیل</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => {
                const conversion = link.pageViews > 0 ? Math.round((link.paySuccess / link.pageViews) * 100) : 0;
                return (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">
                      <div>{link.productTitle}</div>
                      {link.label && <div className="text-xs text-muted-foreground">{link.label}</div>}
                      <div className="mt-1 flex items-center gap-2">
                        <span dir="ltr" className="text-xs text-muted-foreground">
                          {appUrl()}/go/{link.slug}
                        </span>
                        <CopyLinkButton url={`${appUrl()}/go/${link.slug}`} />
                      </div>
                    </TableCell>
                    <TableCell>{link.clickCount}</TableCell>
                    <TableCell>{link.pageViews}</TableCell>
                    <TableCell>{link.dwell10s}</TableCell>
                    <TableCell>
                      {link.topSection ? (
                        <Badge variant="outline">{SECTION_LABEL[link.topSection] ?? link.topSection}</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{link.payClicks}</TableCell>
                    <TableCell>{link.paySuccess}</TableCell>
                    <TableCell>
                      <Badge variant={conversion > 0 ? "success" : "outline"}>{conversion}٪</Badge>
                    </TableCell>
                    <TableCell>
                      <DeleteButton
                        endpoint="/api/admin/campaigns"
                        id={link.id}
                        confirmMessage={`لینک کمپین «${link.label || link.productTitle}» حذف شود؟`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="mt-10 rounded-xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center gap-2">
          <MousePointerClick size={16} className="text-primary" />
          <h3 className="font-bold">سوالات مخاطبان از صفحه محصولات</h3>
        </div>
        {questions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">هنوز سوالی ثبت نشده است.</p>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <div key={q.id} className="rounded-lg border border-border p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{q.productTitle}</span>
                    <a href={`tel:${q.phone}`} dir="ltr" className="text-muted-foreground hover:text-primary">
                      {q.phone}
                    </a>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatJalali(q.createdAt)}</span>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">{q.message}</p>
                <QuestionAnsweredToggle id={q.id} answered={Boolean(q.answeredAt)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
