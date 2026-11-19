import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminTabs } from "@/components/admin/admin-tabs";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSession } from "@/lib/auth/session";
import { getAdminCourses, getAdminPrompts, getAdminBlogPosts, getAdminToolPackages } from "@/lib/queries/admin";
import { NewCourseForm } from "@/components/admin/new-course-form";
import { CourseRow } from "@/components/admin/course-row";
import { NewPromptForm } from "@/components/admin/new-prompt-form";
import { PromptRow } from "@/components/admin/prompt-row";
import { NewBlogPostForm } from "@/components/admin/new-blog-post-form";
import { BlogPostRow } from "@/components/admin/blog-post-row";
import { NewToolPackageForm } from "@/components/admin/new-tool-package-form";
import { ToolPackageRow } from "@/components/admin/tool-package-row";

function SectionHeader({ title, action }: { title: string; action: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="font-bold">{title}</h3>
      {action}
    </div>
  );
}

export default async function AdminContentPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [courses, prompts, posts, toolPackages] = await Promise.all([
    getAdminCourses(),
    getAdminPrompts(),
    getAdminBlogPosts(),
    getAdminToolPackages(),
  ]);

  return (
    <div>
      <PageHeader title="محتوا" description="مدیریت دوره‌ها، ابزارها، پرامپت‌ها و مقالات بلاگ" />

      <AdminTabs
        tabs={[
          {
            key: "courses",
            label: "دوره‌ها",
            content: (
              <div>
                <SectionHeader title={`پکیج‌های آموزشی (${courses.length})`} action={<NewCourseForm />} />
                {courses.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
                    هنوز پکیج آموزشی‌ای ثبت نشده است.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>پکیج</TableHead>
                        <TableHead>قیمت</TableHead>
                        <TableHead>دانشجو / دسترسی</TableHead>
                        <TableHead>محتوا</TableHead>
                        <TableHead>وضعیت</TableHead>
                        <TableHead>عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <CourseRow key={course.id} course={course} />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            ),
          },
          {
            key: "tools",
            label: "ابزارها",
            content: (
              <div>
                <SectionHeader title={`پکیج‌های ابزار (${toolPackages.length})`} action={<NewToolPackageForm />} />
                {toolPackages.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
                    هنوز پکیج ابزاری ثبت نشده است.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>پکیج</TableHead>
                        <TableHead>قیمت</TableHead>
                        <TableHead>دانلود</TableHead>
                        <TableHead>وضعیت</TableHead>
                        <TableHead>عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {toolPackages.map((toolPackage) => (
                        <ToolPackageRow key={toolPackage.id} toolPackage={toolPackage} />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            ),
          },
          {
            key: "prompts",
            label: "پرامپت‌ها",
            content: (
              <div>
                <SectionHeader title={`پرامپت‌ها (${prompts.length})`} action={<NewPromptForm />} />
                {prompts.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
                    هنوز پرامپتی ثبت نشده است.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>عنوان</TableHead>
                        <TableHead>دسته‌بندی</TableHead>
                        <TableHead>قیمت</TableHead>
                        <TableHead>وضعیت</TableHead>
                        <TableHead>عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prompts.map((prompt) => (
                        <PromptRow key={prompt.id} prompt={prompt} />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            ),
          },
          {
            key: "blog",
            label: "بلاگ",
            content: (
              <div>
                <SectionHeader title={`مقالات بلاگ (${posts.length})`} action={<NewBlogPostForm />} />
                {posts.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
                    هنوز مقاله‌ای ثبت نشده است.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>عنوان مقاله</TableHead>
                        <TableHead>بازدید</TableHead>
                        <TableHead>وضعیت</TableHead>
                        <TableHead>تاریخ انتشار</TableHead>
                        <TableHead>عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post) => (
                        <BlogPostRow key={post.id} post={post} />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
