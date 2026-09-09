import Image from "next/image";
import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`} aria-label="Purs & Gold home">
      <Image
        src="/brand/logo-tile.png"
        alt="Purs & Gold"
        width={112}
        height={95}
        priority
        className="h-10 w-auto rounded-md"
      />
      <span className="sr-only">Purs &amp; Gold Limited</span>
    </Link>
  );
}
