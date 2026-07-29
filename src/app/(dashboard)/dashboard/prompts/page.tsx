import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { PromptCard } from "@/components/dashboard/prompt-card";
import { getSession } from "@/lib/auth/session";
import { getActivePrompts } from "@/lib/queries/dashboard";

export default async function PromptsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const prompts = await getActivePrompts();

  return (
    <div>
      <PageHeader
        title="پرامپت‌های رایگان"
        description="پرامپت‌های آماده با نمونه قبل/بعد — کپی کنید و در ابزار هوش مصنوعی دلخواه‌تان استفاده کنید"
      />

      {prompts.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          هنوز پرامپتی اضافه نشده است.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              name={prompt.name}
              type={prompt.type}
              promptText={prompt.promptText}
              demoBeforeUrl={prompt.demoBeforeUrl}
              demoAfterUrl={prompt.demoAfterUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
