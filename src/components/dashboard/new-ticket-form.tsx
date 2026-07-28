"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NewTicketForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      className="rounded-xl border border-border bg-card p-6"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <h3 className="mb-5 font-bold">ثبت تیکت جدید</h3>
      <div className="mb-4">
        <Label htmlFor="subject">موضوع</Label>
        <Input id="subject" placeholder="موضوع تیکت را وارد کنید" required />
      </div>
      <div className="mb-5">
        <Label htmlFor="message">پیام</Label>
        <Textarea id="message" placeholder="مشکل یا سوال خود را شرح دهید" required />
      </div>
      <Button type="submit" className="w-full">
        <Send size={15} />
        ارسال تیکت
      </Button>
      {sent && (
        <p className="mt-3 text-center text-sm text-emerald-500">
          تیکت شما با موفقیت ثبت شد.
        </p>
      )}
    </form>
  );
}
