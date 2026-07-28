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
import { adminBlogPosts } from "@/lib/mock-data";

export default function AdminBlogPage() {
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
          {adminBlogPosts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium">{post.title}</TableCell>
              <TableCell className="text-muted-foreground">
                {post.views.toLocaleString("fa-IR")}
              </TableCell>
              <TableCell>
                <Badge variant={post.status === "منتشرشده" ? "success" : "outline"}>
                  {post.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{post.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
