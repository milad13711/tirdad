import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { getAdminUsers } from "@/lib/queries/admin";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const users = await getAdminUsers();

  return (
    <div>
      <PageHeader
        title="کاربران"
        description="مدیریت کاربران و اشتراک‌های پلتفرم"
        action={<Input placeholder="جستجوی کاربر..." className="w-full sm:w-64" />}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>نام کاربر</TableHead>
            <TableHead>شماره موبایل</TableHead>
            <TableHead>پلن</TableHead>
            <TableHead>نقش</TableHead>
            <TableHead>تاریخ عضویت</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name ?? "—"}</TableCell>
              <TableCell dir="ltr" className="text-left text-muted-foreground">
                {user.phone}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{user.subscriptions[0]?.plan.name ?? "رایگان"}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                  {user.role === "ADMIN" ? "مدیر" : "کاربر"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatJalali(user.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
