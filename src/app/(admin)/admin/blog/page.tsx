import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSession } from "@/lib/auth/session";
import { formatJalali } from "@/lib/queries/dashboard";
import { getAdminBlogPosts } from "@/lib/queries/admin";
import { blogStatusLabel, blogStatusVariant } from "@/lib/status-labels";
import { NewBlogPostForm } from "@/components/admin/new-blog-post-form";
import { ToggleStatusButton } from "@/components/admin/toggle-status-button";

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
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell className="text-muted-foreground">
                  {post.views.toLocaleString("fa-IR")}
                </TableCell>
                <TableCell>
                  <Badge variant={blogStatusVariant[post.status]}>
                    {blogStatusLabel[post.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {post.publishedAt ? formatJalali(post.publishedAt) : "—"}
                </TableCell>
                <TableCell>
                  <ToggleStatusButton
                    endpoint="/api/admin/blog"
                    body={{ id: post.id, published: post.status !== "PUBLISHED" }}
                    activeNow={post.status === "PUBLISHED"}
                    onLabel="انتشار"
                    offLabel="لغو انتشار"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <NewBlogPostForm />
    </div>
  );
}
