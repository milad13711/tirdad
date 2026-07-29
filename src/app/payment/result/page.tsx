import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; message?: string }>;
}) {
  const { ok, message } = await searchParams;
  const success = ok === "1";

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-10 text-center">
        {success ? (
          <CheckCircle2 size={48} className="mx-auto mb-5 text-emerald-500" />
        ) : (
          <XCircle size={48} className="mx-auto mb-5 text-destructive" />
        )}
        <h1 className="mb-2 text-xl font-extrabold">
          {success ? "پرداخت موفق" : "پرداخت ناموفق"}
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          {message ?? (success ? "سفارش شما با موفقیت ثبت شد." : "مشکلی در پرداخت پیش آمد.")}
        </p>
        <Button asChild>
          <Link href="/dashboard">بازگشت به پنل کاربری</Link>
        </Button>
      </div>
    </div>
  );
}
