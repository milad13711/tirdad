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
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>عنوان پکیج</TableHead>
                      <TableHead>قیمت (تومان)</TableHead>
                      <TableHead>دانشجویان</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <CourseRow key={course.id} course={course} />
                    ))}
                  </TableBody>
                </Table>
                <NewCourseForm />
              </>
            ),
          },
          {
            key: "tools",
            label: "ابزارها",
            content: (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>عنوان پکیج</TableHead>
                      <TableHead>قیمت</TableHead>
                      <TableHead>دانلود</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {toolPackages.map((toolPackage) => (
                      <ToolPackageRow key={toolPackage.id} toolPackage={toolPackage} />
                    ))}
                  </TableBody>
                </Table>
                <NewToolPackageForm />
              </>
            ),
          },
          {
            key: "prompts",
            label: "پرامپت‌ها",
            content: (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>عنوان</TableHead>
                      <TableHead>دسته‌بندی</TableHead>
                      <TableHead>قیمت</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prompts.map((prompt) => (
                      <PromptRow key={prompt.id} prompt={prompt} />
                    ))}
                  </TableBody>
                </Table>
                <NewPromptForm />
              </>
            ),
          },
          {
            key: "blog",
            label: "بلاگ",
            content: (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>عنوان مقاله</TableHead>
                      <TableHead>بازدید</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead>تاریخ انتشار</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <BlogPostRow key={post.id} post={post} />
                    ))}
                  </TableBody>
                </Table>
                <NewBlogPostForm />
              </>
            ),
          },
        ]}
      />
    </div>
  );
}
