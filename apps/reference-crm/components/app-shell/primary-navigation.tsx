"use client";

import { usePathname } from "next/navigation";

import { Link } from "@/components/ui/link";

const destinations = [
  { href: "/clients", label: "Clients" },
  { href: "/settings/appearance", label: "Settings" },
] as const;

export function PrimaryNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="primary-navigation">
      {destinations.map((destination) => {
        const active = pathname.startsWith(destination.href);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            href={destination.href}
            key={destination.href}
            variant="standalone"
          >
            {destination.label}
          </Link>
        );
      })}
    </nav>
  );
}
