import { POLICIES, POLICY_ORDER } from "@/lib/policies-content";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Truck, RotateCcw, Shield, FileText } from "lucide-react";

const ICONS = { truck: Truck, rotate: RotateCcw, shield: Shield, file: FileText };

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES[slug];
  return policy ? { title: policy.title } : {};
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) notFound();

  const Icon = ICONS[policy.icon];

  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-5xl mx-auto">
        <nav className="text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-1.5">/</span>
          <span>{policy.title}</span>
        </nav>

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-4">
            {/* Sidebar nav */}
            <aside className="md:col-span-1 bg-muted/30 border-b md:border-b-0 md:border-r p-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Policies
              </p>
              <div className="space-y-1">
                {POLICY_ORDER.map((key) => {
                  const p = POLICIES[key];
                  const ItemIcon = ICONS[p.icon];
                  const active = key === slug;
                  return (
                    <Link
                      key={key}
                      href={`/policies/${key}`}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <ItemIcon size={16} />
                      {p.title}
                    </Link>
                  );
                })}
              </div>
            </aside>

            {/* Content */}
            <div className="md:col-span-3 p-6 md:p-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-primary" />
                </div>
                <h1 className="font-display text-2xl md:text-3xl">{policy.title}</h1>
              </div>
              <p className="text-xs text-muted-foreground mb-8 ml-14">
                Last updated:{" "}
                {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>

              <div className="space-y-6">
                {policy.sections.map((section, i) => (
                  <div key={i} className="border-b last:border-0 pb-6 last:pb-0">
                    <h2 className="font-display text-lg mb-2">{section.heading}</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-muted/50 rounded-lg p-4 text-sm">
                <p className="text-muted-foreground">
                  Have a question that isn't answered here?{" "}
                  <Link href="/contact" className="text-primary underline">
                    Contact our support team
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}