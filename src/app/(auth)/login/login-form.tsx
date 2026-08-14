"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, KeyRound, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteLogo } from "@/components/site/site-logo";

type Mode = "otp" | "password";

function LoginForm({ siteTitle, logoUrl }: { siteTitle: string; logoUrl: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("otp");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goTo(role: string | undefined) {
    const defaultDestination = role === "ADMIN" || role === "STAFF" ? "/admin" : "/dashboard";
    const next = searchParams.get("next") ?? defaultDestination;
    router.push(next);
    router.refresh();
  }

  async function handlePhoneSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطایی رخ داد");
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "کد تایید نادرست است");
      goTo(data.user?.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "شماره موبایل یا رمز عبور اشتباه است");
      goTo(data.user?.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/15 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-1/2 h-[420px] w-[420px] translate-x-1/2 rounded-full bg-primary/10 blur-[110px]"
      />

      <div className="relative z-10 w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 text-lg font-extrabold">
          <SiteLogo logoUrl={logoUrl} siteTitle={siteTitle} />
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_rgba(15,23,42,0.08)]">
          {mode === "otp" && step === "phone" && (
            <>
              <h1 className="mb-2 text-center text-xl font-bold">ورود به حساب کاربری</h1>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                شماره موبایل خود را وارد کنید تا کد تایید برای شما پیامک شود.
              </p>
              <form onSubmit={handlePhoneSubmit}>
                <Label htmlFor="phone">شماره موبایل</Label>
                <div className="relative mb-2">
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
                {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
                <Button type="submit" className={error ? "w-full" : "mt-4 w-full"} disabled={loading}>
                  {loading ? "در حال ارسال کد..." : "دریافت کد تایید"}
                </Button>
              </form>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode("password");
                }}
                className="mt-4 w-full cursor-pointer text-center text-xs text-muted-foreground hover:text-foreground"
              >
                ورود با رمز عبور (کاربران سیستمی)
              </button>
            </>
          )}

          {mode === "otp" && step === "otp" && (
            <>
              <h1 className="mb-2 text-center text-xl font-bold">کد تایید را وارد کنید</h1>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                کد ۵ رقمی ارسال‌شده به شماره {phone || "شما"} را وارد کنید.
              </p>
              <form onSubmit={handleOtpSubmit}>
                <Label htmlFor="otp">کد تایید</Label>
                <div className="relative mb-2">
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
                {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
                <Button type="submit" className={error ? "w-full" : "mt-4 w-full"} disabled={loading}>
                  {loading ? "در حال بررسی..." : "ورود"}
                </Button>
              </form>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep("phone");
                }}
                className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft size={14} />
                تغییر شماره موبایل
              </button>
            </>
          )}

          {mode === "password" && (
            <>
              <h1 className="mb-2 text-center text-xl font-bold">ورود با رمز عبور</h1>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                مخصوص مدیران و پشتیبان‌های پنل — مشتریان از ورود با کد پیامکی استفاده کنند.
              </p>
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="pw-phone">شماره موبایل</Label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="pw-phone"
                      dir="ltr"
                      inputMode="numeric"
                      placeholder="09xxxxxxxxx"
                      className="pr-11 text-left"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pw-password">رمز عبور</Label>
                  <div className="relative">
                    <KeyRound
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="pw-password"
                      dir="ltr"
                      type="password"
                      className="pr-11 text-left"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "در حال بررسی..." : "ورود"}
                </Button>
              </form>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode("otp");
                  setStep("phone");
                }}
                className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft size={14} />
                ورود با کد پیامکی
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function LoginPageClient({ siteTitle, logoUrl }: { siteTitle: string; logoUrl: string }) {
  return (
    <Suspense fallback={null}>
      <LoginForm siteTitle={siteTitle} logoUrl={logoUrl} />
    </Suspense>
  );
}
