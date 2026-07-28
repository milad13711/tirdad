import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default async function AdminBlogPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const posts = await getAdminBlogPosts();

  return (
    <div>
      <PageHeader
        title="بلاگ"
        description="مدیریت مقالات آموزشی برای سئو و جذب ترافیک"
        action={
          <Button size="sm">
            <Plus size={15} />
            نوشتن مقاله جدید
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>عنوان مقاله</TableHead>
            <TableHead>بازدید</TableHead>
            <TableHead>وضعیت</TableHead>
            <TableHead>تاریخ انتشار</TableHead>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
