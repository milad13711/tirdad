"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { KeyRound, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Role = "ADMIN" | "STAFF";

interface SystemUser {
  id: string;
  phone: string;
  name: string | null;
  role: Role;
  hasPassword: boolean;
}

const ROLE_LABEL: Record<Role, string> = { ADMIN: "مدیر کل", STAFF: "پشتیبان" };

export function SystemUsersPanel({ users, currentUserId }: { users: SystemUser[]; currentUserId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.get("phone"),
          name: formData.get("name"),
          role: formData.get("role"),
          password: formData.get("password") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ایجاد کاربر");
      (event.currentTarget as HTMLFormElement).reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ایجاد کاربر");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-4">
        {users.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">هنوز کاربر سیستمی‌ای ثبت نشده است.</p>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <UserRow key={user.id} user={user} isSelf={user.id === currentUserId} />
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleCreate} className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <UserPlus size={16} className="text-primary" />
          <h3 className="font-bold">افزودن کاربر سیستمی</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="su-phone">شماره موبایل</Label>
            <Input id="su-phone" name="phone" dir="ltr" required />
          </div>
          <div>
            <Label htmlFor="su-name">نام (اختیاری)</Label>
            <Input id="su-name" name="name" />
          </div>
          <div>
            <Label htmlFor="su-role">سطح دسترسی</Label>
            <select
              id="su-role"
              name="role"
              defaultValue="STAFF"
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="STAFF">پشتیبان</option>
              <option value="ADMIN">مدیر کل</option>
            </select>
          </div>
          <div>
            <Label htmlFor="su-password">رمز عبور (اختیاری)</Label>
            <Input id="su-password" name="password" type="password" dir="ltr" minLength={6} />
          </div>
        </div>
        <Button type="submit" size="sm" disabled={loading} className="mt-4">
          {loading ? "در حال افزودن..." : "افزودن کاربر"}
        </Button>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </form>
    </div>
  );
}

function UserRow({ user, isSelf }: { user: SystemUser; isSelf: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  async function handleRoleChange(role: Role) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در تغییر سطح دسترسی");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در تغییر سطح دسترسی");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, password: formData.get("password") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در تغییر رمز عبور");
      setShowPasswordForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در تغییر رمز عبور");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`کاربر «${user.name || user.phone}» حذف شود؟`)) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/users?id=${user.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm font-medium">
              {user.name || "—"} {isSelf && <span className="text-xs text-muted-foreground">(خودت)</span>}
            </div>
            <div dir="ltr" className="text-xs text-muted-foreground">
              {user.phone}
            </div>
          </div>
          <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{ROLE_LABEL[user.role]}</Badge>
          {!user.hasPassword && <Badge variant="outline">فقط OTP</Badge>}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={user.role}
            onChange={(e) => handleRoleChange(e.target.value as Role)}
            disabled={loading || isSelf}
            className="h-8 rounded-md border border-border bg-background px-2 text-xs outline-none focus:border-primary"
          >
            <option value="STAFF">پشتیبان</option>
            <option value="ADMIN">مدیر کل</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => setShowPasswordForm((v) => !v)} disabled={loading}>
            <KeyRound size={13} />
            رمز عبور
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete} disabled={loading || isSelf}>
            <Trash2 size={13} className="text-destructive" />
          </Button>
        </div>
      </div>

      {showPasswordForm && (
        <form onSubmit={handlePasswordSubmit} className="mt-3 flex items-center gap-2">
          <Input name="password" type="password" dir="ltr" minLength={6} placeholder="رمز عبور جدید" required className="h-8 max-w-56" />
          <Button type="submit" size="sm" disabled={loading}>
            ثبت
          </Button>
        </form>
      )}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
