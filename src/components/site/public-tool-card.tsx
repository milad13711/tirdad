import Link from "next/link";
import { Download, Package } from "lucide-react";
import { formatToman } from "@/lib/format";

export interface PublicToolPackage {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  coverImage: string | null;
  price: number;
}

export function PublicToolCard({ toolPackage }: { toolPackage: PublicToolPackage }) {
  return (
    <Link
      href={`/tools/${toolPackage.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50"
    >
      <div className="aspect-video w-full overflow-hidden bg-secondary">
        {toolPackage.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={toolPackage.coverImage}
            alt={toolPackage.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Package size={32} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-2 text-lg font-bold leading-8 transition-colors group-hover:text-primary">
          {toolPackage.title}
        </h3>
        {toolPackage.category && (
          <span className="mb-6 w-fit text-sm text-muted-foreground">{toolPackage.category}</span>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-5">
          <span className="text-lg font-extrabold">
            {toolPackage.price === 0 ? "رایگان" : formatToman(toolPackage.price)}
          </span>
          <span className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-primary transition-colors group-hover:border-primary/50">
            <Download size={14} />
            دانلود
          </span>
        </div>
      </div>
    </Link>
  );
}
