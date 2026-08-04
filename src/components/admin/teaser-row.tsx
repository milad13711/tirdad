"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ToggleStatusButton } from "@/components/admin/toggle-status-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatJalali } from "@/lib/format";

interface TeaserRowProps {
  sample: {
    id: string;
    title: string;
    coverImage: string | null;
    active: boolean;
    createdAt: Date;
  };
}

export function TeaserRow({ sample }: TeaserRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {sample.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sample.coverImage} alt="" className="h-8 w-12 rounded object-cover" />
          )}
          {sample.title}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={sample.active ? "success" : "outline"}>
          {sample.active ? "فعال" : "غیرفعال"}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">{formatJalali(sample.createdAt)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <ToggleStatusButton
            endpoint="/api/admin/teasers"
            body={{ id: sample.id, active: !sample.active }}
            activeNow={sample.active}
            onLabel="فعال‌سازی"
            offLabel="غیرفعال‌سازی"
          />
          <DeleteButton
            endpoint="/api/admin/teasers"
            id={sample.id}
            confirmMessage={`نمونه کار «${sample.title}» حذف شود؟`}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
