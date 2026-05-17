import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/users", label: "Users" },
  { href: "/reads", label: "Reads" },
  { href: "/activities", label: "Activities" },
  { href: "/notifications", label: "Notifications" },
  { href: "/feedback", label: "Feedback" },
  { href: "/settings", label: "App Settings" },
  { href: "/push-tokens", label: "Push Tokens" },
];

export function AdminShell({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <main className="min-h-screen bg-pink-50 text-stone-900">
      <header className="border-b border-pink-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-pink-600">Girly Vibes</p>
              <h1 className="text-2xl font-bold text-stone-950">{title}</h1>
            </div>
            <LogoutButton />
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full border border-pink-100 bg-pink-50 px-4 py-2 text-sm font-medium text-pink-700 transition hover:bg-pink-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</section>
    </main>
  );
}
