import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { PromptCard } from "@/components/dashboard/prompt-card";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { getActivePrompts } from "@/lib/queries/dashboard";

export default async function PromptsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const prompts = await getActivePrompts(session.sub);

  return (
    <div>
      <PageHeader
        title="پرامپت‌های من"
        description="پرامپت‌های رایگان و پریمیوم خریداری‌شده شما — کپی کنید و در ابزار هوش مصنوعی دلخواه‌تان استفاده کنید"
      />

      {prompts.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          <p className="mb-4">هنوز پرامپتی اضافه نشده است.</p>
          <Button asChild>
            <Link href="/prompts">مشاهده گالری پرامپت‌ها</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              name={prompt.name}
              type={prompt.type}
              promptText={prompt.promptText}
              usageInstructions={prompt.usageInstructions}
              price={prompt.price}
              demoBeforeUrl={prompt.demoBeforeUrl}
              demoAfterUrl={prompt.demoAfterUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
