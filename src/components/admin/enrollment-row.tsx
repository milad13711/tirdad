"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarPlus, Infinity as InfinityIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatJalali } from "@/lib/format";

interface EnrollmentRowProps {
  enrollment: {
    id: string;
    progress: number;
    expiresAt: string | Date | null;
    createdAt: string | Date;
    user: { name: string | null; phone: string };
  };
}

export function EnrollmentRow({ enrollment }: EnrollmentRowProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState("");

  const expiresAt = enrollment.expiresAt ? new Date(enrollment.expiresAt) : null;
  const expired = Boolean(expiresAt && expiresAt < new Date());

  async function patch(body: Record<string, unknown>) {
    setLoading(JSON.stringify(body));
    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: enrollment.id, ...body }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{enrollment.user.name || "بدون نام"}</TableCell>
      <TableCell dir="ltr" className="text-left text-muted-foreground">
        {enrollment.user.phone}
      </TableCell>
      <TableCell>{enrollment.progress}٪</TableCell>
      <TableCell>{formatJalali(new Date(enrollment.createdAt))}</TableCell>
      <TableCell>
        {expiresAt ? (
          <Badge variant={expired ? "destructive" : "outline"}>
            {expired ? "منقضی: " : "تا "}
            {formatJalali(expiresAt)}
          </Badge>
        ) : (
          <Badge variant="success">
            <InfinityIcon size={12} />
            نامحدود
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading !== null}
            onClick={() => patch({ extendDays: 30 })}
          >
            <CalendarPlus size={13} />+۳۰ روز
          </Button>
          <Input
            type="date"
            value={customDate}
            onChange={(event) => setCustomDate(event.target.value)}
            className="w-36"
          />
          <Button
            variant="outline"
            size="sm"
            disabled={loading !== null || !customDate}
            onClick={() => patch({ expiresAt: new Date(customDate).toISOString() })}
          >
            ثبت تاریخ
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={loading !== null}
            onClick={() => patch({ expiresAt: null })}
          >
            نامحدود کن
          </Button>
          <DeleteButton
            endpoint="/api/admin/enrollments"
            id={enrollment.id}
            confirmMessage={`دسترسی «${enrollment.user.name || enrollment.user.phone}» به این پکیج لغو شود؟`}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
