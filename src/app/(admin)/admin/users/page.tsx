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
import { adminUsers } from "@/lib/mock-data";

export default function AdminUsersPage() {
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
            <TableHead>وضعیت</TableHead>
            <TableHead>تاریخ عضویت</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adminUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell dir="ltr" className="text-left text-muted-foreground">
                {user.phone}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{user.plan}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.status === "فعال" ? "success" : "destructive"}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{user.joined}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
