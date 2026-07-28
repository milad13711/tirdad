"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  function handlePhoneSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 900);
  }

  function handleOtpSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 900);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none fixed -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
      />
      <div className="relative z-10 w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-lg font-extrabold"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles size={16} />
          </span>
          تیرداد
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8">
          {step === "phone" ? (
            <>
              <h1 className="mb-2 text-center text-xl font-bold">ورود به حساب کاربری</h1>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                شماره موبایل خود را وارد کنید تا کد تایید برای شما پیامک شود.
              </p>
              <form onSubmit={handlePhoneSubmit}>
                <Label htmlFor="phone">شماره موبایل</Label>
                <div className="relative mb-6">
                  <Phone
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="phone"
                    dir="ltr"
                    inputMode="numeric"
                    placeholder="09xxxxxxxxx"
                    className="pr-11 text-left"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "در حال ارسال کد..." : "دریافت کد تایید"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <h1 className="mb-2 text-center text-xl font-bold">کد تایید را وارد کنید</h1>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                کد ۵ رقمی ارسال‌شده به شماره {phone || "شما"} را وارد کنید.
              </p>
              <form onSubmit={handleOtpSubmit}>
                <Label htmlFor="otp">کد تایید</Label>
                <div className="relative mb-6">
                  <ShieldCheck
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="otp"
                    dir="ltr"
                    inputMode="numeric"
                    placeholder="- - - - -"
                    className="pr-11 text-center tracking-[0.5em]"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "در حال بررسی..." : "ورود"}
                </Button>
              </form>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft size={14} />
                تغییر شماره موبایل
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
