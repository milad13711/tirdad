import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSession } from "@/lib/auth/session";
import { getAdminBlogPosts } from "@/lib/queries/admin";
import { NewBlogPostForm } from "@/components/admin/new-blog-post-form";
import { BlogPostRow } from "@/components/admin/blog-post-row";

export default async function AdminBlogPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const posts = await getAdminBlogPosts();

  return (
    <div>
      <PageHeader title="بلاگ" description="مدیریت مقالات آموزشی برای سئو و جذب ترافیک" />

      <div className="mb-8">
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
      </div>

      <NewBlogPostForm />
    </div>
  );
}
