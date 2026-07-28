"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NewTicketForm() {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: formData.get("subject"),
          message: formData.get("message"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ثبت تیکت");
      setSent(true);
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ثبت تیکت");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="rounded-xl border border-border bg-card p-6" onSubmit={handleSubmit}>
      <h3 className="mb-5 font-bold">ثبت تیکت جدید</h3>
      <div className="mb-4">
        <Label htmlFor="subject">موضوع</Label>
        <Input id="subject" name="subject" placeholder="موضوع تیکت را وارد کنید" required />
      </div>
      <div className="mb-5">
        <Label htmlFor="message">پیام</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="مشکل یا سوال خود را شرح دهید"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        <Send size={15} />
        {loading ? "در حال ارسال..." : "ارسال تیکت"}
      </Button>
      {error && <p className="mt-3 text-center text-sm text-destructive">{error}</p>}
      {sent && (
        <p className="mt-3 text-center text-sm text-emerald-500">
          تیکت شما با موفقیت ثبت شد.
        </p>
      )}
    </form>
  );
}
