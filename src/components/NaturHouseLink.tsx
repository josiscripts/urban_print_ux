import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

type NaturHouseLinkProps = {
  className?: string;
  compact?: boolean;
  onClick?: () => void;
};

const LEAVES = ["leaf-a", "leaf-b", "leaf-c", "leaf-d", "leaf-e", "leaf-f"] as const;

export function NaturHouseLink({ className, compact = false, onClick }: NaturHouseLinkProps) {
  return (
    <Link
      to="/naturhouse"
      onClick={onClick}
      aria-label="Ir a la experiencia Natur House"
      className={cn("naturhouse-link", compact && "naturhouse-link-compact", className)}
    >
      <span className="naturhouse-leaves" aria-hidden>
        {LEAVES.map((leaf) => (
          <svg key={leaf} className={`naturhouse-leaf ${leaf}`} viewBox="0 0 20 12">
            <path d="M1 10.5C3.8 2.2 10.6.2 19 1.4c-2.8 7.8-9.4 10.8-18 9.1Z" fill="currentColor" />
            <path
              d="M2.2 9.7c4.2-3 8.1-5.1 13.2-6.8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        ))}
      </span>
      <span className="relative z-10">NT · Natur House</span>
      <span
        className="relative z-10 transition-transform duration-500 group-hover:translate-x-0.5"
        aria-hidden
      >
        →
      </span>
    </Link>
  );
}
